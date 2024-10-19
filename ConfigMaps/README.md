# ConfigMaps in Kubernetes

## Introduction

ConfigMaps are a Kubernetes resource used to store non-confidential data in key-value pairs. They are useful for separating configuration artifacts from image content to keep containerized applications portable.

## Creating a ConfigMap

You can create a ConfigMap using a YAML file or directly from the command line.

### Using a YAML File

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: example-config
data:
    key1: value1
    key2: value2
```

Apply the ConfigMap using `kubectl`:

```sh
kubectl apply -f configmap.yaml
```

### From the Command Line

```sh
kubectl create configmap example-config --from-literal=key1=value1 --from-literal=key2=value2
```

## Using ConfigMaps

You can use ConfigMaps in your pods in several ways:

### As Environment Variables

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: example-pod
spec:
    containers:
    - name: example-container
        image: nginx
        envFrom:
        - configMapRef:
                name: example-config
```

### As Volume Mounts

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: example-pod
spec:
    containers:
    - name: example-container
        image: nginx
        volumeMounts:
        - name: config-volume
            mountPath: /etc/config
    volumes:
    - name: config-volume
        configMap:
            name: example-config
```

## Conclusion

ConfigMaps are a powerful way to manage configuration data in Kubernetes. They help in maintaining clean separation between configuration and code, making applications more portable and easier to manage.
