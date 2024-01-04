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
        Given.iStartMyAppInAFrame("../../index.html?responderOn=true").done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
		//Given.iStartMyApp();

		// Assertions
	//	Then.onTheAppPage.iShouldSeeTheApp();
  
   // Then.onTheViewPage.iShouldSeeThePageView();

		//Cleanup
	//	Then.iTeardownMyApp();
	});

    // Click on Mass Update Button
   opaTest("Should search the table values",function(Given, When, Then){
    // 
    
   When.onTheViewPage.iShouldFillF4Input("container-coa.coacarryoveroutputui---Main--idCarryOverSmartFilBar-filterItemControl_BASIC-To_GHSite-inner","sap.m.Input");
  
    

// When.onTheViewPage.iShouldClickButtonInFragment("container-coa.coacarryoveroutputui---Main--idCarryOverSmartFilBar-filterItemControl_BASIC-To_Site-valueHelpDialog-ok");
  When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartFilBar-btnGo");
  // When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverTbleToolBar-overflowButton");

   // clicking on edit button , 
   When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartTble-btnEditToggle");
   When.onTheViewPage.iShouldClickonButton("OTBRefresh");
   When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartTble-btnEditToggle");
       
     //   When.onTheViewPage.iShouldClickonButton("idCOUpdate");
     
    // When.onTheViewPage.iShouldFillDatainInput("container-coa.coacarryoveroutputui---Main--idAllOutdownload");

     
        When.onTheViewPage.iShouldClickonButton("idCOUpdate");
        When.onTheViewPage.iShouldSelectRecordinTable("idCOTab");
        When.onTheViewPage.iShouldClickonButton("idCOUpdate");
        When.onTheViewPage.iShouldFillDatainInput("idInputCMBal","mock test","sap.m.Input");
        When.onTheViewPage.iShouldFillDatainInput("idInputComment","some value","sap.m.TextArea"); 
 
      When.onTheViewPage.iShouldClickButtonInFragment("Save");
      When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
      // mass update with the blank value
      When.onTheViewPage.iShouldSelectRecordinTable("idCOTab");
        When.onTheViewPage.iShouldClickonButton("idCOUpdate");
        When.onTheViewPage.iShouldClickButtonInFragment("Save");

      //
      When.onTheViewPage.iShouldSelectRecordinTable("idCOTab");
      When.onTheViewPage.iShouldClickonButton("idCOUpdate");
        When.onTheViewPage.iShouldFillDatainInput("idInputCMBal",1,"sap.m.Input");
       When.onTheViewPage.iShouldFillDatainInput("idInputComment","some value","sap.m.TextArea"); 
        When.onTheViewPage.iShouldClickButtonInFragment("Save");
       
        When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
      //  When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
        // to save
      //  When.onTheViewPage.iShouldClickonButton("idCOOSave");
          When.onTheViewPage.iShouldSelectRecordinTable("idCOTab");
          // When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverTbleToolBar-overflowButton");

          When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartTble-btnEditToggle");
      // When.onTheViewPage.iShouldClickonButton("idCOOSave");
  
     //  When.onTheViewPage.iShouldClickButtonInFragment("OK"); 
      
         // to reject 
       
        When.onTheViewPage.iShouldFillF4InputReject("container-coa.coacarryoveroutputui---Main--idCarryOverSmartFilBar-filterItemControl_BASIC-To_CM-inner","sap.m.Input");
        When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartFilBar-btnGo");
        When.onTheViewPage.iShouldRejectButton("idCOReject");
       
        // negative case of reject
        When.onTheViewPage.iShouldSelectRecordinTable("idCOTab");
        When.onTheViewPage.iShouldApproveButton("idCOReject");
        When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
        When.onTheViewPage.iShouldSelectRecordinTableReject("idCOTab");
        When.onTheViewPage.iShouldRejectButton("idCOReject");
         // to Approve
         When.onTheViewPage.iShouldFillF4InputAccept("container-coa.coacarryoveroutputui---Main--idCarryOverSmartFilBar-filterItemControl_BASIC-To_CM-inner","sap.m.Input");
         When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartFilBar-btnGo");
         When.onTheViewPage.iShouldApproveButton("idCOApprove");
  
         // approve for pending record
         When.onTheViewPage.iShouldSelectRecordinTableNew("idCOTab");
         When.onTheViewPage.iShouldApproveButton("idCOApprove");
         When.onTheViewPage.iShouldSelectRecordinTablePending("idCOTab");
         When.onTheViewPage.iShouldApproveButton("idCOApprove");
         When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");

         // negative case of approve
         When.onTheViewPage.iShouldSelectRecordinTable("idCOTab");
         When.onTheViewPage.iShouldApproveButton("idCOApprove");
         When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
         //positive case of approve
         When.onTheViewPage.iShouldSelectRecordinTableAccept("idCOTab");
    
        When.onTheViewPage.iShouldApproveButton("idCOApprove");
        When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
        // When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverTbleToolBar-overflowButton");
        When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartTble-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("idCOUpdate");
        When.onTheViewPage.iShouldSelectAllRecordinTable("idCOTab");
        When.onTheViewPage.iShouldClickonButton("idCOUpdate");
        When.onTheViewPage.iShouldFillDatainInput("idInputCMBal",1,"sap.m.Input");
        When.onTheViewPage.iShouldFillDatainInput("idInputComment","some value","sap.m.TextArea"); 
        When.onTheViewPage.iShouldClickButtonInFragment("Save");
        When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-6");

        
        // to download
        When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
        When.onTheViewPage.iShouldSelectRecordinTable("idCOTab");
         // download data test cases
         // negative download
    
       When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
       When.onTheViewPage.iShouldFillDatainInputDownload("iddownloadMenu","sap.m.Button");
       When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllCOdownload-unifiedmenu");
       When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
       When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllOutdownload-unifiedmenu");

       // negative download2, for cm balance quantity equal to zero
       When.onTheViewPage.iShouldSelectRecordinTableReject("idCOTab");
       When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
       When.onTheViewPage.iShouldFillDatainInputDownload("iddownloadMenu","sap.m.Button");
       When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllCOdownload-unifiedmenu");
       When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
       When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllOutdownload-unifiedmenu");

       // positive download
       When.onTheViewPage.iShouldSelectRecordinTabletoDownload("idCOTab");
       When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
       When.onTheViewPage.iShouldFillDatainInputDownload("iddownloadMenu","sap.m.Button");
       When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllCOdownload-unifiedmenu");
       When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
       When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllOutdownload-unifiedmenu");
       // History button
       When.onTheViewPage.iShouldClickonButton("idCOHistory");
       When.onTheViewPage.iShouldClickButtonInHistoryFragment("Close");
       // download negative case
       When.onTheViewPage.iShouldSelectRecordinTableDownQuantity("idCOTab");
       When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
       When.onTheViewPage.iShouldFillDatainInputDownload("iddownloadMenu","sap.m.Button");
       When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllCOdownload-unifiedmenu");

       // input
       
       When.onTheViewPage.iShouldFillF4InputAccept("container-coa.coacarryoveroutputui---Main--idCOTab-rows-row0-col17","sap.m.Input");
      // When.onTheViewPage.iShouldSeeTheNoAuthPageView();
        // file upload test code
    
        When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--fileUploader-fu_button");
        
       
       //iShouldSelectRecordinTableReject
       
        // download negative case
        When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartTble-btnEditToggle");
        When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
        When.onTheViewPage.iShouldFillDatainInputDownload("iddownloadMenu","sap.m.Button");
        When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllCOdownload-unifiedmenu");
         // select all table records
         When.onTheViewPage.iShouldSelectAllRecordinTable("idCOTab");
         When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
         When.onTheViewPage.iShouldFillDatainInputDownload("iddownloadMenu","sap.m.Button");
         When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllCOdownload-unifiedmenu");
         When.onTheViewPage.iShouldClickButtonIndownloadError("__mbox-btn-9");
         When.onTheViewPage.iShouldSelectAllRecordinTable("idCOTab");
         When.onTheViewPage.iShouldPressDownloadReport("idCOdownload");
         When.onTheViewPage.iShouldPressDownloadReport("container-coa.coacarryoveroutputui---Main--idAllOutdownload-unifiedmenu");
         When.onTheViewPage.iShouldClickButtonIndownloadError("__mbox-btn-9");
        //  When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverTbleToolBar-overflowButton");
        When.onTheViewPage.iShouldClickonButton("OTBRefresh");
         When.onTheViewPage.iShouldClickonButton("container-coa.coacarryoveroutputui---Main--idCarryOverSmartTble-btnEditToggle");
        When.onTheViewPage.iShouldClickonButton("idCODelete");
         When.onTheViewPage.iShouldSelectRecordinTableNew("idCOTab");
         When.onTheViewPage.iShouldClickonButton("idCODelete");
         When.onTheViewPage.iShouldClickButtonInFragmentConfirm("__mbox-btn-12","Delete");
         When.onTheViewPage.iShouldClickButtonInSaveError("__mbox-btn-0");
         //__mbox-btn-11
        //  When.onTheViewPage.iShouldClickButtonInDeleteError("__mbox-btn-11");
        
         //save negative 
         When.onTheViewPage.iShouldClickonButton("idCOOSave");
       
          When.onTheViewPage.iShouldClickonButton("fileUploader");
          // refresh button
       // When.onTheViewPage.iShouldClickonButton("OTBRefresh");
      
       

  

      Then.iTeardownMyAppFrame();

   });
   
    
});
