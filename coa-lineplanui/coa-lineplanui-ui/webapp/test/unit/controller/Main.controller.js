/*global QUnit*/

sap.ui.define([
	"coa/coa-lineplan-ui/controller/Main.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Main Controller");

	QUnit.test("I should test the Main controller", function (assert) {
		var oAppController = new Controller();
		//oAppController.onInit();
		assert.ok(oAppController);
	});
	QUnit.test("formatDate", function (assert){
		this.oController = new Controller();
		jQuery.sap.require("sap.ui.core.format.DateFormat");
        var fText = this.oController.formatDate('2022/07/13');
        assert.equal(fText, 'Jul 13 2022 00:00:00', 'formatDate function');

    });

});
