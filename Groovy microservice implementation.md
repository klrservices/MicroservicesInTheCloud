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

