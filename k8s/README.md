# Kubernetes Deployment Guide

## Prerequisites

1. **Kubernetes cluster** (GKE, EKS, AKS, or local k8s)
2. **kubectl** configured to access your cluster
3. **GitHub Container Registry** access configured
4. **Required secrets**:
   - X_BEARER_TOKEN (Twitter/X API)
   - REDIS_URL (Upstash or Redis Cloud)
   - DATABASE_URL (PostgreSQL connection string)

## Setup Steps

### 1. Create GitHub Container Registry Pull Secret

```bash
kubectl create secret docker-registry ghcr-login-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_PAT \
  --docker-email=YOUR_EMAIL \
  -n profithackai
```

### 2. Update Secrets

Edit `k8s/x-streamer-deployment.yaml` and replace:
- `YOUR_X_BEARER_TOKEN_HERE` with your Twitter/X Bearer Token
- `YOUR_REDIS_URL_HERE` with your Upstash Redis URL
- `YOUR_DATABASE_URL_HERE` with your PostgreSQL connection string

**For production**, use external secret management:
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [External Secrets Operator](https://external-secrets.io/)
- [HashiCorp Vault](https://www.vaultproject.io/)

### 3. Update Image Repository

In `k8s/x-streamer-deployment.yaml`, replace:
```yaml
image: ghcr.io/YOUR_GITHUB_USERNAME/x-streamer:latest
```

### 4. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/x-streamer-deployment.yaml

# Check deployment status
kubectl get pods -n profithackai
kubectl logs -f deployment/x-streamer -n profithackai

# Check if streaming is working
kubectl logs -f deployment/x-streamer -n profithackai | grep "forwarded tweet"
```

### 5. Monitor

```bash
# Check pod status
kubectl get pods -n profithackai -w

# View logs
kubectl logs -f deployment/x-streamer -n profithackai

# Describe pod (for troubleshooting)
kubectl describe pod -l app=x-streamer -n profithackai

# Check events
kubectl get events -n profithackai --sort-by='.lastTimestamp'
```

## Scaling

X-Streamer should run as a **single replica** to avoid duplicate tweet processing:

```yaml
spec:
  replicas: 1
  strategy:
    type: Recreate
```

## Resource Management

Current resource allocation:
- **Requests**: 128Mi RAM, 100m CPU
- **Limits**: 512Mi RAM, 500m CPU

Adjust based on your traffic:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "200m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Troubleshooting

### Pod not starting
```bash
kubectl describe pod -l app=x-streamer -n profithackai
kubectl logs -l app=x-streamer -n profithackai --previous
```

### Connection issues
```bash
# Test Redis connection
kubectl exec -it deployment/x-streamer -n profithackai -- python3 -c "import redis; r = redis.from_url('$REDIS_URL'); print(r.ping())"

# Test PostgreSQL connection
kubectl exec -it deployment/x-streamer -n profithackai -- python3 -c "import psycopg; conn = psycopg.connect('$DATABASE_URL'); print(conn.info.status)"
```

### Image pull errors
```bash
# Verify secret exists
kubectl get secret ghcr-login-secret -n profithackai

# Recreate if needed
kubectl delete secret ghcr-login-secret -n profithackai
# Then recreate with correct credentials
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/build-x-streamer.yml`) automatically:

1. **Builds** the Docker image on push to main/master
2. **Pushes** to GitHub Container Registry
3. **Tags** with branch name, SHA, and `latest`
4. **Multi-platform** builds (linux/amd64, linux/arm64)

To trigger deployment after build:
```bash
# Update image tag in deployment
kubectl set image deployment/x-streamer \
  x-streamer=ghcr.io/YOUR_GITHUB_USERNAME/x-streamer:latest \
  -n profithackai

# Or apply the full manifest again
kubectl apply -f k8s/x-streamer-deployment.yaml
```

## Auto-deployment with ArgoCD (Optional)

For GitOps-based deployment:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: x-streamer
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/YOUR_USERNAME/profithackai
    targetRevision: HEAD
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: profithackai
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Production Best Practices

1. **Use External Secrets** - Don't commit secrets to Git
2. **Enable Resource Quotas** - Prevent resource exhaustion
3. **Set up Monitoring** - Prometheus + Grafana for metrics
4. **Configure Alerts** - Alert on pod restarts, high memory usage
5. **Implement Health Checks** - Liveness and readiness probes
6. **Use Network Policies** - Restrict traffic between pods
7. **Enable Pod Security Policies** - Harden container security
8. **Backup Strategy** - Regular database backups
