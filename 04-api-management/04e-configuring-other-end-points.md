# Configuring our different end points differently

So far we have worked with a single service, the *cost* service.

We have 2 other services that we can also configure, the *account* and the *provider* services.

## Configuring the account and provider services

For both of these you will want to repeat the steps from the [First part of the lab](Readme.md), specifically the section **### Creating your first API proxy**. Of course you will need to adjust the endpoints accordingly.

You will then also have to update your `whitelist.yaml` file to include the additional 2 ports required for these services.

Your `whitelist.yaml` should look like:
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
       - <port for cost service>
       - <port for account service>
       - <port for provider service>
     protocol: TCP
     source:
       nets:
       - 169.46.64.77/32
       - 169.48.97.212/32
       - 169.48.246.130/32
   selector: ibm.role=='worker_public'
   order: 500
   types:
   - Ingress
```

You should now be able to test the new end points:
```bash
curl https://1883da9e.us-south.apiconnect.appdomain.cloud/v1/account
curl https://1883da9e.us-south.apiconnect.appdomain.cloud/v1/provider
```

If you provide some additional information on the path of the url you will receive specific information:
```bash
$ curl https://1883da9d.us-south.apiconnect.appdomain.cloud/v1/account/123
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   100  100   100    0     0    163      0 --:--:-- --:--:-- --:--:--   163{"account_id":"123","name":"Mary Walters","address":"819 Walters Ave","providers":["bell","rogers"]}

$ curl https://1883da9d.us-south.apiconnect.appdomain.cloud/v1/provider/bell
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100    44  100    44    0     0    100      0 --:--:-- --:--:-- --:--:--   100{"provider_id":"bell","cost":15.99,"term":2}

```

## Next level of configuration

Here, in addition to being able to add an API Key as we did in the cost service, we can experiment with configuring
- Using the same API Key
- Having a different Rate Limit
- Using API Keys and Secret: https://cloud.ibm.com/docs/services/api-management?topic=api-management-keys_secrets
