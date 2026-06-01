# Task 4 — Cloud Run on Prem with Knative

## What is this?

Google Cloud Run is built on top of **Knative**. This task sets up the same
infrastructure on your local Kubernetes cluster — so you get:

- Scale-to-zero (pods shut down when idle, wake up on first request)
- Revisions (every deploy is a snapshot; rollback in seconds)
- Traffic splitting (canary deploys: 90% stable / 10% new)
- Automatic URLs per service (no Ingress YAML needed)

---

## Architecture Diagram

```
You (curl / browser)
        │
        ▼
┌─────────────────┐
│  Kourier Gateway │  ← the only public entry point (like a Cloud Run frontend)
│  (Envoy proxy)   │    runs in "kourier-system" namespace
└────────┬────────┘
         │  routes by Host header: portfolio.default.<ip>.sslip.io
         ▼
┌─────────────────────────────────┐
│        Knative Serving           │  ← runs in "knative-serving" namespace
│                                  │
│  Route ──► Revision-00001 (90%) │  ← old stable pods
│        └──► Revision-00002 (10%)│  ← new canary pods
└─────────────────────────────────┘
         │
         ▼
   Kubernetes Pods  (scale 0 → N based on concurrent requests)
```

---

## Cloud Run → Knative Concept Mapping

| Cloud Run concept         | Knative equivalent                  |
|---------------------------|-------------------------------------|
| `gcloud run deploy`       | `kubectl apply -f ksvc.yaml`        |
| Service                   | `kind: Service` (serving.knative.dev/v1) |
| Revision                  | Revision (auto-created on each deploy) |
| Traffic splitting         | `spec.traffic[]` in ksvc            |
| `--min-instances`         | `autoscaling.knative.dev/minScale`  |
| `--max-instances`         | `autoscaling.knative.dev/maxScale`  |
| `--concurrency`           | `autoscaling.knative.dev/target`    |
| `--timeout`               | `spec.template.spec.timeoutSeconds` |
| Scale-to-zero             | `minScale: "0"` (default)           |
| Cloud Run URL             | `<svc>.<ns>.<ip>.sslip.io`          |

---

## How to Run (Step by Step)

### Prerequisites
- minikube, kind, or k3s running
- `kubectl` configured and connected to your cluster

### Step 1 — Install Knative

```bash
# Make the install script executable and run it
chmod +x 1-install-knative.sh
./1-install-knative.sh

# Verify all Knative pods are running
kubectl get pods -n knative-serving
kubectl get pods -n kourier-system
```

Expected output — all pods should show `Running`:
```
NAME                                      READY   STATUS    RESTARTS
activator-xxxxxxxxx-xxxxx                 1/1     Running   0
autoscaler-xxxxxxxxx-xxxxx                1/1     Running   0
controller-xxxxxxxxx-xxxxx                1/1     Running   0
webhook-xxxxxxxxx-xxxxx                   1/1     Running   0
```

### Step 2 — Configure DNS

```bash
# Find your cluster IP
minikube ip          # for minikube
# OR
kubectl get nodes -o wide  # look at EXTERNAL-IP or INTERNAL-IP

# Edit 4-local-domain-config.yaml — replace 192.168.49.2 with your actual IP
# Then apply:
kubectl apply -f 4-local-domain-config.yaml
```

For minikube — also run in a **separate terminal** (keep it running):
```bash
minikube tunnel
```

### Step 3 — Deploy the Portfolio as a Knative Service

```bash
kubectl apply -f 2-portfolio-ksvc.yaml

# Watch it deploy
kubectl get ksvc portfolio

# Output:
# NAME        URL                                          LATESTCREATED      LATESTREADY        READY
# portfolio   http://portfolio.default.192.168.49.2.sslip.io   portfolio-00001   portfolio-00001   True
```

### Step 4 — Test it

```bash
# Get the URL
kubectl get ksvc portfolio -o jsonpath='{.status.url}'

# Curl it
curl http://portfolio.default.<your-ip>.sslip.io

# Watch scale-to-zero in action:
# 1. Wait 60 seconds — Knative scales pods to 0
kubectl get pods  # should show 0 pods for portfolio

# 2. Curl the URL — cold start kicks in
curl http://portfolio.default.<your-ip>.sslip.io
# Takes ~2-5 seconds (cold start), then responds

# 3. Check pods again — pod is back
kubectl get pods  # portfolio pod is Running again
```

### Step 5 — Try a Canary Deploy

```bash
# Edit 3-canary-traffic-split.yaml:
# - Set revisionName to your current revision (get it with: kubectl get revisions)
# - Update the image to a new tag

# Apply traffic split: 90% stable, 10% canary
kubectl apply -f 3-canary-traffic-split.yaml

# Check the split
kubectl get ksvc portfolio -o yaml | grep -A 10 traffic

# Access canary directly (bypass the split):
curl http://canary-portfolio.default.<your-ip>.sslip.io
```

---

## Key kubectl Commands for Knative

```bash
# List all Knative services
kubectl get ksvc

# See all revisions ever deployed
kubectl get revisions

# Describe a service (see URL, traffic %, conditions)
kubectl describe ksvc portfolio

# Watch autoscaler logs (see scale-to-zero decisions happening)
kubectl logs -n knative-serving -l app=autoscaler -f

# Watch activator logs (handles requests during cold start)
kubectl logs -n knative-serving -l app=activator -f

# Delete the service
kubectl delete ksvc portfolio
```

---

## Files in this folder

| File | Purpose |
|------|---------|
| `1-install-knative.sh` | Installs Knative Serving + Kourier on your cluster |
| `2-portfolio-ksvc.yaml` | Deploys Portfolio as a Knative Service (scale-to-zero enabled) |
| `3-canary-traffic-split.yaml` | Example: 90/10 traffic split between two revisions |
| `4-local-domain-config.yaml` | Configures sslip.io DNS for local cluster access |

---

## Why Knative over plain Deployment + HPA?

| Feature | Deployment + HPA | Knative |
|---------|-----------------|---------|
| Scale-to-zero | No (HPA min=1) | Yes |
| Revision history | No | Yes (immutable snapshots) |
| Traffic splitting | Complex (needs Istio/NGINX) | Built-in |
| URL per service | Manual Ingress | Automatic |
| Cold start handling | N/A | Activator buffers requests |
| Setup complexity | Low | Medium (Knative + gateway) |

**Choose Knative** when you want Cloud Run-like developer experience on-prem.  
**Choose plain Deployment** when you need simplicity and don't need scale-to-zero.
