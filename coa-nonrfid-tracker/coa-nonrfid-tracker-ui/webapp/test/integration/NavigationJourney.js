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
		// 
		When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.coanonrfidtrackerui---Main--smartFilterBar-filterItemControl_BASIC-GH_Site-inner", "sap.m.Input");
		//
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--smartFilterBar-btnGo");
		//When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("OTBMUpload");
		// mass update positive case
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMUpload");

		When.onTheViewPage.iShouldFillDatainInput("idghsite", "test", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtoprogram", "test2", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtobusinessgroup", "test3", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idInputTranQty", 1, "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtransferflag", "Y", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idcomments", "some value", "sap.m.TextArea");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// mass update positive case with Transfer Flag as blank
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMUpload");

		When.onTheViewPage.iShouldFillDatainInput("idghsite", "test", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtoprogram", "test2", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtobusinessgroup", "test3", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idInputTranQty", 1, "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtransferflag", "", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idcomments", "some value", "sap.m.TextArea");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		
		// mass update negative case
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMUpload");
		When.onTheViewPage.iShouldFillDatainInput("idghsite", "test", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtoprogram", "test2", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtobusinessgroup", "test3", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idInputTranQty", "test", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtransferflag", "L", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idcomments", "some value", "sap.m.TextArea");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// Approve test case positive
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBApprove");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// Approve test case negative
		When.onTheViewPage.iShouldSelectRecordinTableReset("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBApprove");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		// When.onTheViewPage.iShouldSelectRecordinTableRejected("idMPTab");
		// When.onTheViewPage.iShouldClickonButton("OTBApprove");
		
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");



		// Reject test case positive
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// Reject test case negative
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldSelectRecordinTableReset("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		//When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		



		// delete test case positive
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBDelete");
		When.onTheViewPage.iShouldClickButtonInFragmentConfirm("__mbox-btn-12", "Delete");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// delete test case negative
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectRecordinTableReset("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBDelete");
		When.onTheViewPage.iShouldClickButtonInFragmentConfirm("__mbox-btn-12", "Delete");
	    When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// cancel test case positive
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");

		When.onTheViewPage.iShouldPressCancelResetBtn("container-com.apple.coa.coanonrfidtrackerui---Main--OTBCancelRequest-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInFragmentConfirm("__mbox-btn-12", "OK");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");


		// reset test case positive
		When.onTheViewPage.iShouldSelectRecordinTableReset("idMPTab");
		When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");

		When.onTheViewPage.iShouldPressCancelResetBtn("container-com.apple.coa.coanonrfidtrackerui---Main--OTBReset-unifiedmenu");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		//When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// reset test case negative
		When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");
		When.onTheViewPage.iShouldPressCancelResetBtn("container-com.apple.coa.coanonrfidtrackerui---Main--OTBReset-unifiedmenu");
		//When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		//When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
	//	When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
	When.onTheViewPage.iShouldClickonButton("OTBRefresh");
	When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectRecordinTableRejected("idMPTab");
		When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");
		When.onTheViewPage.iShouldPressCancelResetBtn("container-com.apple.coa.coanonrfidtrackerui---Main--OTBReset-unifiedmenu");
		
	//	When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");




		// select all mass update
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
	When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectAllRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMUpload");
		When.onTheViewPage.iShouldFillDatainInput("idghsite", "test", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtoprogram", "test2", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtobusinessgroup", "test3", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idInputTranQty", 1, "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idtransferflag", "Y", "sap.m.Input");
		When.onTheViewPage.iShouldFillDatainInput("idcomments", "some value", "sap.m.TextArea");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-16");
				// select all mass update without change
		When.onTheViewPage.iShouldSelectAllRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBMUpload");
		When.onTheViewPage.iShouldClickButtonInFragment("Save");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-16");

		// select all delete records
		When.onTheViewPage.iShouldSelectAllRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBDelete");
		When.onTheViewPage.iShouldClickButtonInFragmentConfirm("__mbox-btn-12", "Delete");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");


		 // Synch button click
		 When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		 When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		 When.onTheViewPage.iShouldClickonButton("OTBSynBtn");
		 When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		 When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		 When.onTheViewPage.iShouldClickButtonInFragment("Start Sync");
		
		 When.onTheViewPage.iShouldClickButtonInFragment("Cancel");
		 When.onTheViewPage.iShouldClickonButton("OTBSynBtn");
		// When.onTheViewPage.iShouldSelectDatainMultComboBox("ghSiteInput");
		 When.onTheViewPage.iShouldSelectDatainMultComboBox("programInput");
		// When.onTheViewPage.iShouldSelectDatainChckbox("idSyncall");
		
		 When.onTheViewPage.iShouldClickButtonInFragment("Start Sync");
		// When.onTheViewPage.iShouldClickButtonInFragment("Cancel");
	//	 When.onTheViewPage.iShouldClickButtonInFragment("Start Sync");
		 When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		
		 // chckbox selected
		// When.onTheViewPage.iShouldClickonButton("OTBSynBtn");
		// When.onTheViewPage.iShouldSelectDatainChckbox("idSyncall");
		// When.onTheViewPage.iShouldClickButtonInFragment("Start Sync");
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		//When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		//When.onTheViewPage.iShouldClickButtonInFragment("Cancel");
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");


		 // changelog  History button
		 When.onTheViewPage.iShouldClickonButton("OTBHistory");
		 When.onTheViewPage.iShouldClickButtonInHistoryFragment("Close");

		 // split button
	
		 When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--idSplitIcon-__clone22");
		 When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// reset without selecting row
		When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");
		When.onTheViewPage.iShouldPressCancelResetBtn("container-com.apple.coa.coanonrfidtrackerui---Main--OTBReset-unifiedmenu");
		// delete without selecting row
		When.onTheViewPage.iShouldClickonButton("OTBDelete");

		// cancel without selecting row

		When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");

		When.onTheViewPage.iShouldPressCancelResetBtn("container-com.apple.coa.coanonrfidtrackerui---Main--OTBCancelRequest-unifiedmenu");
        	// approve without selecting row
		When.onTheViewPage.iShouldClickonButton("OTBApprove");

		// select all mass approve
		When.onTheViewPage.iShouldSelectAllRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBApprove");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// select all mass reject
		When.onTheViewPage.iShouldSelectAllRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		
	

		// select all cancel request
		// When.onTheViewPage.iShouldSelectAllRecordinTable("idMPTab");
		// When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");

		// When.onTheViewPage.iShouldPressCancelResetBtn("container-com.apple.coa.coanonrfidtrackerui---Main--OTBCancelRequest-unifiedmenu");
		// When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
	

		// select all reset request
		When.onTheViewPage.iShouldSelectAllRecordinTable("idMPTab");
		When.onTheViewPage.iShouldPressCancelResetBtn("idCancelMenuBtn");

		When.onTheViewPage.iShouldPressCancelResetBtn("container-com.apple.coa.coanonrfidtrackerui---Main--OTBReset-unifiedmenu");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		
		//When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-35");
		//When.onTheViewPage.iShouldClickButtonInUIError("__mbox-btn-34");

		// reject negative case for rejected status

        When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectRecordinTableRejected("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldSelectRecordinTableBlankStatus("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		When.onTheViewPage.iShouldSelectRecordinTableBlankStatus("idMPTab");
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldSelectRecordinTableBlankStatus("idMPTab");
	   When.onTheViewPage.iShouldClickonButton("OTBReject");
	   When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

		// Export excel 
		When.onTheViewPage.iShouldSelectRecordinTable("idMPTab");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--OTT-overflowButton");
	
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnExcelExport-internalSplitBtn-textButton");
	//	When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonInUIError("__mbox-btn-9");


		// table data change , check

		When.onTheViewPage.iShouldSelectAndSetDatainTable("idMPTab", true, "BG");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectAndSetDatainTable("idMPTab", true, "BG");
		When.onTheViewPage.iShouldClickonButton("OTBApprove");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectAndSetDatainTable("idMPTab", true, "BG");
		When.onTheViewPage.iShouldClickonButton("OTBReject");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectAndSetDatainTable("idMPTab", true, "BG");
		When.onTheViewPage.iShouldClickonButton("OTBSynBtn");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldSelectAndSetDatainTable("idMPTab", true, "BG");
		When.onTheViewPage.iShouldClickonButton("OTBDelete");
		When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
		When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		When.onTheViewPage.iShouldClickonButton("fileUploader");
		//When.onTheViewPage.iShouldClickonButton("OTBRefresh");
		//When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--MainTab-btnEditToggle");
		//When.onTheViewPage.iShouldSelectAndSetDatainTable("idMPTab", true, "BG");





		// Split functioanlity 
		//When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coanonrfidtrackerui---Main--idMPTab-rows-row0-col24");




		


		Then.iTeardownMyAppFrame();

	});
});