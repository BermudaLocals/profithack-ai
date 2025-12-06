import os, json, time, requests, redis

BEARER = os.environ.get("X_BEARER_TOKEN")
RULES = json.loads(os.environ.get("X_RULES","[]"))
REDIS_URL = os.environ.get("REDIS_URL","redis://redis:6379/0")
STREAM_URL = "https://api.twitter.com/2/tweets/search/stream"

r = redis.from_url(REDIS_URL)

def auth_headers():
    return {"Authorization": f"Bearer {BEARER}"}

def set_rules():
    if not BEARER:
        print("Missing X_BEARER_TOKEN"); return
    existing = requests.get(f"{STREAM_URL}/rules", headers=auth_headers()).json()
    ids = [r['id'] for r in existing.get('data',[])]
    if ids:
        requests.post(f"{STREAM_URL}/rules", headers=auth_headers(), json={"delete":{"ids":ids}})
    if RULES:
        requests.post(f"{STREAM_URL}/rules", headers=auth_headers(), json={"add":[{"value":q} for q in RULES]})

def stream():
    with requests.get(STREAM_URL, headers=auth_headers(), stream=True, params={"tweet.fields":"created_at,lang"}) as resp:
        resp.raise_for_status()
        for line in resp.iter_lines():
            if not line:
                continue
            try:
                event = json.loads(line)
            except Exception:
                continue
            data = event.get("data")
            if not data: 
                continue
            tweet_id = data.get("id")
            key = f"tweet:{tweet_id}"
            if r.get(key): # dedupe
                continue
            r.setex(key, 3600*24, "1")
            r.rpush("x_stream", json.dumps({
                "id": tweet_id,
                "text": data.get("text"),
                "lang": data.get("lang"),
                "created_at": data.get("created_at")
            }))
            print("[x] forwarded", tweet_id)

if __name__ == "__main__":
    set_rules()
    while True:
        try:
            stream()
        except Exception as e:
            print("stream error:", e)
            time.sleep(5)
