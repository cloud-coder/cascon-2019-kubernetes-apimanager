# 2 Kubernetes Service Creation 

## Loading the IBM Cloud Container Registry
The IBM Cloud Container Registry allows you to store images in your private registry.  See https://cloud.ibm.com/kubernetes/registry/main/start for the WebUI.
We will be creating 3 images from this git repository.

### Set up namespace
1. Create a namespace in the container registry to associate the images you will load into the directory.

    ```
    ibmcloud cr namespace-add cas2019
    ```

2. Verify that is was correctly added.

    ```
    ibmcloud cr namespace-list
    ```

### Obtain the code
1. Clone this repository with git.

    ```
    git clone git@github.com:cloud-coder/cascon-2019-kubernetes-apimanager.git (ssh)
    git clone https://github.com/cloud-coder/cascon-2019-kubernetes-apimanager.git (https)
    ```

### Create Images
1. For each of the folders, we need to create docker images and deploy them to the registry.

    ```
    cd account
    ibmcloud cr build -t us.icr.io/cas2019/account:1 .
    cd ../provider
    ibmcloud cr build -t us.icr.io/cas2019/provider:1 .
    cd ../monthlycost
    ibmcloud cr build -t us.icr.io/cas2019/monthlycost:1 .
    ```

1. Verify the images are available

    ```
    ibmcloud cr images
    ```

## Deploy into the Kubernetes Cluster

1. Create Deployments

    ```
    kubectl create deployment dep-account --image=us.icr.io/cas2019/account:1
    kubectl create deployment dep-provider --image=us.icr.io/cas2019/provider:1
    kubectl create deployment dep-monthlycost --image=us.icr.io/cas2019/monthlycost:1
    ```

1. Create Services for the account and provider services as internal services.

    ```
    kubectl expose deployment/dep-account --type=ClusterIP --name=account-service --port=8080
    kubectl expose deployment/dep-provider --type=ClusterIP --name=provider-service --port=8080
    ```

1. Expose the last deployment using a NodePort

    ```
    kubectl expose deployment/dep-monthlycost --type=NodePort --port=8080 --name=monthlycost-service --target-port=8080
    ```

1. Verify everything is running.

    ```
    kubectl get pods -o wide
    kubectl get services -o wide
    kubectl get deployments -o wide
    ```

1. Determine the cluster public IP by checking with IBM cloud services

    ```
    ibmcloud ks cluster ls
    ibmcloud ks workers <clusterid>
    ```

1. As there is only one node in the cluster, the public IP is also shown as the external IP the node.

    ```
    k get nodes -o wide
    ```

1. Determine the port for our external facing monthlycost service.  Because we specified it with type Nodeport, it will be allocated a port in the (30,000-32767) range.  Check the ports column
for the  external value (after the colon).

    ```
    k get services -o wide
    ```

1. Access the url from a web browser.

    ```
    eg. http://173.193.92.194:30507
    ```
