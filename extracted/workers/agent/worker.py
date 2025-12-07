import os, time, json
import redis

REDIS_URL = os.getenv("REDIS_URL","redis://localhost:6379/0")
QUEUE = os.getenv("QUEUE","x_stream")

r = redis.from_url(REDIS_URL)

print(f"[agent] listening on {QUEUE}")
while True:
    msg = r.blpop(QUEUE, timeout=5)
    if msg:
        _, payload = msg
        try:
            data = json.loads(payload)
        except Exception:
            data = {"raw": payload.decode("utf-8","ignore")}
        print("[agent] processing:", data.get("id") or data.get("text") or "event")
        # TODO: summarize/repurpose/post
    else:
        time.sleep(0.5)
