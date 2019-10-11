# Finding the IP Address of API Management

## Using Calico logging

Ideally we get this part to work and can see the IPs used by API management in the Calico logs

NEED HELP HERE. If someone wants to investigate this further to get it to work

## Configuring API management to get some details

This is a bit cumbursome of an approach, but appears to work.

If you go back to the API Management configuration page, instead of pointing the service to your cluster's public IP and Nodeport port, you can change it (temporarily) to point to https://ifconfig.me/

Then using the curl command (or your browser) you can browse to the API Management URL. You will need to look, not for the *IP Address* but for the *X-Forwarded-For* field to capture the different IPs listed in there.

Repeat the calls multiple time until you seem to have captured all the different IPs listed in that list.

Go back to API management and point the service back to your cluster ip and port.

Using the list of IPs gathered above, sort them, and you will notice some groupings. You will want to follow the following steps for each grouping:
- Remove the previous grouping of IPs from the whitelist (if applicable)
- Add the group of IPs to the `whitelist.yaml` file
- Apply the file policy
- Try connecting to the service using the API Management url

When you connect successfully, try calling the API multiple times to make sure you have all the required IPs in your configuration. Make adjustments as necessary.
