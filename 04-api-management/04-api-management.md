## API Management

So far, we have created services, deployed them to a kubernetes cluster and we have exposed one of these services via a NodePort which assigns a random port to the service.

In this part of the workshop, we will use the IBM Cloud API Management to start securing our service so that we can eventually control who has access and impose API limits to the calls to our service.

### Accessing API management

In your IBM Cloud account, 
- Top left menu, then select *API Management*
- Then in the left menu select *Managed APIs*
- On the right click the blue button *Create Managed API* and select the *API Proxy* option

### Creating your first API proxy

The page that comes up allows you to create an API proxy. The simplest way to achive this is by filling in the information for
- API Name, this is just a user firendly name to identify the API
- Base path for API, this is what you want. Often a version is used, for example `/v1`
- External endpoint, this will be the public IP of your kubernetes cluster with the port used by your NodePort (from previous workshop steps)

With those pieces of information filled in, scroll to the bottom and click the blue *Create* button.

