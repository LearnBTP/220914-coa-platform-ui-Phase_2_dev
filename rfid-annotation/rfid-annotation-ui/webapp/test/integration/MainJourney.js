sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "./pages/App",
    "./pages/Main"
], function (opaTest, Opa5) {
    "use strict";

    QUnit.module("Annotation First Page");
    opaTest("All functionality on Selection and Annotation Page", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyAppInAFrame({ source: "../../index.html?responderOn=true", width: 1500, height: 900 }).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
        Then.onTheAppPage.iShouldSeeTheApp();
        Then.onTheMainPage.iShouldSeeThePageView();
        Then.onTheMainPage.iShouldSeeTheTable();



        When.onTheMainPage.iPressf4();
        Then.onTheMainPage.iShouldSeeTheF4Table();
        Then.onTheMainPage.iPressDialogOk();

        When.onTheMainPage.iTypeCM();


        When.onTheMainPage.iPressSearch();

        // added to cover new satuses
        When.onTheMainPage.iPressTheTableControlPlannedStatus();
        When.onTheMainPage.iShouldCloseInformationDialog();

        When.onTheMainPage.iPressTheTableControl();
        Then.onTheAnnotationPage.iShouldSeeThePageView();



        //Nav back-forth
        When.onTheAnnotationPage.iPressBackButton();
        Then.onTheMainPage.iShouldSeeTheTable();
        When.onTheMainPage.iPressTheTableControl();


        //Edit Mode
        When.onTheAnnotationPage.iPressZoomIn();
        When.onTheAnnotationPage.iPressZoomIn();
        When.onTheAnnotationPage.iPressZoomOut();
        When.onTheAnnotationPage.iPressZoomReset();


        //Full Screen
        When.onTheAnnotationPage.iPressFullScreen();
        When.onTheAnnotationPage.iPressCollapseFullScreen();

        //I scroll Table twice
        When.onTheAnnotationPage.iPressHorizontalScroll();
        When.onTheAnnotationPage.iPressHorizontalScroll();
        


        //Mass Update and export
        When.onTheAnnotationPage.iToggleSwitch();
        When.onTheAnnotationPage.iSelectItemCheckBox('tabRFID', 0);
        When.onTheAnnotationPage.iPressExport();
        When.onTheAnnotationPage.iPressMassUpdate();
        When.onTheAnnotationPage.iTypeInMassUpdate();
        When.onTheAnnotationPage.iApplyMassUpdate();
        

        When.onTheAnnotationPage.iShouldSeeErrorDialog();
        When.onTheAnnotationPage.iShouldCloseErrorDialog();

        //Copy Over
        When.onTheAnnotationPage.iPressCopyOver();
        When.onTheAnnotationPage.iPressApplyCopyOver();



        //View Mode
        When.onTheAnnotationPage.iToggleSwitch();
        When.onTheAnnotationPage.iPressZoomIn();
        When.onTheAnnotationPage.iPressZoomIn();
        When.onTheAnnotationPage.iPressZoomOut();
        When.onTheAnnotationPage.iPressZoomReset();
        When.onTheAnnotationPage.iToggleSwitch();


        When.onTheAnnotationPage.iDeleteRecordFromTable();
        When.onTheAnnotationPage.iTypeOnShapeTable();
        When.onTheAnnotationPage.iTypeOnShapeTableComments();
        When.onTheAnnotationPage.iPressShapesButtonR();
        When.onTheAnnotationPage.iPressShapesButtonL();

        When.onTheAnnotationPage.iPressRefreshButton();

        When.onTheAnnotationPage.iPressMassUpdate();



        When.onTheAnnotationPage.iRemoveAllShapes();
        When.onTheAnnotationPage.iSelectYesOnDialog();
        When.onTheAnnotationPage.iNavigateBack();



        Then.iTeardownMyAppFrame();
    });


    QUnit.module("Annotation - Save Draft");
    opaTest("Save Draft", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyAppInAFrame({ source: "../../index.html?responderOn=true", width: 1500, height: 900 }).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
        Then.onTheAppPage.iShouldSeeTheApp();
        Then.onTheMainPage.iShouldSeeThePageView();
        Then.onTheMainPage.iShouldSeeTheTable();



        When.onTheMainPage.iTypeCM();


        When.onTheMainPage.iPressSearch();

        When.onTheMainPage.iPressTheTableControl();

        Then.onTheAnnotationPage.iShouldSeeThePageView();

        //Expand click
        When.onTheAnnotationPage.iPressExpandButton("container-coa.annotation.rfidannotationui---Annotation--expandBtn");
        When.onTheAnnotationPage.iPressExpandButton("container-coa.annotation.rfidannotationui---Annotation--expandBtn");

        When.onTheAnnotationPage.iToggleSwitch();
        When.onTheAnnotationPage.iPressSaveAsDraft();
        When.onTheAnnotationPage.iPressSaveOnDialog();


        Then.iTeardownMyAppFrame();
    });


    QUnit.module("Annotation - Create and Publish");
    opaTest("Create Draft and Publish", function (Given, When, Then) {
        // Arrangements
        Given.iStartMyAppInAFrame({ source: "../../index.html?responderOn=true", width: 1500, height: 900 }).done(function () {
            Opa5.assert.ok(document.getElementById("OpaFrame"), "The frame to be loaded");
        });
        Then.onTheAppPage.iShouldSeeTheApp();
        Then.onTheMainPage.iShouldSeeThePageView();
        Then.onTheMainPage.iShouldSeeTheTable();

        When.onTheMainPage.iTypeCM();
        

        When.onTheMainPage.iPressSearch();
        When.onTheMainPage.iPressTheTableControl2();
        Then.onTheAnnotationPage.iShouldSeeThePageView();


        When.onTheAnnotationPage.iPressCreateDraft();
        // When.onTheAnnotationPage.iShouldSeeMessageToastAppearance();


        When.onTheAnnotationPage.iDeleteRecordFromTable();
        When.onTheAnnotationPage.iTypeOnShapeTable();
        When.onTheAnnotationPage.iTypeOnShapeTableComments();



        When.onTheAnnotationPage.iPressLogButton();
        When.onTheAnnotationPage.iShouldSeeLogDialog();
        When.onTheAnnotationPage.iPressCloseLogButton();


        When.onTheAnnotationPage.iPressPublish();
        When.onTheAnnotationPage.iPressSaveOnDialog();
        When.onTheAnnotationPage.iShouldSeeErrorDialog();

        Then.iTeardownMyAppFrame();

    });
});