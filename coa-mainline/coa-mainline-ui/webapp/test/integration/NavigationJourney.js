/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
	"./pages/App",
	"./pages/MainLine"
], function (opaTest,Opa5) {
	"use strict";
	QUnit.module("Navigation Journey");
	opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
		//Given.iStartMyApp();
        Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true&", width:1500, height:700}).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
		// Assertions
		Then.onTheAppPage.iShouldSeeTheApp();
      	Then.onTheViewPage.iShouldSeeThePageView();
        When.onTheViewPage.iShouldFillF4Input("container-coamainlineui---MainLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldPressButton("OTBRefresh");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--MainLineTab-btnEditToggle");
        When.onTheViewPage.iActionTheControlState("container-coamainlineui---MainLine--MainLineTab-ui5table");
        //When.onTheViewPage.iActionTheControlState();
        //Then.onTheViewPage.iAssertTheControlState("container-coamainlineui---MainLine--MainLineTab-ui5table");
        When.onTheViewPage.iShouldPressButton("OTBMUpload");
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        // Mass Update
        When.onTheViewPage.iShouldPressButton("OTBMUpload");
        When.onTheViewPage.iShouldClickButtonInFragment("BMUclose","Cancel");
        When.onTheViewPage.iShouldPressButton("OTBMUpload");
        When.onTheViewPage.iShouldFillDialogInput("Uph",8,"sap.m.Input");
        When.onTheViewPage.iShouldFillDialogInput("BoH" , 'rt' ,"sap.m.Input");
        When.onTheViewPage.iShouldFillDialogInput("Fatp_Sustaining_Qty" , 8 ,"sap.m.Input");
        When.onTheViewPage.iShouldFillDialogInput("Working_Hrs" , 8 ,"sap.m.Input");
        When.onTheViewPage.iShouldFillDialogInput("Comment","Update","sap.m.Input");
        When.onTheViewPage.iShouldClickButtonInFragment("BMUSubmit","Save");
        When.onTheViewPage.iShouldClickButtonInFragment("OK","OK");

        
        //Cleanup
    //     Then.iTeardownMyAppFrame();
    // });
    // opaTest("Should see the initial page of the app", function (Given, When, Then) {
    //     Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true&", width:1000, height:700}).done(function () {
    //         Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
    //     });
    //     When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--smartFilterBar-btnGo");
    //     When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--MainLineTab-btnEditToggle");
        //  When.onTheViewPage.iSelectItemCheckBox("idMPTab",0,"ALL");
        // // Mass Update
        // When.onTheViewPage.iShouldPressButton("OTBMUpload");
        
        // When.onTheViewPage.iShouldFillDialogInput("Uph",8,"sap.m.Input");
        // When.onTheViewPage.iShouldFillDialogInput("BoH" , 'rt' ,"sap.m.Input");
        // When.onTheViewPage.iShouldFillDialogInput("Fatp_Sustaining_Qty" , 8 ,"sap.m.Input");
        // When.onTheViewPage.iShouldFillDialogInput("Working_Hrs" , 8 ,"sap.m.Input");
        // When.onTheViewPage.iShouldFillDialogInput("Comment","Update","sap.m.Input");
        // When.onTheViewPage.iShouldClickButtonInFragment("BMUSubmit","Save");
        //  When.onTheViewPage.iShouldClickButtonInFragment("Close","Close");
    //     // Cleanup
    //      Then.iTeardownMyAppFrame();
    //     });
    // opaTest("Should see the initial page of the app", function (Given, When, Then) {
    //     Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true&", width:1000, height:700}).done(function () {
    //         Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
    //     });
    When.onTheViewPage.iShouldFillF4Input("container-coamainlineui---MainLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--smartFilterBar-btnGo");
        //When.onTheViewPage.iShouldPressButton("OTBSave");
        When.onTheViewPage.iShouldPressButton("OTBRefresh");
        // Hisotory
        // When.onTheViewPage.iShouldPressButton("OTBHistory");
        // When.onTheViewPage.iShouldClickButtonInFragment("btndialogclose","Close");
        
        // ADD/COPY
        When.onTheViewPage.iShouldFillF4Input("container-coamainlineui---MainLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--MainLineTab-btnEditToggle");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--OTBADD");
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--OTBCopy");
        When.onTheViewPage.iShouldPressButton("OTBSave");
        When.onTheViewPage.iSelectOKOnDialog();

        // Upload
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--fileUploader-fu_button");

        // Delete
        When.onTheViewPage.iShouldFillF4Input("container-coamainlineui---MainLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--MainLineTab-btnEditToggle");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--OTBADD");
        When.onTheViewPage.iShouldPressButton("OTBDelete");
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",2);
        When.onTheViewPage.iShouldPressButton("OTBDelete");
        When.onTheViewPage.iShouldClickButtonInFragment("__button0","Delete");
        When.onTheViewPage.iSelectOKOnDialog();
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        When.onTheViewPage.iShouldPressButton("OTBDelete");
        When.onTheViewPage.iShouldClickButtonInFragment("__button0","Delete");
        When.onTheViewPage.iSelectOKOnDialog();   
       	//Cleanup
        Then.iTeardownMyAppFrame();
    });
    opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
        Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true&", width:1500, height:700}).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
        // Export fileid="container-coamainlineui---MainLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner"
        When.onTheViewPage.iShouldFillF4Input("container-coamainlineui---MainLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--smartFilterBar-btnGo");
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        // When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--OTT-overflowButton");
        When.onTheViewPage.iShouldPressButton("container-coamainlineui---MainLine--MainLineTab-btnExcelExport-internalSplitBtn-textButton");
        When.onTheViewPage.iShouldPressButton("OTBDownloadTemplate");
        When.onTheViewPage.iShouldPressButton("OTBHistory");
        Then.iTeardownMyAppFrame();
    });	    
        opaTest("Should see the no auth page of the app", function (Given, When, Then) {
		 // Arrangements
         Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true&NoAuth=true&", width:1500, height:700}).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
        Then.onTheViewPage.iShouldSeeTheNoAuthPageView();
        Then.iTeardownMyAppFrame();
	});
});
