# Lab 2 Exploring Kubernetes and Creating a Kubernetes Service Deployment

## Deployment Scenario

In this exercise we are deploying a website that provides cost comparisons for users across different service providers.  The development teams have worked independently
on 3 microservice projects.  

<details>
<summary>Microservice Details</summary>

An *account* microservice provides information about all the users, including the the service providers they subscribe to.  They provide the REST api:

    GET /account           # Returns a health message
    GET /account/<acct_id> # Returns the specific account detail in JSON

The *provider* microservice provides detail on particular costs of their service.  they provide the REST api:

    GET /provider                # Returns a health message
    GET /provider/<provider_id>  # Returns specific provider cost in JSON

The *cost* microservice integrates information from the other two microservices, and provides a summary of the costs for a specific user.  The endpoint renders an html page and accesses the other microservices.

    GET /cost            # Returns a health message
    GET /cost/<cost_id>  # calls the account service to see which providers are associated to the account, then calls each provider to get each cost.  Returns total cost for all providers in JSON

</details>

Our task is to deploy these services to the IBM Cloud using the command-line interface (CLI) tools provided.

## Loading the IBM Cloud Container Registry
The IBM Cloud Container Registry allows you to store images in your private registry.  See https://cloud.ibm.com/kubernetes/registry/main/start for the WebUI.
We will be storing 3 images created from code available in this git repository.

<details>
<summary>Instructions</summary>

### Set up Registry Namespace

Namespaces provide a way to categorize your Docker images within the registry.  Note that these are different than Kubenetes namespaces.  Namespaces must be unique across the entire Registry. Namespaces not
found when building images will be added automatically.

<details>
<summary>Instructions</summary>

1. Create a unique namespace in the container registry to associate the images you will load into the directory.  eg. Here we are using the suffix jd40  (John Doe, age 40) to provide uniqueness.

    ```
    export CRNS=cas2019jd40
    export CRLOC=us.icr.io
    ibmcloud cr namespace-add $CRNS
    ```

2. Verify that is was correctly added.

    ```
    ibmcloud cr namespace-list
    ```

</details>

### Obtain the Code

The cluster we are setting up will contain our 3 projects (i.e. services). For simplicity we've provided them all in this lab's git repository in the subfolders (account, 
provider, cost).

<details>
<summary>Instructions</summary>

1. Clone this repository with git.  
For more information on choosing either ssh/https methods, see [github](https://help.github.com/en/articles/which-remote-url-should-i-use)

    ```
    git clone git@github.com:cloud-coder/cascon-2019-kubernetes-apimanager.git (ssh)
    git clone https://github.com/cloud-coder/cascon-2019-kubernetes-apimanager.git (https)
    ```

</details>

### Create Images

This is essentially the Docker command (www.docker.com), but pushes the images to the IBM Cloud Container Registry.  Docker is a tool designed to make it easier to create, 
deploy, and run applications by using containers.  The images are built with the corresponding Dockerfile and contains all of the necessary software packages needed to run 
the microservices (eg. NodeJs, business logic).  By creating an image, it allows us the flexibility of reusing it to deploy several times without needing to recompile the code.  

<details>
<summary>Create Images </summary>
1. For each of the folders, we need to create Docker images and deploy them to the registry.

    ```
    cd cascon-2019-kubernetes-apimanager/02-kubernetes-service-creation
    cd account
    ibmcloud cr build --no-cache -t $CRLOC/$CRNS/account:1 .
    cd ../provider
    ibmcloud cr build --no-cache -t $CRLOC/$CRNS/provider:1 .
    cd ../cost
    ibmcloud cr build --no-cache -t $CRLOC/$CRNS/cost:1 .
    ```

This is the first time we are submitting these image repositories so we will provide it with an initial tag "1".  Ensure you specify the trailing "." 
which references the location of the Dockerfile.

The --no-cache allows you to make a clean build of an image every time, but optional.

If you experience quota related issues, you can remove any older images you may have.

    ibmcloud cr image-rm <image name>

You should see the three additional images listed using this command.

1. Verify the images are available

    ```
    ibmcloud cr images
    ```

</details>
</details>

## Kubernetes Nodes

In Kubernetes images are not directly specified to go into containers and deployed to be accessed directly.  Instead, a desired state is specified and is managed by 
Kubernetes to deploy using the node/workers (VM or physical machines) that have been allocated to your cluster.  The IBM Cloud Free Tier allocates a single worker, so 
everything will be deployed there.  You can see the workers that have been allocated by using either the ibmcloud or kubectl CLI.

    ibmcloud ks workers <clusterId>
    kubectl get nodes -o wide

## Setting up into the Kubernetes Cluster

### Deployments 
To get started, a Kubernetes deployment is needed to define how you want the pods deployed.  A pod is the smallest deployable unit which may contain one or more containers, 
a running instance of your image.  For now, we'll create deployments using the default settings.  One pod will be created per deployment by downloading the image you 
specify in the command.

<details>
<summary>Create Deployment</summary>

1. Create Deployments

    ```
    kubectl create deployment dep-account --image=$CRLOC/$CRNS/account:1
    kubectl create deployment dep-provider --image=$CRLOC/$CRNS/provider:1
    kubectl create deployment dep-cost --image=$CRLOC/$CRNS/cost:1
    ```

A successfully deployed pod will in the *running* status.  Each pod is assigned an IP address in the private network and automatically assigned to a node in your 
cluster.  In the IBM Cloud Free Tier, the cluster is only allocated one node, so all pods will be deployed there.  

1. Verify your pod is running.

    ```
    kubectl get pods -o wide
    ```

Deployments exists until they are explicitly removed, but each pod is ephemeral, so using the IP address will only be valid for as long as the pod is alive.  

1. Let's delete a pod and see what happens.

    ```
    kubectl delete pod <pod-name>
    ```

1. Now check the pods again.  You may need to repeat this command as the pods may take time to refresh.

    ```
    kubectl get pods -o wide
    ```

Notice the original pod name/IP may result in a terminated status, but a new pod will spawn, and a new IP is assigned to it.  Kubernetes attempts to provide you the pod
specified in the deployment that you created earlier automatically.  This also happens if your container fails (eg. due to a software glitch), and will continue 
forever in attempting to have a successfully running deployment.

If you make a mistake in creating your deployment, you can also remove deployments using the command.

    kubectl delete deployment <deployment-name>

</details>

### Logging and Events

By default, each container may send information to the stdout/stderr streams.  These are all managed by Kubernetes and available to you.  To view the logs, you need
to specify the particular pod name, which means you need to get the current running pod list.  To view state changes, you can use Kubernetes Events 

<details>
<summary>Logging</summary>

1. View the logs for the provider application.

    ```
    kubectl get pods -o wide
    kubectl logs -f <provider pod name>
    ```

Press Ctrl-C to end the tail of the log.

</details>
<details>
<summary>Events</summary>

    kubectl get events

</details>

### Services

As the pods have dynamically assigned private IPs that can change at any time, it would be difficult to expose them to the outside world without telling the user
what the updated host and port is.  To resolve this, Kubernetes provides *services*, an interface that sits in front of pods.  Its job is to give a unique name
that others can reference which it will allow traffic to be served by an available pod.  If a new pod has generated or terminated, the service will be aware of it, and 
direct traffic appropriately.  The port specified below should match what each application port it is listening on.  Services are not ephemeral so they are will always
exist unless explicitly removed, but its existence is not affected by the number of pods associated with it.

<details>
<summary>Creating Services</summary>

1. Create Services for the *account*, *provider* and *cost* microservices

    ```
    kubectl expose deployment/dep-account --type=NodePort --name=account-service --port=8080
    kubectl expose deployment/dep-provider --type=NodePort --name=provider-service --port=8081
    kubectl expose deployment/dep-cost --type=NodePort --name=cost-service --port=8082
    ```

The services above are defined here as "NodePort", which means each service is provided a port 30000+ which makes them directly accessible externally.  We could have also
used the type "ClusterIP" which means that they would only be exposed internally, and not available externally by default.  In configuring real microservices we may
consider using this type instead.

1. Verify everything is running.

    ```
    kubectl get services -o wide
    kubectl get deployments -o wide
    ```

You should notice that all of the services have internal and external cluster IPs assigned.  The external port is shown in the 30000+ range for the cost service which the NodePort type
provides.  

</details>

### DNS support for Services and Pods

Our cluster now has all 3 microservices deployed, however the *cost* application is an application that depends on the other microservices, and somehow needs to
reference them properly.  In order for one pod to discover the other pod, it would be difficult as we have already discovered the IPs are dynamic.  The solution 
is that pods should reference the appropriate services.  Kubernetes by default comes with kube-dns, a way to resolve services by simply using their service name.

<details>
<summary>DNS support</summary>

For instance, the *account* service can be accessed via any of the following hostnames:

    account-service.default.svc.cluster.local
    account-service.default.svc
    account-service.default
    account-service

The running application containers are built upon a small unix image which are running NodeJs listening on specific ports.  However it is also possible to create a session 
with the container using an interactive shell.  Lets start a session with it so we can see the kube-dns in action.

1. Locate the cost pod name and create a shell.
    ```
    kubectl get pods
    kubectl exec -it <cost-pod-name> -- /bin/sh
    ```

1.  Now in your shell, execute the following.  Each one should resolve to the same IP address as they all refer to the same thing:
    ```
    nslookup account-service.default.svc.cluster.local
    nslookup account-service.default.svc
    nslookup account-service.default
    nslookup account-service
    ```

If our microservice are aware of the service name of another microservice, then we can access them directly without needing to expose the service externally, and
come back in from the outside.  But the issue we have now, is that we do not know which port our other services are running on.  When each pod is deployed, all 
currently available services are provided to it in the form of environment variables.  Lets see what is provided to the *cost-service*.

1. List the environment variables (still within the interactive session), then exit the interacitve shell.
    ```
    printenv | sort
    exit
    ```

If the service was defined before the pod was created, you would have seen a &lt;svcname&gt;_SERVICE_HOST &lt;svcname&gt;_SERVICE_PORT pair of entries.  This is what is being
used by our code in the *cost* microservice.

In our steps above, the *cost* pod was created during the deployment creation, but the service creation for *account* and *provider* was done afterwards.  This means that the current 
*cost* pod is not directly aware of the 2 new services that were created as we do not see any entries in the environment variables.  The code in cost/app.js could have made
a hard reference to http://account-service.default.svc:8080/ and http://provider-service.default.svc:8081/ but that would rely on the services' port being defined as 8080/8081 
in the expose command.  The NodeJs code in app.js currently references:

    process.env.ACCOUNT_SERVICE_SERVICE_HOST
    process.env.ACCOUNT_SERVICE_SERVICE_PORT
    process.env.PROVIDER_SERVICE_SERVICE_HOST
    process.env.PROVIDER_SERVICE_SERVICE_PORT

The developer and Kubernetes administrator should only need to agree upon the service name, and allow the service port to be defined by the administrator.  The development team
can listen on any port (eg. 80 or 9876) for their own application and code changes would not be necessary while it is being deployed.  The account and provider applications also do not need
to consider whether they are both listening on the same port while processing their requests.

For the code to work, all we need to do is delete the *cost* pod so the new one is provided with the new service information.  

1. Delete the *cost* pod
    ```
    kubectl get pods -o wide
    kubectl delete pod <cost-pod-xxxxxx>
    kubectl get pods -o wide
    ```

Now let's check the environment variables with the newly created pod.

1.  Execute the printenv directly on the pod.
    ```
    kubectl exec -it <NEW-cost-pod-xxxxxx> -- printenv
    ```

You should be able to see all of the services listed now including its own service (COST_SERVICE) entries.

    ACCOUNT_SERVICE_PORT=tcp://172.21.149.218:8080
    ACCOUNT_SERVICE_PORT_8080_TCP=tcp://172.21.149.218:8080
    ACCOUNT_SERVICE_PORT_8080_TCP_ADDR=172.21.149.218
    ACCOUNT_SERVICE_PORT_8080_TCP_PORT=8080
    ACCOUNT_SERVICE_PORT_8080_TCP_PROTO=tcp
    ACCOUNT_SERVICE_SERVICE_HOST=172.21.149.218
    ACCOUNT_SERVICE_SERVICE_PORT=8080
    COST_SERVICE_PORT=tcp://172.21.159.241:8082
    COST_SERVICE_PORT_8082_TCP=tcp://172.21.159.241:8082
    COST_SERVICE_PORT_8082_TCP_ADDR=172.21.159.241
    COST_SERVICE_PORT_8082_TCP_PORT=8082
    COST_SERVICE_PORT_8082_TCP_PROTO=tcp
    COST_SERVICE_SERVICE_HOST=172.21.159.241
    COST_SERVICE_SERVICE_PORT=8082
    HOME=/root
    HOSTNAME=dep-cost-665cc8d6cf-gf85p
    KUBERNETES_PORT=tcp://172.21.0.1:443
    KUBERNETES_PORT_443_TCP=tcp://172.21.0.1:443
    KUBERNETES_PORT_443_TCP_ADDR=172.21.0.1
    KUBERNETES_PORT_443_TCP_PORT=443
    KUBERNETES_PORT_443_TCP_PROTO=tcp
    KUBERNETES_SERVICE_HOST=172.21.0.1
    KUBERNETES_SERVICE_PORT=443
    KUBERNETES_SERVICE_PORT_HTTPS=443
    NODE_VERSION=9.4.0
    PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    PROVIDER_SERVICE_PORT=tcp://172.21.12.109:8081
    PROVIDER_SERVICE_PORT_8081_TCP=tcp://172.21.12.109:8081
    PROVIDER_SERVICE_PORT_8081_TCP_ADDR=172.21.12.109
    PROVIDER_SERVICE_PORT_8081_TCP_PORT=8081
    PROVIDER_SERVICE_PORT_8081_TCP_PROTO=tcp
    PROVIDER_SERVICE_SERVICE_HOST=172.21.12.109
    PROVIDER_SERVICE_SERVICE_PORT=8081

Just to be sure, we can delete all the pods to ensure they are all aware of these environment variables.

    ```
    kubectl delete pods --all
    ```

***

</details>

### Accessing from the Outside

1. Determine the cluster public IP by checking with IBM cloud services.

    ```
    ibmcloud ks cluster ls
    ibmcloud ks workers <clusterid>
    ```

1. As there is only one node in the cluster, the public IP is also shown as the external IP the node.

    ```
    kubectl get nodes -o wide
    ```

1. Determine the port for our external facing cost service.  Because we specified it with type Nodeport, it will be allocated a port in the (30,000-32767) range.  
Check the ports column for the  external value (after the colon).

    ```
    kubectl get services -o wide
    ```

1. Access the urls from a web browser.

    ```
    eg. http://173.193.92.194:31234/account
    eg. http://173.193.92.194:30507/account/123
    eg. http://173.193.92.194:31323/provider
    eg. http://173.193.92.194:31323/provider/bell
    eg. http://173.193.92.194:30507/cost
    eg. http://173.193.92.194:30507/cost/123
    ```

Note that this scenario is not complete as a deployed set of services in a real-life scenario.  For instance, ports are typically exposed on 80/443, and not a random IP 
which is hard to remember.  For details see [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/).  Note that this is not available in the IBM Cloud Free Tier.

Here is an example of what should be configured in your cluster.  IP number will differ.

![lab 2 image](https://github.com/cloud-coder/cascon-2019-kubernetes-apimanager/blob/develop/02-kubernetes-service-creation/Lab2Result.png?raw=true)

## Updating the Deployment

Now that we have deployed our services, it may seem like a lot of work to need to repeat all the steps when code is changed.  Fortunately Kubernetes stores all the objects that 
you created (eg. deployments, services, pods) as *records of intent* so they can be altered, and Kubernetes will take care of bringing the system to the new desired state.  
To explain this, let's simulate a code change.

1. Open up the account/app.js file in the account directory, and make a change.
    ```
    nano account/app.js
    ```

Now that we have a change, we need to build a new image in the registry.

1. Make a new version 2 of the account application.
    ```
    ibmcloud cr build -t $CRLOC/cas2019jd40/account:2 .
    ```

Now that we have a new image, the Kubernetes administrator can update the deployment.

    kubectl edit deployment/dep-account

Now replace the line

      - image: $CRLOC/cas2019jd40/account:1

with

      - image: $CRLOC/cas2019jd40/account:2

save then close the file.

You should see the image version reflected in the deployment:

    kubectl get deployments -o wide

As well as the old pod will terminate, and you will see that a new one will be created (verify that the age is younger than the other pods).

    kubectl get pods

And that's it.  After a new image is available, only one change is necessary, and Kubernetes takes care of the rest.

## Backing up Configuration

Internally, Kubernetes holds the desired and actual state of your entire cluster in etcd, a distributed database that stored the configuration.  Whenever you 
query or update using the kubectl commands, you are actually updating etcd, which then Kubernetes uses to apply on the workers to build nodes, services etc.  
Kubernetes is extremely flexible in providing you an interface to interact with the state.  Along with the command line options, we can also update via YAML 
(as seen in the previous instructions), JSON, and interfacing with the UI.  Let's finally see how we can reapply the configuration easily in a new cluster.

1. Pull all the configuration for your deployments and services for this namespace.
   ```
   kubectl get all  -o json > myproject.json
   ```

1. Delete all the deployments and services
   ```
   kubectl delete --all deployments
   kubectl delete --all services
   ```

1. In your new cluster you can reapply your configuration with this command
   ```
   kubectl apply -f myproject.json
   ```

## ConfigMaps and Secrets

Somtimes you may have information that needs to be updated regularly and you do not want to find and update code directly.  The ConfigMaps provides
a key/value storage that can be exposed as environment variables to your pods.  This may be external host names, configuration settings etc.  Secrets
work in the same way, but the values are usually passwords or tokens that shouldn't normally be shown.

1. Create a config map with some literal values

   ```
   kubectl create configmap myconfigmap --from-literal=value1=testvalue1 --from-literal=value2=testvalue2
   ```

1.  Next edit the deployment so that the pods will be exposed to these new config map values.

   ```
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: dep-account
    spec:
      containers:
      - envFrom:
        - configMapRef:
            name: myconfigmap
   ```

1. Then delete the account pod to allow it to pick up the values, check the new pod that is regenerated, and check the environment variables.

   ```
   kubectl delete pod dep-account-???
   kubectl get pods
   kubectl exec -it dep-account-??? -- /bin/sh
   printenv
   ```

You should see the environment variables for value1 and value2.


# More Information

## Kubernetes Namepaces

You can also use Kubernetes Namespace.  This allows us to group all our Kubernetes objects together under our project, and separate
them from other potential projects on the same cluster.  By default, the *default* namespace is used, but by using a custom one, it gives us 
flexibility in managing it later.  When we use a non-default namespace, we need to migrate all the secrets over so that the tokens use to authenticate
against the Cloud Container Register are available when we pull images.  Normally this would have been done before any deployments were created.

1. Create a Kubernetes Namespace and use it in the current context.

    ```
    kubectl create ns cas2019ns
    kubectl config set-context --current --namespace=cas2019ns
    kubectl config get-contexts
    kubectl get secrets -n default -o yaml | sed 's/default/cas2019ns/g' | kubectl -n cas2019ns create -f -
    ```

1. Update the imagePullSecrets

Because we are using a non-default namespace for Kubernetes, the credentials to pull images from the Container Register are not specified in this namespace.  
We need to update the deployment so that the correct secret is used.  You can add the imagePullSecrets key by updating the deployment descriptors:

    spec:
      containers:
      - image: us.icr.io/cas2019/account:1
        imagePullPolicy: IfNotPresent
        name: account
        resources: {}
        terminationMessagePath: /dev/termination-log
        terminationMessagePolicy: File
      dnsPolicy: ClusterFirst
      imagePullSecrets:
      - name: default-us-icr-io

