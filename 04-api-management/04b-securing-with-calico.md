# Securing the App With Calico

So in the previous steps, we started securing our API, but realized that someone who finds the public ip and port of our cluster would still be able to access the API by bypassing our API Management. When using Kubernetes clusters we can protect our cluster by using some plugins.

In this case we will be using a plugin called Calico to enable some networking policies.

## Installing Calico

Calico enables networking and network policy in Kubernetes clusters. In IBM Cloud, Calico is pre-installed which allows us to configure network policies in our cluster. But before we do that, we need to install the Calico command line interface (CLI).

Go to the following URL and follow the instructions to install Calico CLI

https://cloud.ibm.com/docs/containers?topic=containers-network_policies#cli_install

**Note:** if you are using a Windows machine, you will need to add the `--config=calicoctl.cfg` option to all the command lines in this lab. It is easier if you copy the configuration file to your current directory to achieve this.

## Configuring Calico Network policies

### Gather information about the cluster
In order for us to be able to configure the network policies, we will need some information about our cluster.

Get the cluster id: `ibmcloud ks cluster ls`
Get the cluster public IP: `ibmcloud ks worker ls <cluster_if>`
Get the ports used by the services: `kubectl get services`

### Get information about your local IP address

Although tools like `ifconfig` or `ipconfig` provide information about your local IP addresses, we need to know the IP address that you *appear* to be coming from when connecting to a public site.

Point your browser to a site such as: https://ifconfig.me/

Or type "what is my ip" in a google search.

This will give you the IP address you appear to be coming from for a public site.


## Confirm you ucan still access the cluster

Confirm that if you run the following command

`curl http://173.193.99.247:32482`

You can still access the API.

## Blocking all incoming traffic on the open ports

The first step we want to take is to block all traffic going to the cluster so that services are no longer accessible.

We achieve this by using a *Global Network Policy* to deny access:
```yaml
 apiVersion: projectcalico.org/v3
 kind: GlobalNetworkPolicy
 metadata:
   name: deny-nodeports
 spec:
   applyOnForward: true
   preDNAT: true
   ingress:
   - action: Deny
     destination:
       ports:
       - 30000:32767
     protocol: TCP
     source: {}
   - action: Deny
     destination:
       ports:
       - 30000:32767
     protocol: UDP
     source: {}
   selector: ibm.role=='worker_public'
   order: 1100
   types:
   - Ingress
```

As you may see in the above policy:
- We deny all incoming TCP traffic on ports 30000 to 32767
- We deny all incoming UDP traffic on ports 30000 to 32767

You can find this policy in a file called `deny-nodeports.yaml` in the repository.  Navigate to the cascon-2019-kubernetes-apimanager/04-api-management directory on your computer which you cloned from GitHub in the previous labs.

Run the command: `calicoctl apply -f deny-nodeports.yaml`, you should get confirmation that the policy was applied.

Now try connecting to your service using the curl command again.  It now will not connect due to the network policy.

## Accepting incoming connections using a whitelist

Now that all traffic going to those ports has been blocked our API is secured, but also is unusable by anyone.

For testing purposes we will want to open up access to our IP address.  Open the file whitelist.yaml and update <my_ip_address> to be the IP address from the http://ifconfig.me page.  Next, update the <nodeport_port> to be the port for the cost service.  Also update the <cluster_public_ip> to be your Kubernetes public cluster IP address.

```yaml
 apiVersion: projectcalico.org/v3
 kind: GlobalNetworkPolicy
 metadata:
   name: whitelist
 spec:
   applyOnForward: true
   preDNAT: true
   ingress:
   - action: Allow
     destination:
       nets:
       - <cluster_public_ip>/32
       ports:
       - <nodeport_port>
     protocol: TCP
     source:
       nets:
       - <my_ip_address>/32
   selector: ibm.role=='worker_public'
   order: 500
   types:
   - Ingress
```

As you may see above the policy:
- Allows for incoming connections coming from *your* IP
- Allows connections going specifically to the cluster public_ip and nodeport port for the service you want to expose

Run the command: `calicoctl apply -f whitelist.yaml`, you should get confirmation that the policy was applied.

Try accessing your service again using the command we used before and the direct IP address - the connection should work. Ask a friend to try to connect and the connection should fail.

Obviously this is not achieving what we ultimately want yet because we are only allowing traffic from our own computer.  

If you try to connect using the API Management URL we received in the previous step, that connection should still fail.

## Updating our policy to allow connections from the API Management IPs

The API Management actually uses multiple IP addresses to connect to the service, so we need to add all of them to our whitelist. Open up the whitelist.yaml file again and add 3 entries:
- 169.46.64.77/32
- 169.48.97.212/32
- 169.48.246.130/32


```yaml
 apiVersion: projectcalico.org/v3
 kind: GlobalNetworkPolicy
 metadata:
   name: whitelist
 spec:
   applyOnForward: true
   preDNAT: true
   ingress:
   - action: Allow
     destination:
       nets:
       - <cluster_public_ip>/32
       ports:
       - <nodeport_port>
     protocol: TCP
     source:
       nets:
       - 169.46.64.77/32
       - 169.48.97.212/32
       - 169.48.246.130/32
       - 169.48.97.211/32
       - <my_ip_address>/32
   selector: ibm.role=='worker_public'
   order: 500
   types:
   - Ingress
```

Apply this new whitelist by executing the command `calicoctl apply -f whitelist.yaml`

Now if you try to connect using the API Management URL we received in the previous step that connection should successfully connect to the service.

If you need help finding the IP addresses for API Management, refer to this document: 
[Finding the IP of API Management for Calico](04c-finding-the-ip-of-api-management.md)


## Removing our own IP from the configuration

Now that we have enabled the IPs for the API Management, you should remove your own IP from the whitelist so that all traffic can only come through the API Management link.

## Next step

Next we need to improve our API Management Security in [Improving the API Management Security](04d-improving-apim-security.md)
