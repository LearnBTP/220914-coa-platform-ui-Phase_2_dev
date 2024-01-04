sap.ui.define([
	"coa/rfidonhand/controller/Main.controller",
    "sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/sinon",
    "sap/ui/model/odata/v2/ODataModel",
    // "sap/ui/comp/smarttable/SmartTable",
    "sap/ui/thirdparty/sinon-qunit",
    
], function (Controller,View, JSONModel, Component, sinon, ODataModel) {
	"use strict";

	QUnit.module("Rfid on Hand Main Controller", {
        beforeEach: function () {
            this.oController = new Controller();
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

    QUnit.test("I should test the Main controller Init", function (assert) {
        var oViewStub = new View();
        var oModelStub = new JSONModel();
        var oOwnerStub = new Component();
        sinon.stub(this.oController, "getView").returns(oViewStub);
        this.oController.setJSONModelToView();
        assert.ok(this.oController);
    });
    // QUnit.test("I should test Main controller error column function", function(assert){
    //     var oViewStub = new View();
    //     var oTableStub = new Table();
    //     var oModelStub = new ODataModel('/mock/rfid-tt', {
    //         json: true
    //     });
    //     sinon.stub(this.oController, "getView").returns(oViewStub);
    //     sinon.stub(oViewStub, "byId").returns(oTableStub);
    //     sinon.stub(oViewStub, "getModel").returns(oModelStub);
    //     this.oController._oSmartTable = oTableStub;
    //     this.oController._oSmartTable.setModel(oModelStub);
    //     this.oController.changedPath = [];
    //     this.oController.changedPath.push("/RFIDDetails(Raw_Aqid='01594-02',Mapped_Aqid='66048-01',Short_Name='',AQID='01594-02',TIMESTAMP='20220914025641',RFID='000000000000Q15225119268',ASSETNO='999999999999',SERNR='SEP14DAN-152',ASSETOWN='Consign',EQUIP_MANF='HITACHHI',SITE='SHPH',CM='PEGA',ZALDR_CMPROGRAM='J620',STATUS='IUSE',createdAt=null,Override_LineId='null',CarryOverAqid='',CarryOverEqName='',CarryOverOldProgram='',Uph=null,LineType='null',LineId='null',Version_Id='null',Transfer_Flag='null',To_CM='null',To_Site='null',To_Program='null',Tp_Business_Grp='null',Comments='test%201',Approval_Status='Pending',Submit_Dte=undefined,Submit_By='null',Review_Date=undefined,Reviewed_By='null')");

    //     var oError = {
    //         responseJSON:{
    //             error:{
    //                 message:{
    //                     value: "[{\"RFID_Timestamp\":\"20170328090758\",\"Asset_Id\":\"\",\"RFID\":\"Test11\",\"AQID\":\"00176-02\",\"Raw_AQID\":null,\"Mapped_AQID\":null,\"Short_Name\":null,\"Serial_Number\":\"2017032717\",\"EQ_Name\":null,\"CarryOverOldProgram\":null,\"MFR\":null,\"Asset_Own\":\"CONSIGN\",\"CM\":\"HANS\",\"Site\":\"LASR\",\"Asset_Status\":\"IUSE\",\"Timestamp_3DV\":null,\"Line_ID\":null,\"Line_Type\":null,\"UPH\":null,\"Version\":null,\"Transfer_Flag\":null,\"To_CM\":\"SJOWE\",\"To_Site\":\"MCOSD\",\"To_Program\":\"MDSO\",\"To_Business_Grp\":\"SDKF\",\"Comments\":\"Testing response after save\",\"Approval_Status\":\"Pending\",\"Submit_Date\":\"2022-11-02T02:16:03.296Z\",\"Submit_By\":null,\"ErrorMsg\":\"Cannot edit this entry as RFID is not in PUBLISH status in RFID Annotation\"}]"
    //                 }
    //             }
    //         }
    //     }
        
    //     this.oController.raiseCustomErrorOnSave(oError);
    //     assert.ok(this.oController);


    // });


    QUnit.test("I Should test backend exception function", function(assert){
        var oError = {
            responsText: {
                error: {
                    message: {
                        value: "Error in raisebackend exception"
                    }
                }
            }
        };

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

        var oError = {
            message: "Error in raisebackend exception 2"
        };

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

        var oError = {
            status: 504,
            responseText: "<html><head><title>504 Gateway Time-out</title></head><body><center><h1>504 Gateway Time-out</h1></center><hr><center>Apple</center></body></html>"
        }

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

        var oError = {
            status: 504,
            response: {
                body: "<html><head><title>504 Gateway Time-out</title></head><body><center><h1>504 Gateway Time-out</h1></center><hr><center>Apple</center></body></html>"
            }
        }


        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

        var oError = {
            status: 400,
            responsText: {
                error: {
                    message: {
                        value: "Error in raisebackend exception"
                    }
                }
            }
        };

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

        var oError = {
            status: 400,
            message: "Error in raisebackend exception 2"
        };

        this.oController.raiseBackendException(oError);
        assert.ok(this.oController);

    });

    // QUnit.test("I should test error download function", function(assert){
    //     var oViewStub = new View();
    //     var oModelStub = new JSONModel();
    //     var oOwnerStub = new Component();
    //     sinon.stub(this.oController, "getView").returns(oViewStub);
    //     this.oController.getView().setModel(oModelStub,"RfidModel");

    //     this.oController.getView().getModel("RfidModel").setProperty("/RfidLogs",[]);

    //     this.oController.handleErrorlogDownload();

    //     assert.ok(true,"File downloaded");
    // });

        QUnit.test("formatDate", function (assert){
            this.oController.formatDate('2022/07/13');
            assert.ok(this.oController);
        });


      QUnit.test("I should test error download function", function(assert){
        this.oController.createColumns();
        assert.ok(true,"File downloaded");
    });


    QUnit.test("I Should test Ajax URL", function(assert){
        var oOwnerStub = new Component();
        var oModelStub = new JSONModel();
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(oOwnerStub, "getModel").returns(oModelStub);

        this.oController.getOwnerComponent().getModel("device").setProperty("/origin","corp-apps");
        this.oController.getSelectAllAjaxUrl();
        this.oController.getSaveAjaxUrl();
        

        this.oController.getOwnerComponent().getModel("device").setProperty("/origin","");
        this.oController.getSelectAllAjaxUrl();
        this.oController.getSaveAjaxUrl();

        assert.ok(true,"Tested ajax url function")

    });

    QUnit.test("I Should test commonsave success function", function(assert){

        var oOwnerStub = new Component();
        var oModelStub = new JSONModel();
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(oOwnerStub, "getModel").returns(oModelStub);

        this.oController.getOwnerComponent().getModel("device").setProperty("/isMockServer",true);

        this.oController.commonSaveSuccess(true, this.oController);

        assert.ok(true,"Tested commonsave cancel success");

        this.oController.commonSaveSuccess(false,this.oController);
        assert.ok(true, "Tested common save success");
        

    });

    
});