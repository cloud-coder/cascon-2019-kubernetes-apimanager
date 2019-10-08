# Securing the App With Calico


## Install Calico

https://cloud.ibm.com/docs/containers?topic=containers-network_policies#cli_install

## 

deny-nodeport.yaml is specific to block the port that is open
deny-nodeports.yaml blocks everything in a port range
whitelist.yaml opens the whitelist of IPs specific for the cluster IP and port specified