/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
	"./pages/App"
], function (opaTest,Opa5) {
	"use strict";

	QUnit.module("Navigation Journey");
	opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
        Given.iStartMyAppInAFrame("../../index.html").done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
		//Cleanup
		Then.iTeardownMyAppFrame();
	});
});
