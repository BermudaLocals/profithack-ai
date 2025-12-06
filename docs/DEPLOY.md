# Deploy Guide (Staging → Prod)

1. Copy `.env.example` to `.env` and set secrets.
2. Local quick start:
   ```bash
   make build && make run
   ```
3. Add X rules env:
   ```bash
   export X_RULES='["chatgpt","creator economy"]'
   export X_BEARER_TOKEN=YOUR_TOKEN
   ```
4. Kubernetes:
   - Build & push images to your registry.
   - Update `deploy/helm/profithackai/values.yaml`.
   - `helm upgrade --install profithackai deploy/helm/profithackai -n prod`
5. Observability:
   - Scrape `/metrics` from API via Prometheus.
6. Rollback:
   - `helm rollback profithackai <REVISION>`
