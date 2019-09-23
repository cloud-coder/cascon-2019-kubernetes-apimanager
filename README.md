# CASCON 2019 - Build, deploy and administer microservices using Kubernetes and IBM Cloud API Management

## Table of Contents

* [Overview](#overview)
* [Lab 1 Setup (Pre-Requisite)](*lab-1-setup-(pre-requisite))
* [Lab 2 Exploring Kubernetes and Creating a Kubernetes Service Deployment]
* [Lab 3 Scaling Applications in Kubernetes]
* [Lab 4 API Management]
* [Conclusion](#conclusion)

## Overview

In recent years companies have increased their adoption of cloud computing not just to improve IT operational efficiencies but also to drive growth through business innovation and gain a competitive advantage. Legacy applications are being modernized to run in cloud environments and new cloud native applications with enhanced artificial intelligence are being developed. Microservices, containers and DevOps are at the core of application modernization and cloud native application development.

Microservices have become an important part of recent application architectures. The microservice architecture is an approach that decomposes an application into a set of small services. Each service has a very specific scope and set of responsibilities. They can even use their own independent data sources. This approach has the following advantages. 

Microservices:
•	are easier to maintain
•	can be deployed independently of one another
•	can be scaled independently to react to changing load
•	are easily containerized and thus can be managed with a container orchestration platform

Microservices can be packaged with all the code and runtime library dependencies required for its execution into modularized containers. Kubernetes is emerging as the industry standard to orchestrate multiple containers. IBM Cloud Kubernetes Service is a managed offering that allows you to create your own cluster of compute hosts in order to deploy applications (as containers) to IBM Cloud. The cluster can be managed remotely using a Command Line Interface (CLI) or an embedded dashboard in IBM Cloud.

IBM Cloud API Management allows you to create new APIs or discover existing ones and then run, manage and secure them. Simple API keys and secrets can be created in order to protect and limit access. Rate limits can be established per API key in order to keep usage at a desired level. 


## Lab 1 Setup (Pre-Requisite)

Follow instructions in [setup section](01-setup/01-setup.md) to sign in to IBM Cloud and set up your account.  You can use a trial account for this purpose.

The workshop pre-requisites also indicated that creation of the IBM Cloud Kubernetes cluster should be done prior to the workshop.  This is due to the fact that cluster creation can take some time to complete - thus it is beneficial to complete these steps prior to the workshop day.  Instructions are above in the [setup section](01-setup/01-setup.md)

## Lab 2 Exploring Kubernetes and Creating a Kubernetes Service Deployment

[This section](02-kubernetes-service-creation/02-kubernetes-service-creation.md) will explore the CLI tools and Dashboard for administering a Kubernetes cluster.  The lab will then walk you through the steps to :
* Create microservice images
* Create containers and deploy them to the Kubernetes cluster using IBM Cloud	
* Expose the API outside of the cluster
*	Test the functionality of the API

## Lab 3 Scaling Applications in Kubernetes

[This section](03-scaling-in-kubernetes/03-scaling-kubernetes.md) will explore some of the scaling capabilities in Kubernetes.  It will detail the steps to:
* Create a scaled deployment setup
* Compare temporary versus permanent changes in a Kubernetes deployment
* Monitor the health of a deployment
* Explore the services in a load balanced setup

## Lab 4 API Management

[This section](04-api-management/04-api-management.md) will describe the ways that API's can be managed using IBM Cloud API Management.  The topics include how to:
* Add endpoints in IBM Cloud API Management for services deployed in Kubernetes
* Add security to services using API keys
* Rate limiting for an API

## Conclusion

In this lab you have learned the basics of a Kubernetes cluster.  You have been able to create a Kubernetes cluster and explore how to administer the cluster from the built in Dashboard and also using Command Line Interface tools.  You have learned about how to scale a Kubernetes cluster and monitor it's health.  You have also explored the capabilities of IBM Cloud API Management and discovered how to proxy, protect and rate limit existing backend services.

The labs have given you a basic foundation of these concepts.  Now that you know some basics you are encouraged to explore on your own!  Thank you for attending!
