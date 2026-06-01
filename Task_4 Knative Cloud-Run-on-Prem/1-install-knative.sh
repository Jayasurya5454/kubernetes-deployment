#!/bin/bash
# =============================================================================
# STEP 1 — Install Knative Serving + Kourier on your local K8s cluster
#
# WHY Knative Serving?
#   Knative Serving is the exact open-source project Google Cloud Run is built
#   on. It adds 3 things K8s doesn't have natively:
#     1. Scale-to-zero  — pods shut down when idle, start on first request
#     2. Revisions      — every deploy creates a snapshot; roll back instantly
#     3. Traffic split  — send 10% to v2 while 90% stays on v1 (canary)
#
# WHY Kourier?
#   Knative needs an ingress gateway to route HTTP to the right revision.
#   Options: Istio (full service mesh, heavy), Contour, or Kourier (lightweight,
#   purpose-built for Knative). We use Kourier for local clusters.
#
# WHAT this script does — in order:
#   1. Install Knative Serving CRDs   (teaches K8s what a "KnativeService" is)
#   2. Install Knative Serving core   (the controller that watches those CRDs)
#   3. Install Kourier                (the ingress gateway)
#   4. Patch Knative to use Kourier   (tell Knative which gateway to use)
#   5. Configure DNS for local use    (sslip.io — maps IPs to DNS automatically)
# =============================================================================

set -e  # stop on first error

echo ">>> [1/5] Installing Knative Serving CRDs..."
# CRDs = Custom Resource Definitions. This is how K8s learns new object types.
# After this, `kubectl get ksvc` will work (even though no services exist yet).
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-crds.yaml

echo ">>> [2/5] Installing Knative Serving core components..."
# This installs the controller, webhook, and autoscaler pods in knative-serving namespace.
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-core.yaml

echo ">>> [3/5] Installing Kourier ingress..."
# Kourier creates an Envoy proxy that Knative routes traffic through.
kubectl apply -f https://github.com/knative/net-kourier/releases/download/knative-v1.13.0/kourier.yaml

echo ">>> [4/5] Configuring Knative to use Kourier as ingress..."
# This patches the config-network ConfigMap in knative-serving namespace.
# Without this, Knative doesn't know a gateway exists.
kubectl patch configmap/config-network \
  --namespace knative-serving \
  --type merge \
  --patch '{"data":{"ingress-class":"kourier.ingress.networking.knative.dev"}}'

echo ">>> [5/5] Configuring sslip.io DNS (works without a real domain)..."
# sslip.io is a public DNS service: 192.168.1.100.sslip.io → 192.168.1.100
# This means your Knative services get real DNS names automatically.
# Format: <service>.<namespace>.<your-ip>.sslip.io
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-default-domain.yaml

echo ""
echo ">>> Waiting for Knative Serving to be ready..."
kubectl wait --for=condition=Ready pod --all -n knative-serving --timeout=120s

echo ""
echo "✓ Knative is installed! Run: kubectl get pods -n knative-serving"
echo "✓ Run: kubectl get pods -n kourier-system"
