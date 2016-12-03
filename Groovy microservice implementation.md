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

![http://localhost:4567/rest/hello](http://localhost:4567/rest/hello)

You should see our Hello World! message as a only static output:

![Browser showing Hello World!][groovy__browser_hello_1]


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

