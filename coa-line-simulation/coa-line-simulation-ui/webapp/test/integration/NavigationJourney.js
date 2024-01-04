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

		Given.iStartMyAppInAFrame({ source: "../../index.html?responderOn=true", width: 1500, height: 900 }).done(function () {
			Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
		});
		// Arrangements
		// Given.iStartMyApp();

		// // Assertions
		// Then.onTheAppPage.iShouldSeeTheApp();
		// Then.onTheViewPage.iShouldSeeThePageView();

		// //Cleanup
		// Then.iTeardownMyApp();
	});

	opaTest("Should test line simulation app", function (Given, When, Then) {

		//Clone Simulation
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldClickonButton("btnCloneSim");


		//Get Simulation
		// When.onTheViewPage.iShouldClickonButton("btnGetSim");

		//Download
		// When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "Simulation_3");
		// When.onTheViewPage.iShouldClickonButton("btnGetSim");
		When.onTheViewPage.iShouldClickonButton("downloadimline");

		// Download with selected record Header Table
		// When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "Simulation_3");
		// When.onTheViewPage.iShouldClickonButton("btnGetSim");
		When.onTheViewPage.iShouldClickonButton("idbtnSimulate");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldSelectRecordinHeaderTabletoDownload("simulationHTable",0);
		When.onTheViewPage.iShouldClickonButton("downloadimline");

		// Download with selected record RFID Table
		When.onTheViewPage.iShouldSelectRecordinTabletoDownload("rfidequiptable",0);
		When.onTheViewPage.iShouldClickonButton("downloadimline");

		When.onTheViewPage.iShouldMakeInputEditable("inpSimName");

		// Simulation tab press
		When.onTheViewPage.iShouldClickonButton("btnRFIDEquip");
		When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "Simulation_3");
		When.onTheViewPage.iShouldClickonButton("btnGetSim");

		When.onTheViewPage.iShouldSelectRecordinTabletoDownload("rfidequiptable",0);

		//Export
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coalinesimulationui---Main--rfidEquipTable-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");


		//Clone Simulation
		When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "Simulation_3")
		When.onTheViewPage.iShouldClickonButton("btnCloneSim");
		When.onTheViewPage.iShouldClickButtonInFragment("OK");

		//Save Simulation
		When.onTheViewPage.iShouldClickonButton("btnSavSim");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "Simulation_5")
		When.onTheViewPage.iShouldClickonButton("btnSavSim");
		When.onTheViewPage.iShouldClickButtonInFragment("OK");
		


		//Add Record
		When.onTheViewPage.iShouldClickonButton("createsimline");

		//Remove Record
		When.onTheViewPage.iShouldSelectRecordinHeaderTabletoDownload("simulationHTable",1);
		When.onTheViewPage.iShouldClickonButton("removesimline");

		//Simulate
		When.onTheViewPage.iShouldClickonButton("idbtnSimulate");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		//New Simulation
		When.onTheViewPage.iShouldClickonButton("btnNewSim");
		When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "Simulation_3");

		When.onTheViewPage.iShouldClickonButton("btnRFIDEquip");




		//Non RFID Equipment Tile
		When.onTheViewPage.iShouldClickonButton("btnNonRFIDEquip");
		// When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coalinesimulationui---Main--nonrfidEquipTable-btnExcelExport-internalSplitBtn-textButton");
		// When.onTheViewPage.iShouldClickButtonInFragment("Close");


		When.onTheViewPage.iShouldSelectRecordinTabletoDownload("nonrfidequiptable",0);

		//Export
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coalinesimulationui---Main--nonrfidEquipTable-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// Carry Over Simulation Tile
		When.onTheViewPage.iShouldClickonButton("btnCarryOverSim");


		When.onTheViewPage.iShouldSelectRecordinTabletoDownload("cooutputtable",0);

		//Export
		When.onTheViewPage.iShouldClickonButton("container-com.apple.coa.coalinesimulationui---Main--carryoversimulationTable-btnExcelExport-internalSplitBtn-textButton");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		//Non RFID Equipment Tile
		When.onTheViewPage.iShouldClickonButton("btnRFIDEquip");


		//Clear
		When.onTheViewPage.iShouldClickonButton("idbtnclear");

		When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.coalinesimulationui---Main--inpSimName", "sap.m.Input");
		When.onTheViewPage.iShouldClickButtonInFragment("Cancel");

		When.onTheViewPage.iShouldFillF4Input("container-com.apple.coa.coalinesimulationui---Main--inpSimName", "sap.m.Input");
		When.onTheViewPage.iShouldClickButtonInFragment("Cancel");


		When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "Simulation_3");
		When.onTheViewPage.iShouldClickonButton("btnGetSim");
		When.onTheViewPage.iShouldClickonButton("btnRFIDEquip");
		When.onTheViewPage.iShouldClickonButton("btnNonRFIDEquip");
		When.onTheViewPage.iShouldClickonButton("btnCarryOverSim");
		// When.onTheViewPage.iShouldClickonButton("btnSavSim");
		// When.onTheViewPage.iShouldClickButtonInFragment("Close");

		When.onTheViewPage.iShouldClickonButton("idbtnclear");
		When.onTheViewPage.iShouldClickonButton("idbtnSimulate");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		//Delete simulation
		When.onTheViewPage.iShouldClickonButton("btnDeleteSim");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");
		When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "Simulation_3");
		When.onTheViewPage.iShouldClickonButton("btnDeleteSim");
		When.onTheViewPage.iShouldClickButtonInFragment("OK");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");

		// empty record validation error
		When.onTheViewPage.iShouldClickonButton("btnGetSim");
		When.onTheViewPage.iShouldClickonButton("createsimline");
		When.onTheViewPage.iShouldClickonButton("btnSavSim");
		When.onTheViewPage.iShouldClickButtonInFragment("OK");

		// empty sim name validation error
		When.onTheViewPage.iShouldEnterDatainInput("inpSimName", "");
		When.onTheViewPage.iShouldClickonButton("btnSavSim");
		When.onTheViewPage.iShouldClickButtonInFragment("Close");








		//  Then.iTeardownMyAppFrame();
	})
});