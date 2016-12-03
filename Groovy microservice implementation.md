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

