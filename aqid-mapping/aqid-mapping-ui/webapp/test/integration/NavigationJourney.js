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
        // Arrangements
		Given.iStartMyAppInAFrame("../../index.html?responderOn=true").done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
		// Given.iStartMyApp();

		// Assertions
		// Then.onTheAppPage.iShouldSeeTheApp();
      	// Then.onTheViewPage.iShouldSeeThePageView();

		//Cleanup
		// Then.iTeardownMyApp();
	});


    // Click on Mass Update Button
    opaTest("Should click on Mass Update button",function(Given, When, Then){
        // When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--lastSyncdata");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--syncaqid");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--AqidMappingTable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldFillDatainInput("inpcmrecedit-inner","some value","sap.m.Input");
        When.onTheViewPage.iShouldFillDatainInput("inpcomment-inner","some value","sap.m.TextArea");
        When.onTheViewPage.iShouldClickButtonInFragment("Save");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        // When.onTheViewPage.iShouldClickonButton("OTBSave");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--OTBRefresh");
        When.onTheViewPage.iShouldClickonButton("OTBHistory");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--AqidMappingTable-btnExcelExport-internalSplitBtn-textButton");
        When.onTheViewPage.iShouldClickButtonInFragment("Close"); 
        When.onTheViewPage.iShouldClickonButton("lastSyncdata");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--AqidMappingTable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--AqidMappingTable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("OTBSave");
        

        // When.onTheViewPage.iShouldClickButtonInFragment("Close");


        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",true,"test comm");
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldClickButtonInFragment("OK");
        When.onTheViewPage.iShouldFillDatainInput("inptosite-inner","some value","sap.m.Input");
        When.onTheViewPage.iShouldFillDatainInput("inpcomment-inner","some value","sap.m.TextArea");
        When.onTheViewPage.iShouldClickButtonInFragment("Save");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");

        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",true,"test comm");
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldClickButtonInFragment("Cancel");

        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",true,null);
        When.onTheViewPage.iShouldClickonButton("OTBSave");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");

        When.onTheViewPage.iShouldSelectAllCheckboxes("idMPTab");
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldFillDatainInput("inptosite-inner","some value","sap.m.Input");
        When.onTheViewPage.iShouldFillDatainInput("inpcomment-inner","some value","sap.m.TextArea");
        When.onTheViewPage.iShouldClickButtonInFragment("Save");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");

        // When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--AqidMappingTable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("container-coa.aqidmappingui---Main--OTBRefresh");

        

        Then.iTeardownMyAppFrame();

    });
    
});
