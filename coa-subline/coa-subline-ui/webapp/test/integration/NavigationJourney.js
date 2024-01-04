/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
	"./pages/App",
	"./pages/SubLine"
], function (opaTest,Opa5) {
	"use strict";

	QUnit.module("Navigation Journey");

	opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
        Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true&", width:1500, height:700}).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });

		// Assertions
		Then.onTheAppPage.iShouldSeeTheApp();
      	Then.onTheViewPage.iShouldSeeThePageView();
         When.onTheViewPage.iShouldFillF4Input("container-coasublineui---SubLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldPressButton("OTBRefresh");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--SubLineTab-btnEditToggle");
        When.onTheViewPage.iActionTheControlState("container-coamainlineui---MainLine--MainLineTab-ui5table");
        When.onTheViewPage.iShouldPressButton("OTBMUpload");
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        // Mass Update
        When.onTheViewPage.iShouldPressButton("OTBMUpload");
        When.onTheViewPage.iShouldClickButtonInFragment("BMUclose","Cancel");
        When.onTheViewPage.iShouldPressButton("OTBMUpload");
       // When.onTheViewPage.iShouldFillDialogInput("Uph",8,"sap.m.Input");
        When.onTheViewPage.iShouldFillDialogInput("boH_Qty" , 'rt' ,"sap.m.Input");
        When.onTheViewPage.iShouldFillDialogInput("Remote_Site_Cap_Demand" , 8 ,"sap.m.Input");
        When.onTheViewPage.iShouldFillDialogInput("Working_Hrs" , 8 ,"sap.m.Input");
        When.onTheViewPage.iShouldFillDialogInput("Comment","Update","sap.m.Input");
        When.onTheViewPage.iShouldClickButtonInFragment("BMUSubmit","Save");
        // to close the mass update save error
        When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
        
        //  // Mass Update ALL
        //  When.onTheViewPage.iSelectItemCheckBox("idMPTab",0,"ALL"); 
        //  When.onTheViewPage.iShouldPressButton("OTBMUpload");
        //  When.onTheViewPage.iShouldFillDialogInput("Uph",8,"sap.m.Input");
        //  When.onTheViewPage.iShouldFillDialogInput("boH_Qty" , 'rt' ,"sap.m.Input");
        //  When.onTheViewPage.iShouldFillDialogInput("Remote_Site_Cap_Demand" , 8 ,"sap.m.Input");
        //  When.onTheViewPage.iShouldFillDialogInput("Working_Hrs" , 8 ,"sap.m.Input");
        //  When.onTheViewPage.iShouldFillDialogInput("Comment","Update","sap.m.Input");
        //  When.onTheViewPage.iShouldClickButtonInFragment("BMUSubmit","Save");
        //  When.onTheViewPage.iShouldClickButtonInFragment("__mbox-btn-1","Close");
        // When.onTheViewPage.iShouldPressButton("OTBRefresh");
        // When.onTheViewPage.iShouldPressButton("OTBSave");
        // History
        // When.onTheViewPage.iShouldPressButton("OTBHistory");
        // When.onTheViewPage.iShouldClickButtonInFragment("btndialogclose","Close");
       
        // ADD/COPY
        When.onTheViewPage.iShouldFillF4Input("container-coasublineui---SubLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input"); 
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--SubLineTab-btnEditToggle");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--OTBADD");
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--OTBCopy");
        When.onTheViewPage.iShouldPressButton("OTBSave");
        When.onTheViewPage.iSelectOKOnDialog();
        

        // When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--OTBADD");
        // When.onTheViewPage.iSelectItemCheckBox("idMPTab",6);
        // When.onTheViewPage.iShouldPressButton("OTBDelete");
        // When.onTheViewPage.iShouldClickButtonInFragment("__button0","Delete");
        // Upload
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--SubLineTab-btnEditToggle");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--fileUploader-fu_button");
		//Cleanup
        Then.iTeardownMyAppFrame();
	});
    opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
        Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true&", width:1500, height:700}).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
        // Export file
        When.onTheViewPage.iShouldFillF4Input("container-coasublineui---SubLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--smartFilterBar-btnGo");
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        // When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--OTT-overflowButton");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--SubLineTab-btnExcelExport-internalSplitBtn-textButton");
        
        // Delete

         When.onTheViewPage.iShouldFillF4Input("container-coasublineui---SubLine--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--smartFilterBar-btnGo");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--SubLineTab-btnEditToggle");
        When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--OTBADD");
        When.onTheViewPage.iShouldPressButton("OTBDelete");
        
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",6);
        When.onTheViewPage.iShouldPressButton("OTBDelete");
        When.onTheViewPage.iShouldClickButtonInFragment("__button0","Delete");
        When.onTheViewPage.iSelectOKOnDialog();
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        When.onTheViewPage.iShouldPressButton("OTBDelete");
        When.onTheViewPage.iShouldClickButtonInFragment("__button0","Delete");
        When.onTheViewPage.iSelectOKOnDialog();
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        When.onTheViewPage.iShouldPressButton("OTBDelete");
        When.onTheViewPage.iShouldClickButtonInFragment("__button1","Delete");
        When.onTheViewPage.iSelectOKOnDialog();
        When.onTheViewPage.iShouldPressButton("OTBHistory");
        Then.iTeardownMyAppFrame();
    });	    
    opaTest("Should see the No Auth page of the app", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyAppInAFrame({source: "../../index.html?responderOn=true&NoAuth=true&", width:1500, height:700}).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
        Then.onTheViewPage.iShouldSeeTheNoAuthPageView();
        Then.iTeardownMyAppFrame();
	});	

});
