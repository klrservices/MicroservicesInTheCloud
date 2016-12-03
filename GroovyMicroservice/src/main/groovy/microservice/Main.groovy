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

def file = new File('data.json')

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

