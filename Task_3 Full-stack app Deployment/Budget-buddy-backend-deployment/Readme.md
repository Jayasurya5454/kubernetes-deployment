# Budget Buddy Backend Deployment

This folder contains the necessary files and instructions to deploy the Budget Buddy backend application on a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster
- `kubectl` command-line tool configured to interact with your cluster

## Deployment Instructions

### Budget Buddy Backend

1. Apply the deployment configuration:
    ```sh
    kubectl apply -f budget-buddy-backend-deployment.yaml
    ```

2. Verify the deployment:
    ```sh
    kubectl get pods -l app=budget-buddy
    ```

3. Apply the service configuration:
    ```sh
    kubectl apply -f budget-buddy-backend-service.yaml
    ```

4. Verify the service:
    ```sh
    kubectl get svc -l app=budget-buddy
    ```

### MongoDB

1. Apply the deployment configuration:
    ```sh
    kubectl apply -f mongodb-deployment.yaml
    ```

2. Verify the deployment:
    ```sh
    kubectl get pods -l app=mongodb
    ```

3. Apply the service configuration:
    ```sh
    kubectl apply -f mongodb-service.yaml
    ```

4. Verify the service:
    ```sh
    kubectl get svc -l app=mongodb
    ```

## Cleanup

To delete all resources associated with the Budget Buddy backend application, run:
```sh
kubectl delete all -l app=budget-buddy
```

To delete all resources associated with MongoDB, run:
```sh
kubectl delete all -l app=mongodb
```
