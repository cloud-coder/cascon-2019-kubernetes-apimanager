# Securing the App With Calico

So in the previous steps, we started securing our API, but realized that someone who finds the public ip and port of our cluster would still be able to access the API by bypassing our API Management. When using Kubernetes clusters we can protect our cluster by using some plugins.

In this case we will be using a plugin called Calico to enable some networking policies.

## Installing Calico

Go to the following url to install Calico

https://cloud.ibm.com/docs/containers?topic=containers-network_policies#cli_install


## Configuring Calico Network policies

### Gather information about the cluster
In order for us to be able to configure the network policies, we will need some information about our cluster.

Get the cluster id: `ibmcloud ks cluster ls`
Get the cluster public IP: `ibmcloud ks worker ls <cluster_if>`
Get the ports used by the services: `kubectl get services`

### Get information about your local IP address

Although tools like `ifconfig` or `ipconfig` provide information about your local IP addresses, we need to know the IP address that you *appear* to be coming from when connecting to a pulic site.

Point your browser to a site such as: https://ifconfig.me/

Or type "what is my ip" in a google search.

This will give you the IP address you appear to be coming from for a public site.


## Confirm yo ucan still access the cluster

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

Once you have this policy saved in a file called `deny-nodeports.yaml` we can apply it.

Run the command: `calicoctl apply -f deny-nodeports.yaml`, you should get confirmation that the policy was applied.

Now try connecting to your cluster using the command we used before and it should be unsuccessful.

## Accepting incoming connections using a whitelist

Now that all traffic going to those ports has been blocked our API is now secured, but also is unusable by anyone.

For testing purposes we will want to open up access to our IP address.

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

Try accessing your service again using the command we used before, the connection should work. Ask a friend to try to connect and the connection should fail.

Obviously this is not achiveving what we ultimately want yet, but it is a first step.

If you try to connect using the API management url we received in the previous step, that connection should still fail.

## Updating our policy to allow connections from the API Management IPs

The API Management actually uses multiple IP addresses to connect to the service, so we need to add all of them to our whitelist. In the example below we add 3 entries:
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
       - <my_ip_address>/32
   selector: ibm.role=='worker_public'
   order: 500
   types:
   - Ingress
```

If you need help finding the IP addresses for API Management, refer to this document: *04c-finding-the-ip-of-api-management**

## Removing our own IP from the configuration

Now that we have enabled the IPs for the API Management, you should remove your own IP from the whitelist so that all traffic can only come through the API Management link.