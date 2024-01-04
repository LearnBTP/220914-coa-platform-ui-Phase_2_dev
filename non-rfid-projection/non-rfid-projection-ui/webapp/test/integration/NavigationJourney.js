/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"./pages/App",
	"./pages/main"
], function (opaTest, Opa5) {
	"use strict";

	QUnit.module("Navigation Journey");

	opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyAppInAFrame("../../index.html?responderOn=true").done(function () {
			Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
		});
		//Given.iStartMyApp();

		// Assertions
		//Then.onTheAppPage.iShouldSeeTheApp();
		//Then.onTheViewPage.iShouldSeeThePageView();


		//Cleanup
		//Then.iTeardownMyApp();
	});

	opaTest("Should search the table values", function (Given, When, Then) {
		//24 may // 
		When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.nonrfidprojectionui---main--idNonRfidFilBar-filterItemControl_BASIC-GH_SITE", "sap.m.Input");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idNonRfidFilBar-btnGo");
		// clicking on edit button , 
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnEditToggle");

		When.onTheViewPage.iShouldClickonButton("idCOOSave");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		 When.onTheViewPage.iShouldClickonButton("idCOUpdate");
		When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("idCOUpdate");
		When.onTheViewPage.iShouldFillDatainInput("idrfidscope", "Y", "sap.m.TextArea");
		When.onTheViewPage.iShouldFillDatainInput("idInputcarrypver", 2, "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idInputQPL", 55, "sap.m.Input");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		// When.onTheViewPage.iShouldClickonButton("btnOK");
		// When.onTheViewPage.iShouldClickonButton("btnCancel");

		// fill the data in the smart table negative 
	When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble", true, "K", "P","U");
	// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnEditToggle");
	When.onTheViewPage.iShouldClickonButton("idCOOSave");
	When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

	// no changes mass update single record

	When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
	When.onTheViewPage.iShouldClickonButton("idCOUpdate");
	When.onTheViewPage.iShouldClickButtonInFragment("Save");

	// no changes mass update all  record

	When.onTheViewPage.iShouldSelectAllRecordinTable("idNonRfidtble");
	When.onTheViewPage.iShouldClickonButton("idCOUpdate");
	When.onTheViewPage.iShouldClickButtonInFragment("Save");




	// fill the data in the smart table negative 
	When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble", true, "Y", 5,4);
	When.onTheViewPage.iShouldClickonButton("idCOOSave");
	When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0")


	
		// mass update with the blank value
		When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("idCOUpdate");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");

		// file upload test code
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--fileUploader-fu_button");
		// When.onTheViewPage.iShouldClickonButton("fileUploader");

		// select table records and download
		When.onTheViewPage.iShouldSelectAllRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldSelectRecordinTabletoDownload("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonIndownloadError("__mbox-btn-9");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");


		// When.onTheViewPage.iShouldClickButtonInFragment("OK");

		// Personalization button (Change Log)
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnPersonalisation");

		//Update single record with Negative Case
		When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("idCOUpdate");

		When.onTheViewPage.iShouldFillDatainInput("idrfidscope", "J", "sap.m.TextArea");
		When.onTheViewPage.iShouldFillDatainInput("idInputcarrypver", "K", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idInputQPL", "O", "sap.m.Input");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
	

		//Mass update all with the positive value
	
		When.onTheViewPage.iShouldSelectAllRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("idCOUpdate");
	
		When.onTheViewPage.iShouldFillDatainInput("idrfidscope", "Y", "sap.m.TextArea");
		When.onTheViewPage.iShouldFillDatainInput("idInputcarrypver", 2, "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idInputQPL", 55, "sap.m.Input");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		//Single Record Update
		
		When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("idCOUpdate");
		When.onTheViewPage.iShouldFillDatainInput("idrfidscope", "N", "sap.m.TextArea");
		When.onTheViewPage.iShouldFillDatainInput("idInputcarrypver", "K", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idInputQPL", "O", "sap.m.Input");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// reset QPL
		// single record
		When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnEditToggle");
	    When.onTheViewPage.iShouldClickonButton("idCOOQplReset");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		// select all
		When.onTheViewPage.iShouldSelectAllRecordinTable("idNonRfidtble");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnEditToggle");
	    When.onTheViewPage.iShouldClickonButton("idCOOQplReset");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		
		// Download Empty Template button - NOQPL
		When.onTheViewPage.iShouldClickonButton("idDownloadTemplate");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBNOQPL-unifiedmenu");

		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBDownloadTemplate");
		When.onTheViewPage.iShouldClickButtonInHistoryFragment("Close");
		// Download Template block records
		When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("idDownloadTemplate");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBNOQPL-unifiedmenu");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBDownloadTemplate");

		// Download Template Select All
		When.onTheViewPage.iShouldSelectAllRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("idDownloadTemplate");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBNOQPL-unifiedmenu");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBDownloadTemplate");
		When.onTheViewPage.iShouldClickButtonInHistoryFragment("Close");


		// Download Empty Template button - QPL
		When.onTheViewPage.iShouldClickonButton("idDownloadTemplate");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBQPL-unifiedmenu");

		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBDownloadTemplate");
		When.onTheViewPage.iShouldClickButtonInHistoryFragment("Close");
		// Download Template block records
		When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("idDownloadTemplate");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBQPL-unifiedmenu");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBDownloadTemplate");

		// Download Template Select All
		When.onTheViewPage.iShouldSelectAllRecordinTable("idNonRfidtble");
		When.onTheViewPage.iShouldClickonButton("idDownloadTemplate");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBQPL-unifiedmenu");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--OTBDownloadTemplate");
		When.onTheViewPage.iShouldClickButtonInHistoryFragment("Close");

		// History button (Change Log)
		When.onTheViewPage.iShouldClickonButton("idCOHistory");
		When.onTheViewPage.iShouldClickButtonInHistoryFragment("Close");
	
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.nonrfidprojectionui---main--idnonrfidSmartTble-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("fileUploader");
		// input
		//When.onTheViewPage.iShouldFillF4InputAccept("container-com.apple.coa.nonrfidprojectionui---main--idNonRfidtble-rows-row0-col17", "sap.m.Input");

		// End Changes

		// When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble"); 
		// When.onTheViewPage.iShouldClickonButton("idCOUpdate");
		// When.onTheViewPage.iShouldFillDatainInput("idrfidscope", "Y", "sap.m.TextArea");
		// When.onTheViewPage.iShouldFillDatainInput("idInputcarrypver", 2, "sap.m.Input");
		// When.onTheViewPage.iShouldClickButtonInFragment("Save");
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		// When.onTheViewPage.iShouldSelectRecordinTable("idNonRfidtble");
		// When.onTheViewPage.iShouldClickonButton("idCOUpdate");
		// When.onTheViewPage.iShouldFillDatainInput("idrfidscope", "K", "sap.m.TextArea");
		// When.onTheViewPage.iShouldFillDatainInput("idInputcarrypver", "J", "sap.m.Input");
		// When.onTheViewPage.iShouldClickButtonInFragment("Save");



		Then.iTeardownMyAppFrame();

	});
});
