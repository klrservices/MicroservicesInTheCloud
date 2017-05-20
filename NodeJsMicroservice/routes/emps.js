/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var express = require('express');
var fs = require('fs');
var router = express.Router();

var data = __dirname + '/../data.json';
var emps = JSON.parse(fs.readFileSync(data, 'utf8'));

/* GET emps listing. */
router.get('/employees', function (req, res, next) {
    var empList = Object.keys(emps.employees).map(function(empId){
       return emps.employees[empId]; 
    });
            
    res.send(empList);
});

router.get('/employees/:empId', function (req, res, next) {
    var emp = emps.employees[req.params.empId];
    if (emp) {
        res.json(emp);
    } else {
        next();
    }
});

router.put('/employees/:empId', function (req, res, next) {
    var empId = req.params.empId;
    var emp = req.body;
    
    emps.employees[empId] = emp;
    res.json(emp);
});

module.exports = router;
