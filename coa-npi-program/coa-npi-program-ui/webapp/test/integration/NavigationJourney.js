/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"./pages/App",
	"./pages/Main"
], function (opaTest,Opa5) {
	"use strict";

	QUnit.module("Navigation Journey");

	opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
		// Given.iStartMyApp();
		Given.iStartMyAppInAFrame("../../index.html?responderOn=true").done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });

		// Assertions
		// Then.onTheAppPage.iShouldSeeTheApp();
      	// Then.onTheViewPage.iShouldSeeThePageView();

		// //Cleanup
		// Then.iTeardownMyApp();
	});


	opaTest("Should Click on Create Button", function(Given, When, Then){
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--smartFilterBar-btnGo");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--npiprogramsmarttable-btnEditToggle");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",1);
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--npiprogramsmarttable-btnExcelExport-internalSplitBtn-textButton");		
		When.onTheViewPage.iShouldClickButtonInFragment("Close")
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--npiprogramsmarttable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--OTBDelete");
		When.onTheViewPage.iShouldClickButtonInFragment("Cancel");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--OTBCreate");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",1);
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--OTBDelete");
		When.onTheViewPage.iShouldClickButtonInFragment("Delete");
		When.onTheViewPage.iShouldClickButtonInFragment("OK");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",1);
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--OTBDelete");
		When.onTheViewPage.iShouldClickButtonInFragment("Delete")
		// When.onTheViewPage.iShouldClickButtonInFragment("OK");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",1);
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--npiprogramsmarttable-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--npiprogramsmarttable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--OTBCreate");
		When.onTheViewPage.iShouldFillDatainRow("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBSave");
		When.onTheViewPage.iShouldClickButtonInFragment("OK");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--npiprogramsmarttable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("OTBSave");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		When.onTheViewPage.iShouldClickonButton("OTBHistory");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");

		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--npiprogramsmarttable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--OTBCreate");
		When.onTheViewPage.iShouldClickonButton("OTBSave");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanpiprogramui---Main--smartFilterBar-btnGo");



		Then.iTeardownMyAppFrame();
	});
});
