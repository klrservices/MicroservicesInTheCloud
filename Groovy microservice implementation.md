# Creating a simple REST microservice

This tutorial shows how to implement a simple REST based microservice using Groovy, Spark Java and Gradle. The application we create can be later on uploaded to the Oracle Developer Cloud Service and a job can be created to automatically build and deploy the package to the Oracle Application Container Cloud Service.
We start with the basics - let's create a traditional "Hello World" application using technologies mentioned before: Groovy, Spark Java framework and Gradle as a build tool. As an IDE we will use NetBeans 8.2 with a Groovy plugin installed.

### Creating Hello World application in Groovy and Spark
Open NetBeans and create a new project:

![New project][groovy__new_project_1]

Choose **Gradle** Category and **Single Gradle Project**

![Pick Gradle->Single Gradle Project][groovy__new_project_2]

Enter the name of the project: **GroovyMicroservice** and the main class: **microservice.Main**

![Enter the name and main class][groovy__new_project_3]

Then click **Finish**  
The project will open in NetBeans. The next step is to define the proper gradle build script. Open the **build.gradle** file in the NetBeans and replace its content with the following configuration:

```groovy
apply plugin: 'java'
apply plugin: 'groovy'
apply plugin: 'application'

sourceCompatibility = '1.8'
[compileJava, compileTestJava]*.options*.encoding = 'UTF-8'

version = '1.0'
description = '''Spark Web App developed with Groovy'''
ext.buildId =  new Date().format('yyyy-MM-dd')

if (!hasProperty('mainClass')) {
    ext.mainClass = 'microservice.Main'
}

if (!hasProperty('commitString')) {
    ext.commitString = 'Initial version'
}

mainClassName = 'microservice.Main'

repositories {
    mavenCentral()
}

dependencies {
    compile 'org.codehaus.groovy:groovy-all:2.3.11'
    compile 'com.sparkjava:spark-core:2.5'
    compile 'org.slf4j:slf4j-simple:1.7.21'

    testCompile group: 'junit', name: 'junit', version: '4.10'
}

distributions {
    accs {
        contents {
            into ('/') {
                from (fileTree(dir: file('build/resources/main'), include: '*.json')) {
                    expand(project.properties)
                }
                from installDist
            }
        }
    }
}

task openUrlInBrowser << {
    java.awt.Desktop.desktop.browse "http://localhost:4567/rest/employees".toURI()
}
```

To apply the changes in the NetBeans right-click on the project root node in the Projects tab and choose **Reload Project**

![Reload project][groovy__reload_project_1]

The main logic in our little application is going to be implemented in Groovy, however, the new project wizard created automatically a Java class with a name we provided: **microservice.Main.java**. We need to delete that class to replace it with its Groovy implementation. In the Projects tab find the **Main.java** class (_Source Packages [Java]->microservice->Main.java_), right-click it and choose **Delete**:

![Delete Main.java class][groovy__delete_main_1]

Then we need to add a similar Groovy code. First let's make the Groovy source branch visible - the build.gradle already contains the groovy plugin declaration but there are no source directories associated with Groovy code yet. Right-click the project root and choose **Source roots -> Create source roots**. 

![Create source roots][groovy__create_source_roots_1]

You should be able to see now the _Source Packages [Groovy]_ now. Right-click on it and choose **New->Groovy Class**:

![Create new groovy class][groovy__new_groovy_class_1]

Enter the class name (**Main**) and the package (**microservice**):

![Enter groovy class name and package][groovy__new_groovy_class_2]

Then click **Finish**.
A new empty Groovy class implementation will open:

![Empty Groovy class][groovy__new_groovy_class_3]

For the implementation of the REST service we are going to use the [Spark Java framework](http://sparkjava.com/). Delete the _class Main {...}_ section in the code and paste the following two lines:

```groovy
import static spark.Spark.*

get '/rest/hello', { req, res -> 'Hello World!' }
```
The first line imports a static class _spark.Spark_ which then is going to be used to define the _get_ verb and its implementation as a Groovy closure returning a static string: _Hello World!_. For more information on how to use Spark with Groovy (and Raspberry Pi!) please check the [Spark on Raspberry Pi](https://sparktutorials.github.io/2015/07/17/sparkberry-pi.html) tutorial.  
The final code should look like this:

![Groovy Hello World implementation][groovy__main_groovy_1]

In order to test our code simply right-click anywhere in the code and choose **Run file**:

![Run Groovy Hello World REST example][groovy__run_file_1]

NetBeans will launch the class and the _Output_ window will show the console output:

![Hello World output][groovy__run_file_output_1]

If you can see the _INFO org.eclipse.jetty.server.Server - Started_ at the bottom of the console output it means that the REST service is up and running. You can easily test it - open the browser and paste the following url:

[http://localhost:4567/rest/hello](http://localhost:4567/rest/hello)

You should see our Hello World! message as a static output:

![Browser showing Hello World!][groovy__browser_hello_1]

### Serving employees data

Next step involves implementing a business logic to serve the employees data. Let's create a bootstrap JSON file with initial map containing some sample employees. Right-click on the _Resource [Main]_ branch in the _Projects_ tab and choose **New->JSON File...**:

![Create data.json file][groovy__new_json_data_1]

In the dialog window enter the file name (**data** - without the .json extension) and make sire the folder is _src\main\resources_:

![Enter the file name: data.json][groovy__new_json_data_2]

Then click **Finish**.  
When the new data.json file opens in the NetBeans editor replace its content with the following snippet:

```javascript
{
    "employees": {
        "100": {
            "employeeId": 100,
            "firstName": "John",
            "lastName": "Smith"
        },
        "101": {
            "employeeId": 101,
            "firstName": "Jack",
            "lastName": "Novak"                
        },
        "102": {
            "employeeId": 102,
            "firstName": "Julia",
            "lastName": "Roberts"                
        }
    }
}
```

The editor should look like in the screeshot below:

![Data.json in the NetBeans editor][groovy__new_json_data_3]

As you can see, we have defined a JSON map with 3 sample employees, where the key is the _employeeId_ attribute. We will keep the employees data in this form in memory (as a map) to make it easy to perform basic CRUD operation (in our simple case just get and put). Of course in real implementation we should consider using some more persistent data storage, e.g. a database (SQL or NoSQL).  
We should change the Groovy code to start using our new data file. Copy the snippet below and replace the _Main.groovy_ content:

```groovy
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package microservice

import static spark.Spark.*
import groovy.json.JsonSlurper
import groovy.json.JsonOutput

Optional<String> accsHost = Optional.ofNullable(System.getenv("HOSTNAME"))
Optional<String> accsPort = Optional.ofNullable(System.getenv("PORT"))

String listenHost = accsHost.orElse("localhost")
int listenPort = accsPort.orElse("4567") as int

ipAddress(listenHost)
port(listenPort)

def jsonSlurper = new JsonSlurper()

def file = new File('src/main/resources/data.json')

def data = jsonSlurper.parse(file)

def employees = data.employees 

get '/rest/hello', { req, res -> 'Hello World!' }

get '/rest/employees', { req,res ->
    return JsonOutput.toJson(employees.collect(){ k,v -> v })
}

get '/rest/employees/:employeeId', { req, res ->
    def empId = req.params(":employeeId")
    def emp = employees[empId]
    if (emp != null) {
        return JsonOutput.toJson(emp)
    } else {
        res.status(404)
    }
}

put '/rest/employees/:employeeId', { req, res ->
    def empId = req.params(":employeeId")
    def body = req.body()
    def emp = jsonSlurper.parseText(body)
    
    employees[empId] = emp
    
    return body
}

// Enables CORS on requests. This method is an initialization method and should be called once.

options '/*', {request, response ->          
    String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
    if (accessControlRequestHeaders != null) {
        response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
    }
    
    String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
    if (accessControlRequestMethod != null) {
        response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
    }
    
    return "OK";
}

before {request, response ->
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Request-Method', 'GET, POST, PUT');
    //response.header('Access-Control-Allow-Headers', headers);
    // Note: this may or may not be necessary in your particular application
    response.type('application/json');
}

```

Let's review quickly the code we have just pasted:

* Importing the _JsonSlurper_ and _JsonOutput_ groovy classes:

```groovy
import groovy.json.JsonSlurper 
import groovy.json.JsonOutput
```

This simply imports two utility classes for parsing and generating JSON. You can find more details in the Groovy docs: [JsonSlurper](http://docs.groovy-lang.org/latest/html/gapi/groovy/json/JsonSlurper.html) and [JsonOutput](http://docs.groovy-lang.org/latest/html/gapi/groovy/json/JsonOutput.html)

* Getting the hostname and port to listen on:

```groovy
Optional<String> accsHost = Optional.ofNullable(System.getenv("HOSTNAME"))
Optional<String> accsPort = Optional.ofNullable(System.getenv("PORT"))
String listenHost = accsHost.orElse("localhost")
int listenPort = accsPort.orElse("4567") as int
```

This block of code tries to obtain the hostname and port we should listen on from two environment variables: **HOSTNAME** and **PORT**. When we deploy our microservice to the Oracle Application Container Cloud Service we should not listen on any arbitrary port, but instead those two variables will carry the information about the container we are running in. You will find more information in the [Design Consideration](http://docs.oracle.com/en/cloud/paas/app-container-cloud/dvcjv/design-considerations.html#GUID-06172FD2-778D-4882-9BE9-0C1ED9484E8E) section of the ACCS documentation.
To make it easier to run our app both in local and cloud environment, we use the Java 8 Optional class to try to fetch the hostname and port, and if they are not available we fall back to default _localhost:4567_.

* Setting the hostname and port in the Spark framework

```groovy
ipAddress(listenHost)
port(listenPort)
```

Those two line simply configures the Spark HTTP engine (Jetty internally) to listen on our _listenHost_ and _listenPort_ values.

* Parsing the data.json file and storing it in memory
```groovy
def jsonSlurper = new JsonSlurper()
def file = new File('src/main/resources/data.json')
def data = jsonSlurper.parse(file)
def employees = data.employees 
```

This part loads the _data.json_ file and parses it using a _JsonSlurper_ instance. Then we store the internal employees structure in a new _employees_ variable. 

* Defining a GET operation to return all employees:

```groovy
get '/rest/employees', { req,res ->
    return JsonOutput.toJson(employees.collect(){ k,v -> v })
}
```

We configure here the Spark engine to return a **list** of all employees. Notice that we need to convert the internal _map_ structure to the _list_ - this is done by Groovy's _collect_ operation with a closure reducing the key/value collection to a new one containing only values.

* Storing a new employee in the map with a PUT operation:

```groovy
put '/rest/employees/:employeeId', { req, res ->
    def empId = req.params(":employeeId")
    def body = req.body()
    def emp = jsonSlurper.parseText(body)
    
    employees[empId] = emp
    
    return body
}
```

Another Spark configuration - this time we map a PUT verb on the _/rest/employee/:employeeId_ url and define a closure to extract the body of a new employee and store it in the _employees_ map based on the template variable _:employeeId_.

* Enabling CORS:

```groovy
// Enables CORS on requests. This method is an initialization method and should be called once.

options '/*', {request, response ->          
    String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
    if (accessControlRequestHeaders != null) {
        response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
    }
    
    String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
    if (accessControlRequestMethod != null) {
        response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
    }
    
    return "OK";
}

before {request, response ->
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Request-Method', 'GET, POST, PUT');
    //response.header('Access-Control-Allow-Headers', headers);
    // Note: this may or may not be necessary in your particular application
    response.type('application/json');
}
```

Finally we need to remember about setting the correct CORS headers - this is necessary as we are going to use our REST service in another JavaScript front-end application, which should and will be running on completely different host (especially - while testing - on localhost). Without setting the CORS headers the browser would block the communication from the page to our REST service.

Having finished with our business logic let's test it! Right-click on the Main.groovy script and choose **Run File**. When the service starts, open the followin url in the browser:

[http://localhost:4567/rest/employees](http://localhost:4567/rest/employees)

You may also launch the browser and open this URL entirely from the command line - the following example is one of many Gradle goodies we may use to automate common tasks and improve our productivity. Open the command line and go to the main project folder. Then enter the following command:

```shell
gradle oUIB
```

Then watch the magic! For the those curious on how it works please revisit the _build.gradle_ file and pay attention to the following snippet (at the bottom of the page):

```groovy
task openUrlInBrowser << {
    java.awt.Desktop.desktop.browse "http://localhost:4567/rest/employees".toURI()
}
```

Getting back to our browser - here is a screenshot showing how it should look like:

![Employees data in browser][groovy__browser_employees_1]

You may want to play with GET and PUT operations to see how the logic works. It is recommended to use some tools like [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop) to make it a little bit easier.

### Creating a package for ACCS

Oracle ACCS allows running any Java SE (or Node.js or PHP - more to come) application, the only requirement is the correct packaging. To put it simply, we need to create a ZIP with **all** necessary artifacts (including direct and transient libraries as well as configuration/runtime/data files) plus additional file called _manifest.json_ to define some ACCS metadata. You can find more details in the [Packaging Your Application](http://docs.oracle.com/en/cloud/paas/app-container-cloud/dvcjv/packaging-your-application.html#GUID-5A386AAA-2187-4516-85B7-058BF7A5BC34) section of the ACCS docs.
 In our tutorial we use the power of Gradle to prepare such package with minimum configuration effort. More important - the same packaging task can be used later on in Oracle Developer Cloud Service to automatically build and package our artifacts and then deploy it to the ACCS. We start with a small fix to our current code. You may notice that the path to the _data.json_ file is hardcoded as _src/main/resources/data.json_. This is a problem - the source directory exists in our development environment, but will not be (by default) included in any production package. We need to shorten it to just _data.json_ - the rest should be done by the packaging task itself.  
 Open the _Main.groovy_ file and change the line defining the _file_ variable as follows:

```groovy
def file = new File('data.json')
```

The code around this line should look like this:

![Fixed path to data.json][groovy__path_to_data_1]

Once changed we will not be able to run the code from the IDE anymore (unless we copy this file to the project root to match the new path). Instead lets use the Gradle _application_ plugin defined in our build script to install and run the app from the command line. Stop the application in the IDE (if it is still running), open the command line, go to the project root and enter the following command:

```shell
gradle installAccsDist
```

You should see the console output similar to the screenshot below:

![Gradle install output][groovy__gradle_install_dist_1]

The job of this task (_installAccsDist_) is to: 

* create an installation of the application with the standard folder layout, as described in the _application_ Gradle plugin (check out the [docs](https://docs.gradle.org/current/userguide/application_plugin.html))
* amend this installation with a custom logic defined in an additonal accs distribution configuration

The configuration of the above mentioned accs distribution is defined in the _build.gradle_ as follows:

```groovy
distributions {
    accs {
        contents {
            into ('/') {
                from (fileTree(dir: file('build/resources/main'), include: '*.json')) {
                    expand(project.properties)
                }
                from installDist
            }
        }
    }
}
```
As you can figure out, in addition to the default installation (_lib_ and _bin_ folders) we copy all the .json files found in the resources directory to the root folder of the resulting application installation. This explains our change in the code (shortening the path of _data.json_).  
If you want to test the installation open a command line (or re-use the existing one - make sure you are in the project root folder) and enter following commands (if you use Windows):

```
cd build\install\GroovyMicroservice-accs
bin\GroovyMicroservice.bat
```

or on Linux/Mac/Unix:

```
cd build/install/GroovyMicroservice-accs
./bin/GroovyMicroservice
```

The app should start as usual, showing the following output:

![Run from installation][groovy__run_local_1] 

Our microservice is almost ready to be deployed to the ACCS. The only missing part is the aforementioned manifest file with ACCS metadata. Let's create it now.  
Go back to your NetBeans, right-click the _Resources [Main] -> default package_ node and choose **New->JSON File...**:

![New manifest.json file][groovy__new_json_manifest_1]

Enter the name **manifest** (without .json extention) and click **Finish**:

![Manifest.json name][groovy__new_json_manifest_2]

Then replace the default content with the following snippet:

```json
{
    "runtime": {
        "majorVersion": "8"
    },
    "command": "bash bin/${name}",
    "release": {
        "build": "${buildId}",
        "commit": "${commitString}",
        "version": "${version}"
    },
    "notes": "${description}"
}
```
You can see a basic manifest structure allowing us to pass necessary information to the ACCS during the deployment. This file should be placed in the **root** of the ZIP package - this is done by the amended installation task we explained before. You may notice that most attributes in this file are really tokens to be replaced (following the Groovy pattern) - this is handled by the _...expand(project.properties)..._ construct of the installation task definition, which provides a map with all project properties to be expanded during the installation.  
The most important setting here is the _command_ part - it is taken literary from here and executed in the target ACCS container just after un-zipping the contents of the package. The command should start our application. After executing the command, the ACCS will verify if the deployment was successful by checking if there is any process listening on the host and port provided by the **HOSTNAME** and **PORT** environment variables. If no listening process is detected, the deployment is marked as failed.  
Now, in order to create the package, open the command line, go to the project root and enter the following command:

```
gradle accsDistZip
```

You should see the output similar to the following:

![Distribution task output][groovy__gradle_dist_accs_1]

This task creates a ZIP from the _accs_ distribution (with all custom enhancements from the _build.gradle_ file). You can check the content of the ZIP and verify if everything has been correctly packaged by opening the archive with any zip tool (it is located in the _build/distributions_ directory). The archive should look similar to the following screenshot:

![Distribution archive][groovy__gradle_dist_accs_2]
![Distribution archive][groovy__gradle_dist_accs_3]

Please make sure that both the _data.json_ and _manifest.json_ files are located in the root of the archive. If this is the case, you can proceed to deploying our application to the ACCS (this task is covered in another lab).

[groovy__new_project_1]: docs/images/groovy__new_project_1.png
[groovy__new_project_2]: docs/images/groovy__new_project_2.png
[groovy__new_project_3]: docs/images/groovy__new_project_3.png
[groovy__reload_project_1]: docs/images/groovy__reload_project_1.png
[groovy__delete_main_1]: docs/images/groovy__delete_main_1.png
[groovy__create_source_roots_1]: docs/images/groovy__create_source_roots_1.png
[groovy__new_groovy_class_1]: docs/images/groovy__new_groovy_class_1.png
[groovy__new_groovy_class_2]: docs/images/groovy__new_groovy_class_2.png
[groovy__new_groovy_class_3]: docs/images/groovy__new_groovy_class_3.png
[groovy__main_groovy_1]: docs/images/groovy__main_groovy_1.png
[groovy__run_file_1]: docs/images/groovy__run_file_1.png
[groovy__run_file_output_1]: docs/images/groovy__run_file_output_1.png
[groovy__browser_hello_1]: docs/images/groovy__browser_hello_1.png
[groovy__new_json_data_1]: docs/images/groovy__new_json_data_1.png
[groovy__new_json_data_2]: docs/images/groovy__new_json_data_2.png
[groovy__new_json_data_3]: docs/images/groovy__new_json_data_3.png
[groovy__browser_employees_1]: docs/images/groovy__browser_employees_1.png
[groovy__path_to_data_1]: docs/images/groovy__path_to_data_1.png
[groovy__gradle_install_dist_1]: docs/images/groovy__gradle_install_dist_1.png
[groovy__run_local_1]: docs/images/groovy__run_local_1.png
[groovy__new_json_manifest_1]: docs/images/groovy__new_json_manifest_1.png
[groovy__new_json_manifest_2]: docs/images/groovy__new_json_manifest_2.png
[groovy__new_json_manifest_3]: docs/images/groovy__new_json_manifest_3.png
[groovy__gradle_dist_accs_1]: docs/images/groovy__gradle_dist_accs_1.png
[groovy__gradle_dist_accs_2]: docs/images/groovy__gradle_dist_accs_2.png
[groovy__gradle_dist_accs_2]: docs/images/groovy__gradle_dist_accs_3.png

