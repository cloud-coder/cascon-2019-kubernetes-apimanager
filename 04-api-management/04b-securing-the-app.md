# Securing the App

So in the previous steps, we started securing our API, but realized that someone who finds the public ip and port of our cluster would still be able to access the API by bypassing our API Management.

## Adding code to the app

One option we have to secure our application is to add code in the app itself and to have it make sure that 
1. The request being processed comes from the `*.apiconnect.appdomain.cloud` domain
2. It includes a header value for `X-IBM-Client-Id`

This will ensure that we ignore requests that might be coming directly to the cluster and that it went through the API Management url we configured, therefore ensuring it is from a source that has an API key.


For example, we can create a function that checks this information in the request

```javascript
function checkAPIKey (req, res) {
  // Make sure this particular request is secure with the API Key and coming from the API gateway
  if ((!req.headers["x-ibm-client-id"] ||
  !(req.headers["x-forwarded-host"] && req.headers["x-forwarded-host"].indexOf("apiconnect.ibmcloud.com") > 1))) {
    res.status(401).send("API key is missing or invalid");
    return false;
  }
  return true;
}
```

And the we would update our functions to contain something like:

```javascript
  if (!checkAPIKey(req, res)) {
    logger.info("API Key Invalid");
  } else {
    ...
  }
```