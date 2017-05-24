/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['ojs/ojcore'], function (oj) {

    var EmpsFactory = {
        resourceUrl: 'http://localhost:4567/rest/employees',

        // Create a single employee instance.
        createEmpsModel: function (response) {
            var Emp = oj.Model.extend({
                urlRoot: this.resourceUrl
                , parse: parseEmp = function (response) {
                    return {
                        employeeId: response['employeeId'],
                        firstName: response['firstName'],
                        lastName: response['lastName']
                    };
                }
                //  parse: parseData=function(){ return {contentType: "application/vnd.oracle.adf.resourceitem+json"}; } ,
                , parseSave: parseSaveEmp = function (response) {
                    return {
                        employeeId: response['employeeId'],
                        firstName: response['firstName'],
                        lastName: response['lastName']
                    };
                }
                , idAttribute: "employeeId"});
            return new Emp();
        },

        // Create an emps collection.
        createEmpsCollection: function () {
            var Emps = oj.Collection.extend({
                url: this.resourceUrl
                , model: this.createEmpsModel()
            });

            return new Emps();
        }
    };

    return EmpsFactory;
});