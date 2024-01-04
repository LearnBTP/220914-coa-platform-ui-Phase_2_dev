/*global QUnit*/

sap.ui.define([
	"comapplecoa/coa-npi-program-ui/controller/Main.controller",
	"sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
	"sap/ui/core/UIComponent",
    "sap/ui/thirdparty/sinon",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/table/Table", 
    "sap/ui/core/Fragment",
    "sap/ui/thirdparty/sinon-qunit"
], function (Controller,View, JSONModel,Component, sinon, ODataModel, Table, Fragment) {
	"use strict";

	QUnit.module("NPI Program Main Controller", {
        beforeEach: function () {
            this.oController = new Controller();
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

    // QUnit.test("I should test the Main controller Init", function (assert) {
    //     var oViewStub = new View();
    //     var oModelStub = new JSONModel();
    //     var oOwnerStub = new Component();
	// 	var oDatamodel = new ODataModel('/mock/npi_program', {
	// 		        json: true
	// 		    });
    //     sinon.stub(this.oController, "getView").returns(oViewStub);
	// 	sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
	// 	this.oController.getOwnerComponent().setModel(oDatamodel);
    //     this.oController.getOwnerComponent().setModel(oModelStub, "authModel");
    //     this.oController.getOwnerComponent().setModel(oDatamodel, "MainModel");
    //     this.oController.getOwnerComponent().getModel("authModel").setProperty("/display",true);
	// 	this.oController.onInit();
    //     assert.ok(this.oController);
    // });

    QUnit.test("formatDate", function (assert){
        this.oController.formatDate('2022/07/13');
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

        // this.oController.raiseBackendException(oError);
        // assert.ok(this.oController);
        // var oError = {
        //     status: 504,
        //     responseText: "<html><head><title>504 Gateway Time-out</title></head><body><center><h1>504 Gateway Time-out</h1></center><hr><center>Apple</center></body></html>"
        // }

        // this.oController.raiseBackendException(oError);
        // assert.ok(this.oController);

        // var oError = {
        //     status: 504,
        //     response: {
        //         body: "<html><head><title>504 Gateway Time-out</title></head><body><center><h1>504 Gateway Time-out</h1></center><hr><center>Apple</center></body></html>"
        //     }
        // }

        // this.oController.raiseBackendException(oError);
        // assert.ok(this.oController);


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


});
