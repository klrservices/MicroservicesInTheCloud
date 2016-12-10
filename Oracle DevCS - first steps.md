# Setting up the project in Oracle Developer Cloud Service

Oracle Developer Cloud Service is an integrated development cloud environment for DevOps teams. It is included in the package if you subscribe to other Oracle paid or trial services like: Oracle Java Cloud Service, Oracle Java Cloud Service-SaaS Extension, Oracle Messaging Cloud Service, Oracle Mobile Cloud Service, Oracle SOA Cloud Service and, of course, Oracle Application Container Cloud. In this tutorial we will setup our project in DevCS and upload our existing code. If you want to learn more please visit [Oracle DevCS documentation](http://docs.oracle.com/en/cloud/paas/developer-cloud/index.html).  

#### Activating the service and creating new project

The initial setup is very well described in the documentation, please check and follow the steps described [here](http://www.oracle.com/webfolder/technetwork/tutorials/infographics/devcs_trial_quickview/index.html):
![Oracle DevCS QuickStart page][quickstart_page]

On the last step (5) when you create a new project you can name it as you want, however, please be aware that the name of the project becomes a part of the project git repository url. For step-by-step instructions on how to create a new project please consult the [Creating an Oracle Developer Cloud Service Project](http://www.oracle.com/webfolder/technetwork/tutorials/obe/cloud/developer/CreateProject/CreateProject.html) documentation.

#### Creating a local Git repository and uploading the code to the DevCS

When you finish all steps described above you will have an empty project with its own git repository. This repository has a URL you need to copy for reference. Next step is to take our local code, create a local repository and push it to the DevCS git repo. If you followed the instructions described in the [Groovy Microservice tutorial](https://github.com/klrservices/MicroservicesInTheCloud/blob/master/Groovy%20microservice%20implementation.md) you may have the final project on your local disk. In this case you need to perform step _1_ to create a local git repo. If you start from scratch please perform step _2_ to clone the project from GitHub.

> Note: you will have to install Git in your local environment first

1. Create a local git repository
Go to the root of your project, open the command line and type the following commands:
```
git init
gradle clean
git add .
git commit -m 'Initial commit'
```
2. (Optional - in case you don't have a local code yet) Clone the existing repo from GitHub:

```
git clone https://github.com/klrservices/MicroservicesInTheCloud.git
```
3. Add a remote DevCS repository
For this step you need to have a URL of your DevCS repo. Type the following command:

```
git remote add devcs <Your_DevCS_repository.git>
```
The _devcs_ is an arbitrary name for your remote repo - if you performed step _2_ you can't use the default _origin_ name as it points to the GitHub repo.

4. Push your code to DevCS
Invoke the following command to push the project to the DevCS git repository:

```
git push -u devcs +master
```

For more information about using Git to work with DevCS please consult  the [Using Git in Oracle Developer Cloud Service](http://docs.oracle.com/en/cloud/paas/developer-cloud/csdcs/using-git-oracle-developer-cloud-service.html#GUID-B4C03296-8497-4356-8C74-2031D1FB96FC) documentation.

----
[quickstart_page]: docs/images/devcs_first_steps/quickstart_page.png

