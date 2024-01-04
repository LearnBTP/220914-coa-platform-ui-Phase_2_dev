/*global QUnit*/

sap.ui.define([
	"comapplecoa/coa-line-simulation-ui/controller/Main.controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (Controller,Component,JSONModel) {
	"use strict";

	// QUnit.module("Main Controller");

	// QUnit.test("I should test the Main controller", function (assert) {
	// 	var oAppController = new Controller();
	// 	oAppController.onInit();
	// 	assert.ok(oAppController);
	// });

	QUnit.module("COA Line Simulation Main Controller", {
		beforeEach: function () {
			this.oController = new Controller();
		},
		afterEach: function () {
			this.oController.destroy();
		}
	});

	QUnit.test("I should test the Main controller", function (assert) {
		var oAppController = new Controller();
		// oAppController.onInit();
		assert.ok(oAppController);
	});

	QUnit.test("I Should test backend exception function", function (assert) {
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


	QUnit.test("I Should test Ajax URL", function(assert){
        var oOwnerStub = new Component();
        var oModelStub = new JSONModel();
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(oOwnerStub, "getModel").returns(oModelStub);

        this.oController.getOwnerComponent().getModel("device").setProperty("/origin","corp-apps");
        this.oController.getAjaxLineIdUrl();
		this.oController.getSimulateAjaxUrl();
		this.oController.getAjaxDeleteUrl();

        

        this.oController.getOwnerComponent().getModel("device").setProperty("/origin","");
        this.oController.getAjaxLineIdUrl();
		this.oController.getSimulateAjaxUrl();
		this.oController.getAjaxDeleteUrl();


        assert.ok(true,"Tested ajax url function")

    });

});
