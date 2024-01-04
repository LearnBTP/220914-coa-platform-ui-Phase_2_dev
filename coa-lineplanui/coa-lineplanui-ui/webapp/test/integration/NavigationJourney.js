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
        Then.onTheAppPage.iShouldSeeTheApp();
        Then.onTheViewPage.iShouldSeeThePageView();
        When.onTheViewPage.iShouldPressGo("container-coa.coalineplanui---Main--smartFilterBar-btnGo");
        // Export file
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0,'ALL');
        //When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--OTT-overflowButton");
        When.onTheViewPage.iShouldPressButton("container-coa.coalineplanui---Main--LinePlanTab-btnExcelExport-internalSplitBtn-textButton");
        Then.iTeardownMyApp();
    });
    opaTest("Should see the initial page of the app", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyAppInAFrame("../../index.html?responderOn=true").done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
        //Given.iStartMyApp();
        // Assertions
        Then.onTheAppPage.iShouldSeeTheApp();
        Then.onTheViewPage.iShouldSeeThePageView();
        When.onTheViewPage.iShouldPressGo("container-coa.coalineplanui---Main--smartFilterBar-btnGo");
        // Upload ALl
        When.onTheViewPage.iSelectItemCheckBox("idMPTab",0);
        //When.onTheViewPage.iShouldPressButton("container-coasublineui---SubLine--OTT-overflowButton");
        When.onTheViewPage.iShouldPressButton("container-coa.coalineplanui---Main--LinePlanTab-btnExcelExport-internalSplitBtn-textButton");
        When.onTheViewPage.iShouldClickButtonInFragment("Close"); 
        
        //Cleanup
         Then.iTeardownMyApp();
    });
});
