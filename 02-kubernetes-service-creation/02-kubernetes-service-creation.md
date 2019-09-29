# 2 Kubernetes Service Creation 

Deployment Scenario

In this exercise we are deploying a website that provides cost comparisons for users across different service providers.  The develop teams have worked independently
on 3 projects.  

An *account* application provides information about all the users, including the the service providers they subscribe to.  They provide a single REST api:


    ```
    /user=<userId>
    ```

The *provider* application provides detail on particular costs of their service.  they provide a single REST api:
    ```
    /provider=<providerId>
    ```

The *cost* application integrates information from the other two applications, and provides a summary of the costs for a specific user.  The endpoint renders an html page and accesses the other applications.

    ```
    /costsForUser=<userId>
    ```

Our task is to deploy these services to the IBM Cloud using the command-line interface (CLI) tools provided.

## Loading the IBM Cloud Container Registry
The IBM Cloud Container Registry allows you to store images in your private registry.  See https://cloud.ibm.com/kubernetes/registry/main/start for the WebUI.
We will be storing 3 images created from code available in this git repository.

### Set up namespace

Namespaces provide a way to categorize your docker images within the registry.  Note that these are separate from Kubenetes namespaces.  Namespaces not
found when building images will be added automatically.

1. Create a namespace in the container registry to associate the images you will load into the directory.

    ```
    ibmcloud cr namespace-add cas2019
    ```

2. Verify that is was correctly added.

    ```
    ibmcloud cr namespace-list
    ```

### Obtain the code

The cluster we are setting up will contain our 3 projects (i.e. services). For simplicity we've provided them all in this lab's git repository in the subfolders (account, 
provider, cost).
Each project

1. Clone this repository with git.

    ```
    git clone git@github.com:cloud-coder/cascon-2019-kubernetes-apimanager.git (ssh)
    git clone https://github.com/cloud-coder/cascon-2019-kubernetes-apimanager.git (https)
    ```

### Create Images
1. For each of the folders, we need to create docker images and deploy them to the registry.

This is essentially the docker command, but pushes the images to the IBM Cloud Container Registry.  This is the first time submitting these image repositories
so we will provide it with a tag "1".

    ```
    cd cascon-2019-kubernetes-apimanager/02-kubernetes-service-creation
    cd account
    ibmcloud cr build -t us.icr.io/cas2019/account:1 .
    cd ../provider
    ibmcloud cr build -t us.icr.io/cas2019/provider:1 .
    cd ../cost
    ibmcloud cr build -t us.icr.io/cas2019/cost:1 .
    ```

If you experience quota related issues, you can remove any older images you may have.

    ```
    ibmcloud cr image-rm <image name>
    ```

1. Verify the images are available

You should see the three additional images listed using this command.

    ```
    ibmcloud cr images
    ```

## Deploy into the Kubernetes Cluster

In Kubernetes images are not directly specified to go into containers and deployed to be accessed directly.  Instead, a higher level Kubernetes deployment is created
that defines how you want pods deployed.  A pod is the smallest deployable unit which may contain one or more containers, a running instance of your image.  
For now, we'll create deployments using the default settings.  One pod will be created per deployment by downloading the image you specify in the command.

1. Create Deployments

    ```
    kubectl create deployment dep-account --image=us.icr.io/cas2019/account:1
    kubectl create deployment dep-provider --image=us.icr.io/cas2019/provider:1
    kubectl create deployment dep-cost --image=us.icr.io/cas2019/cost:1
    ```

1. Verify your pod is running.
A successfully deployed pod will in the *running* status.  Each pod is assigned an IP address in the private network and automatically assigned to a node in your 
cluster.  In the IBM Cloud Free Tier, the cluster is only allocated one node, so all pods will be deployed there.  


    ```
    kubectl get pods -o wide
    ```

Each pod is ephemeral, so using the IP address will only be valid for as long as the pod is alive.  Lets delete a pod and see what happens.

    ```
    k delete pod <pod-name>
    ```

Nover check the pods again.  You may need to repeat this command as the pods may take time to refresh.

    ```
    kubectl get pods -o wide
    ```

Notice the original pod name/IP may result in a terminated status, but a new pod is spawn, and a new IP is assigned to it.  Kubernetes attempts to provide you the pod
specified in the deployment that you created earlier automatically.  This also happens if your container fails (eg. due to a software glitch), and will continue 
forever to maintain a running deployment.

1. Create Services for the account and provider services as internal services.

As the pods have dynamically assigned private IPs that can change at any time, it would be difficult to expose them to the outside world without telling the user
what the updated host and port is.  To resolve this, kubernetes provides *services*, an interface that sits in front of pods.  Its job is to give a unique name
that others can reference which it will direct into an available pod.  If a new pod has generated, the service will be aware of it, and direct traffic there.  The port
specified below should match what each application port it is listening on.

    ```
    kubectl expose deployment/dep-account --type=ClusterIP --name=account-service --port=8080
    kubectl expose deployment/dep-provider --type=ClusterIP --name=provider-service --port=8080
    ```

The services above were defined as "ClusterIP" which means that they are only exposed internally, and not available externally.  As we are considering them backend
microservices, this is fine.

1. Expose the last deployment using a NodePort
We will expose the last service externally using a type NodePort, which will assign it an external port number.


    ```
    kubectl expose deployment/dep-cost --type=NodePort --port=8080 --name=cost-service --target-port=8080
    ```

1. Verify everything is running.

    ```
    kubectl get services -o wide
    kubectl get deployments -o wide
    ```

You should notice that all of the services have assigned internal cluster IPs.  The external port is shown in the 30000+ range.

Our cluster now has all 3 microservices deployed. However the cost application is an application that depends on the other microservices, and somehow needs to
reference them properly.  In order for one pod to discover the other pod, it would be difficult as we have already discovered the IPs are dynamic.  The solution 
is that pods should reference the appropriate services.  When each pod is deployed, all currently available services are provided to it.  In our steps above,
the cost pod was created during the deployment creation, but the service creation for account and provider was done afterwards.  This means that the current 
cost pod is not aware of the 2 new services that were created.  To get around this, all we need to do is delete the cost pod so the new one is provided with
the new service information.

1. Delete the cost pod
    ```
    k get pods -o wide
    k delete pod <cost-pod-xxxxxx>
    k get pods -o wide
    ```

1. Determine the cluster public IP by checking with IBM cloud services.

    ```
    ibmcloud ks cluster ls
    ibmcloud ks workers <clusterid>
    ```

1. As there is only one node in the cluster, the public IP is also shown as the external IP the node.

    ```
    k get nodes -o wide
    ```

1. Determine the port for our external facing cost service.  Because we specified it with type Nodeport, it will be allocated a port in the (30,000-32767) range.  
Check the ports column for the  external value (after the colon).

    ```
    k get services -o wide
    ```

1. Access the url from a web browser.

    ```
    eg. http://173.193.92.194:30507
    ```
