import os, sys, time, json, logging, signal
from typing import List
import requests
import redis
import psycopg

BEARER = os.getenv("X_BEARER_TOKEN", "").strip()
RULES = os.getenv("X_RULES", "[]")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
POSTGRES_URL = os.getenv("POSTGRES_URL", "").strip()
QUEUE_KEY = os.getenv("X_QUEUE_KEY", "x_stream")
NS = os.getenv("X_NS", "phx")

STREAM_URL = "https://api.twitter.com/2/tweets/search/stream"
RULES_URL = STREAM_URL + "/rules"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("x_ingestor")

def auth_headers():
    if not BEARER:
        raise RuntimeError("Missing X_BEARER_TOKEN in env")
    return {"Authorization": f"Bearer {BEARER}"}

def parse_rules(env: str) -> List[str]:
    try:
        if env.strip().startswith('['):
            return json.loads(env)
        return [s.strip() for s in env.split(",") if s.strip()]
    except Exception as e:
        log.error("Failed to parse X_RULES: %s", e)
        return []

def connect_redis(url: str):
    r = redis.from_url(url, decode_responses=False)
    r.ping()
    return r

def connect_pg(url: str):
    if not url:
        return None
    try:
        return psycopg.connect(url, autocommit=True)
    except Exception as e:
        log.warning("Postgres not available: %s", e)
        return None

def ensure_rules(desired):
    resp = requests.get(RULES_URL, headers=auth_headers(), timeout=30)
    resp.raise_for_status()
    existing = resp.json().get("data", [])
    existing_vals = set([d.get("value") for d in existing if "value" in d])
    desired_set = set([d for d in desired if d])
    to_delete = [d.get("id") for d in existing if d.get("value") not in desired_set]
    to_add = [v for v in desired_set if v not in existing_vals]
    if to_delete:
        d = requests.post(RULES_URL, headers=auth_headers(), json={"delete": {"ids": to_delete}}, timeout=30)
        d.raise_for_status()
    if to_add:
        a = requests.post(RULES_URL, headers=auth_headers(), json={"add": [{"value": v} for v in to_add]}, timeout=30)
        a.raise_for_status()

def upsert_trending(pg_conn, text: str):
    if not pg_conn or not text:
        return
    import re
    words = [w.lower() for w in re.findall(r"[A-Za-z0-9#@_]{3,24}", text)]
    for w in words:
        weight = 2.0 if w.startswith("#") or w.startswith("@") else 1.0
        try:
            pg_conn.execute(
                """insert into trending_topics(keyword, score, last_seen_at)
                   values (%s, %s, now())
                   on conflict (keyword) do update set
                     score = trending_topics.score + excluded.score,
                     last_seen_at = excluded.last_seen_at""",
                (w, weight),
            )
        except Exception:
            pass

def stream_loop(rconn, pg_conn):
    backoff = 1.0
    while True:
        try:
            params = {
                "tweet.fields": "created_at,lang,public_metrics,author_id",
                "expansions": "author_id",
                "user.fields": "username,name",
            }
            with requests.get(STREAM_URL, headers=auth_headers(), params=params, stream=True, timeout=90) as resp:
                resp.raise_for_status()
                log.info("Connected to X stream")
                backoff = 1.0
                for line in resp.iter_lines():
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                    except Exception:
                        continue
                    data = obj.get("data")
                    includes = obj.get("includes", {})
                    if not data:
                        continue
                    tweet_id = data.get("id")
                    text = data.get("text","")
                    lang = data.get("lang")
                    created_at = data.get("created_at")
                    pub = data.get("public_metrics", {}) or {}
                    author_id = data.get("author_id")
                    username = None
                    for u in includes.get("users", []):
                        if u.get("id") == author_id:
                            username = u.get("username")
                            break
                    k = f"{NS}:tweet:{tweet_id}"
                    if rconn.set(k, b"1", ex=86400, nx=True) is None:
                        continue
                    payload = {
                        "id": tweet_id,
                        "text": text,
                        "lang": lang,
                        "created_at": created_at,
                        "author_id": author_id,
                        "username": username,
                        "likes": pub.get("like_count"),
                        "retweets": pub.get("retweet_count"),
                        "replies": pub.get("reply_count"),
                        "quotes": pub.get("quote_count"),
                    }
                    rconn.rpush(os.getenv("X_QUEUE_KEY","x_stream"), json.dumps(payload).encode("utf-8"))
                    upsert_trending(pg_conn, text)
                    log.info("forwarded tweet %s by @%s", tweet_id, username or "?")
        except (requests.HTTPError, requests.ConnectionError, requests.Timeout) as e:
            log.warning("Stream error: %s", e)
            backoff = min(backoff * 2.0, 60.0)
            time.sleep(backoff)
        except Exception as e:
            log.error("Fatal error: %s", e)
            time.sleep(5)

def main():
    rules = parse_rules(RULES)
    if not rules:
        log.warning("No X_RULES provided; defaulting to ['ai','chatgpt']")
        rules = ["ai", "chatgpt"]
    rconn = connect_redis(REDIS_URL)
    pg_conn = connect_pg(POSTGRES_URL)
    ensure_rules(rules)

    def _sig(*_):
        log.info("Shutting down…"); sys.exit(0)
    for s in (signal.SIGINT, signal.SIGTERM):
        signal.signal(s, _sig)

    stream_loop(rconn, pg_conn)

if __name__ == "__main__":
    main()
