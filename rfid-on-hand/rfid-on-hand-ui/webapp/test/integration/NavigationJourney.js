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
		Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true",  width: 1400, height: 900 }).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });

		// Assertions
		Then.onTheAppPage.iShouldSeeTheApp();
      	Then.onTheViewPage.iShouldSeeThePageView();

		//Cleanup
		// Then.iTeardownMyAppFrame();
	});

    // opaTest("Should test Export to Excel", function(Given, When, Then){
    //     When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnExcelExport-internalSplitBtn-textButton"); 
    // });

    opaTest("Should test Mass Update", function(Given, When, Then){
        
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("OTBRefresh");
        // When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("OTBSave");
        // When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0);
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldFillDatainInput("inptosite-inner","some value","sap.m.Input");
        When.onTheViewPage.iShouldFillDatainInput("inpcomment-inner","some value","sap.m.TextArea");
        When.onTheViewPage.iShouldClickButtonInFragment("Save");
        // When.onTheViewPage.iShouldClickonButton("OTBSave");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0);
        When.onTheViewPage.iShouldClickonButton("OTBReject");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0);
        When.onTheViewPage.iShouldClickonButton("OTBApprove");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0);
        When.onTheViewPage.iShouldClickonButton("OTBHistory");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0);
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnExcelExport-internalSplitBtn-textButton"); 
        When.onTheViewPage.iShouldClickButtonInFragment("Close"); 
        When.onTheViewPage.iShouldClickonButton("OTBReject");
        When.onTheViewPage.iShouldClickButtonInFragment("Close"); 
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0);
        When.onTheViewPage.iShouldClickonButton("OTBApprove");
        When.onTheViewPage.iShouldClickButtonInFragment("Close"); 
        // When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("OTBApprove");
        When.onTheViewPage.iShouldClickonButton("OTBReject");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",2);
        When.onTheViewPage.iShouldClickonButton("OTBApprove");
        When.onTheViewPage.iShouldClickonButton("OTBReject");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",3);
        When.onTheViewPage.iShouldClickonButton("OTBReject");
        When.onTheViewPage.iShouldClickonButton("OTBRefresh");
        // When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnEditToggle");
        // When.onTheViewPage.iShouldClickonButton("OTBCancelRequest");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",2);
        When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--OTBCancelRequest-unifiedmenu");
        When.onTheViewPage.iShouldClickButtonInFragment("OK");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");

        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0,true);
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldClickButtonInFragment("OK");
        When.onTheViewPage.iShouldFillDatainInput("inptosite-inner","some value","sap.m.Input");
        When.onTheViewPage.iShouldFillDatainInput("inpcomment-inner","some value","sap.m.TextArea");
        When.onTheViewPage.iShouldClickButtonInFragment("Save");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");

        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0,true);
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldClickButtonInFragment("Cancel");


        When.onTheViewPage.iShouldSelectAllCheckboxes("idMPTab");
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldClickButtonInFragment("OK");
        When.onTheViewPage.iShouldFillDatainInput("inptosite-inner","some value","sap.m.Input");
        When.onTheViewPage.iShouldFillDatainInput("inpcomment-inner","some value","sap.m.TextArea");
        When.onTheViewPage.iShouldClickButtonInFragment("Save");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        // When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--rfidonhandtable-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--OTBReset-unifiedmenu");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",1);
        When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--OTBReset-unifiedmenu");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",2);
        When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--OTBReset-unifiedmenu");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0,true);
        When.onTheViewPage.iShouldClickonButton("OTBApprove");
        When.onTheViewPage.iShouldClickButtonInFragment("Close");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",3,true);
        When.onTheViewPage.iShouldClickonButton("OTBApprove");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",4,true);
        When.onTheViewPage.iShouldClickonButton("OTBApprove");
        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",4,true);
        When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
        When.onTheViewPage.iShouldClickonButton("container-coa.rfidonhand---Main--OTBReset-unifiedmenu");

        When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",0);
        When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
        When.onTheViewPage.iShouldClickButtonInFragment("Save");

        // When.onTheViewPage.iShouldClickButtonInFragment("Close");
        // When.onTheViewPage.iShouldClickonButton("OTBReset");
        // When.onTheViewPage.iShouldClickButtonInFragment("Close");


        //Cleanup
		Then.iTeardownMyAppFrame();
        
    });
});
