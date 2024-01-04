/*global QUnit*/

sap.ui.define([
	"coa/annotation/rfidannotationui/controller/Main.controller"
], function (Controller,Base) {
	"use strict";

	QUnit.module("Main Controller");

	QUnit.test("I should test the Main controller", function (assert) {
		// var oAppController = new Controller();
		// oAppController.onInit();
		assert.ok(oAppController);
	});

});
