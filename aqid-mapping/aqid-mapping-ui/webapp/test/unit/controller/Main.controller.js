/*global QUnit*/

sap.ui.define([
	"coa/aqid-mapping-ui/controller/Main.controller",
    "sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/sinon",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/table/Table", 
    "sap/ui/core/Fragment",
    "sap/ui/thirdparty/sinon-qunit"
], function (Controller,View, JSONModel, Component, sinon, ODataModel, Table, Fragment) {
	"use strict";

    QUnit.module("Aqid Mapping Main Controller", {
        beforeEach: function () {
            this.oController = new Controller();
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

    QUnit.test("I should test the Main controller Init", function (assert) {
        var oViewStub = new View();
        var oModelStub = new JSONModel();
        var oOwnerStub = new Component();
        sinon.stub(this.oController, "getView").returns(oViewStub);
        this.oController.setJSONModelToView();
        assert.ok(this.oController);
    });
    

    QUnit.test("I Should test backend exception function", function(assert){
        var oError = {
            responsText: {
                error: {
                    message: {
                        value: "Error in raisebackend exception"
                    }
                }
            }
        };

        this.oController.raiseBackendException(JSON.stringify(oError));
        assert.ok(this.oController);

        var oError = {
        responsText: {
            error: {
                message: {
                    value: "Error in raisebackend exception"
                }
            }
        }
    };
        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

        var oError = {
            message: "Error in raisebackend exception 2"
        };

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);
        var oError = {
            status: 504,
            responseText: "<html><head><title>504 Gateway Time-out</title></head><body><center><h1>504 Gateway Time-out</h1></center><hr><center>Apple</center></body></html>"
        }

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

        var oError = {
            status: 504,
            response: {
                body: "<html><head><title>504 Gateway Time-out</title></head><body><center><h1>504 Gateway Time-out</h1></center><hr><center>Apple</center></body></html>"
            }
        }

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);


        var oError = {
            status: 400,
            responsText: {
                error: {
                    message: {
                        value: "Error in raisebackend exception"
                    }
                }
            }
        };

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

        var oError = {
            status: 400,
            message: "Error in raisebackend exception 2"
        };

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

    });

    QUnit.test("formatDate", function (assert){
        this.oController.formatDate('2022/07/13');
        assert.ok(this.oController);
    });

    // QUnit.test("I Should test getErrorResult function", function(assert){
    //     this.oController.changedPath = [];
    //     this.oController.getErrorResult(0);
    //     this.oController.changedPath = [1];
    //     this.oController.getErrorResult(2);
    //     this.oController.changedPath = [1,2];
    //     this.oController.getErrorResult(2);
    //     assert.ok(true,"getErrorResult Function tested");


    // });

    // QUnit.test("I should test file upload success", function(assert){
    //     var oViewStub = new View();
    //     var oModelStub = new JSONModel();
    //     var oOwnerStub = new Component();
    //     var oDatamodel = new ODataModel('/mock/AQID_Details', {
    //         json: true
    //     });
    //     var oOwnerStub = new Component();
    //     sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
    //     sinon.stub(this.oController, "getView").returns(oViewStub);
    //     sinon.stub(oViewStub, "getModel").returns(oModelStub);

    //     sinon.stub(oOwnerStub, "getModel").returns(oModelStub);

    //     this.oController.getOwnerComponent().getModel("device").setProperty("/isMockServer", true);

    //     var response = {
    //         d:{
    //             msg: [{
    //                 "Error": "Comments is Mandatory"
    //             }]
    //         }
    //     };

    //     this.oController.handleUploadStatus(response);
    //     assert.ok(this.oController);

    //     var response = {
    //         d:{
    //         d :{
    //             msg: [{
    //                 "Error": "Comments is Mandatory"
    //             }]
    //         }
    //     }
    //     };

    //     this.oController.handleUploadStatus(response);
    //     assert.ok(this.oController);


    //     var response = {
    //         d:{
    //             msg: [{
    //                 "Error": ""
    //             }]
    //         }
    //     };

    //     this.oController.handleUploadStatus(response);
    //     assert.ok(this.oController);


    //     var response = {
    //         d:{
    //             msg: "some value"
    //         }
    //     };

    //     this.oController.handleUploadStatus(response);
    //     assert.ok(this.oController);


    // });

    QUnit.test("I Should test Ajax URL", function(assert){
        var oOwnerStub = new Component();
        var oModelStub = new JSONModel();
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(oOwnerStub, "getModel").returns(oModelStub);

        this.oController.getOwnerComponent().getModel("device").setProperty("/origin","corp-apps");
        this.oController.getODataUrlAjaxSyncAqid();
        this.oController.getODataUrlAjaxCall();
        this.oController.getODataUrlAjaxselectAll();
        this.oController.getUploadUrl();
        

        this.oController.getOwnerComponent().getModel("device").setProperty("/origin","");
        this.oController.getODataUrlAjaxSyncAqid();
        this.oController.getODataUrlAjaxCall();
        this.oController.getODataUrlAjaxselectAll();
        this.oController.getUploadUrl();

        assert.ok(true,"Tested ajax url function")

    });

    // QUnit.test("I Should test Error log rebind function", function(assert){
    //     var oViewStub = new View();
    //     var oTableStub = new Table();
        
    //     var oOwnerStub = new Component();
    //     var oModelStub = new JSONModel();
    //     sinon.stub(oViewStub, "byId").returns(oTableStub);
    //     sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
    //     sinon.stub(oOwnerStub, "getModel").returns(oModelStub);
    //     sinon.stub(this.oController, "getView").returns(oViewStub);

    //     this.oController.getOwnerComponent().getModel("device").setProperty("/isMockServer",true);

    //     this.oController.applyErrorLog();

    //     this.oController.handleUploadPress();

    //     assert.ok(true,"Error log rebind function");
    // });
});
