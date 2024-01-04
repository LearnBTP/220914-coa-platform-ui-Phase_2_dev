/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"./pages/App",
	"./pages/Main"
], function (opaTest, Opa5) {
	"use strict";

	QUnit.module("Navigation Journey");

	opaTest("Should see the initial page of the app", function (Given, When, Then) {
		// Arrangements
		// Given.iStartMyApp();

		Given.iStartMyAppInAFrame({ source: "../../index.html?responderOn=true", width: 2000, height: 1200 }).done(function () {
			Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
		});


		// Assertions
		// Then.onTheAppPage.iShouldSeeTheApp();
		// Then.onTheViewPage.iShouldSeeThePageView();

		//Cleanup
		// Then.iTeardownMyApp();
	});


	opaTest("I Should test all Functionalites of UnScannable Application", function (Given, When, Then) {

		// Not all records are loaded message
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");


		// MassUpdate
		When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");

		// Approve
		When.onTheViewPage.iShouldApproveButton("OTBApprove");
		// When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// Reject
		When.onTheViewPage.iShouldRejectButton("OTBReject");
		// When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// Cancel
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBCancelRequest-unifiedmenu");
		// When.onTheViewPage.iShouldClickButtonInFragment("Close");




		//Smart Filter Bar
		// When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-filterItemControl_BASIC-GH_SITE", "sap.m.Input");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-btnGo");

		//Clicking on Edit Button
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");



		// Reset Status Record - Cancel
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",12);
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldApproveButton("container-com.apple.coa.rfidunscannableui---Main--OTBCancelRequest-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// Reset Status Record - Reset
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",12);
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBReset-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// No Status Record - Cancel
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",7);
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldApproveButton("container-com.apple.coa.rfidunscannableui---Main--OTBCancelRequest-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// No Status Record - Reset
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",7);
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBReset-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");


		// Rejected Record - Reset
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",9);
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBReset-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		
		// Select All Approve
		When.onTheViewPage.iShouldSelectAllCheckboxes("idMPTab");
		When.onTheViewPage.iShouldApproveButton("OTBApprove");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");


		// Select All Reject
		When.onTheViewPage.iShouldSelectAllCheckboxes("idMPTab");
		When.onTheViewPage.iShouldApproveButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// Select All Cancel
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldSelectAllCheckboxes("idMPTab");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBCancelRequest-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");


		// Select All Reset
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldSelectAllCheckboxes("idMPTab");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBReset-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");


		// save
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab", true, "Test");
		When.onTheViewPage.iShouldClickonButton("OTBSave");
		// When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// Select All mass update
		When.onTheViewPage.iShouldSelectAllCheckboxes("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inptosite", "iPhone_LXKS", );
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inptoprogram", "D20");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inptobusiness", "IMAC");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inpflexkits", "Y");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inpqty", 1);
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inptransferflg", "Y");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.TextArea","inpComments", "Test Comment");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		// When.onTheViewPage.iShouldClickonButton("OTBRefresh");


		// Mass Update with unsaved changes in table
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab",true, "Test");
		When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
		When.onTheViewPage.iShouldClickButtonInFragment("Cancel");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// Massupdate with entering all values
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
		When.onTheViewPage.iShouldClickButtonInFragment("OK");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inptosite", "iPhone_LXKS", );
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inptoprogram", "D20");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inptobusiness", "IMAC");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inpflexkits", "Y");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inpqty", 1);
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.Input","inptransferflg", "Y");
		When.onTheViewPage.iShouldEnterDatainFragmentInput("sap.m.TextArea","inpComments", "Test Comment");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		// //Mass Update
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
		When.onTheViewPage.iShouldFillDatainInput("inptosite", "iPhone_LXKS", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("inptoprogram", "D20", "sap.m.Input");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// mass update with the blank value
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// select all table records and download
		When.onTheViewPage.iShouldSelectAllRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		// select any table record and download
		When.onTheViewPage.iShouldSelectRecordinTabletoDownload("idMPTab");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		// When.onTheViewPage.iShouldClickonButton("OTBMassUpdate");
		//Export
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		//Approve
		// When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-filterItemControl_BASIC-GH_SITE", "sap.m.Input");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-btnGo");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// When.onTheViewPage.iShouldApproveButton("OTBApprove");

		//Approve for pending record
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",0);
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldApproveButton("OTBApprove");
		// When.onTheViewPage.iShouldClickButtonInFragment("OK");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		// Approve reset status records
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",12);
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldApproveButton("OTBApprove");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		//Negative case of approve
		When.onTheViewPage.iShouldSelectRecordinTablePending("idMPTab");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldApproveButton("OTBApprove");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");


		//Reject
		// When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-filterItemControl_BASIC-GH_SITE", "sap.m.Input");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-btnGo");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");

		//Reject for pending record
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",0);
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldRejectButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		// reject reset status records
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",12);
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldApproveButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");


		//Negative case of reject
		When.onTheViewPage.iShouldSelectRecordinTablePending("idMPTab");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldRejectButton("OTBReject");
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");


		//Delete
		// When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-filterItemControl_BASIC-GH_SITE", "sap.m.Input");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-btnGo");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// Delete no select
		When.onTheViewPage.iShouldApproveButton("OTBDelete");
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",0);
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldApproveButton("OTBDelete");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		//Change Log
		When.onTheViewPage.iShouldClickonButton("OTBHistory");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		//Single Record Update
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",0);
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// When.onTheViewPage.iShouldFillDatainInput("inptosite", "iPhone_LXKS", "sap.m.Input");
		// When.onTheViewPage.iShouldFillDatainInput("inpTO_PROGRAM", "D20", "sap.m.Input");
		// When.onTheViewPage.iShouldClickButtonInFragment("Save");
		// When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBSave");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		//Cancel Request
		// When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-filterItemControl_BASIC-GH_SITE", "sap.m.Input");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-btnGo");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",10);
		// When.onTheViewPage.iShouldFillDatainInput("idCancelMenu", "sap.m.Button");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBCancelRequest-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		//Reset Approval
		// When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-filterItemControl_BASIC-GH_SITE", "sap.m.Input");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-btnGo");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// When.onTheViewPage.iShouldSelectRecordinTablePending("idMPTab");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",10);
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBReset-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");

		// split button
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--_IDGenIcon3-__clone17");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		//sync button
		When.onTheViewPage.iShouldClickonButton("OTBSyncRFIDProj");
		When.onTheViewPage.iShouldClickButtonInFragment("OK");
		When.onTheViewPage.iShouldClickButtonInFragment("Start Sync");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldSelectDatainMultComboBox("ghSiteInput");
		When.onTheViewPage.iShouldClickButtonInFragment("Start Sync");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickButtonInFragment("Cancel");


		// validations coverage

		// Approved Record - Approve
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",10);
		When.onTheViewPage.iShouldApproveButton("OTBApprove");

		// Rejected Record - Approve
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",9);
		When.onTheViewPage.iShouldApproveButton("OTBApprove");

		// No Status Record - Approve
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",7);
		When.onTheViewPage.iShouldApproveButton("OTBApprove");


		// Approved Record - Reject
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",10);
		When.onTheViewPage.iShouldApproveButton("OTBReject");

		// Rejected Record - Reject
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",9);
		When.onTheViewPage.iShouldApproveButton("OTBReject");

		// No Status Record - Reject
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",7);
		When.onTheViewPage.iShouldApproveButton("OTBReject");


		// Rejected Record - Cancel
		When.onTheViewPage.iShouldSelectRecordinTableNew("idMPTab",9);
		When.onTheViewPage.iShouldClickonButton("idCancelMenuBtn");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--OTBCancelRequest-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");


		// Refresh F4 select
		When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.rfidunscannableui---Main--smartFilterBar-filterItemControl_BASIC-GH_SITE", "sap.m.Input");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		// file upload test code
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--rfidunscannabletable-btnEditToggle");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.rfidunscannableui---Main--fileUploader-fu_button");

		Then.iTeardownMyAppFrame();
	});
});
