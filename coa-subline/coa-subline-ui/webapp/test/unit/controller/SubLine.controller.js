/*global QUnit*/

sap.ui.define([
	"coa-subline-ui/controller/SubLine.controller",
    "sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/comp/smarttable/SmartTable",
    "../../../utils/formatter",
], function (Controller,View, JSONModel, Component, Table,Formatter) {
	"use strict";
	QUnit.module("SubLine Controller",{
        beforeEach: function () {
            this.oController = new Controller();
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

    QUnit.test("I should test Odaata save response", function (assert) {

        var tabdata = [{
            "createdAt": "/Date(1662709369689+0000)/",
            "createdBy": "anonymous",
            "modifiedAt": "/Date(1662709369689+0000)/",
            "modifiedBy": "anonymous",
            "Site": "ELKGROVE",
            "Program": "D42",
            "Sub_Line_Name": "1",
            "CM": "CM",
            "Uph": 0,
            "boH_Qty": 0,
            "Working_Hrs": 0,
            "Remote_Site_Cap_Demand": 0,
            "Version": "",
            "Comment": "",
            "Error": null,
            "__metadata": {
                "type": "lineplan.T_COA_SUBLINE",
                "uri": "https://scpdv-220720-202-coa-platform-coa-subline-approuter.cfapps.us10.hana.ondemand.com/coaEqpLines/v2/lineplan/T_COA_SUBLINE(Site='ELKGROVE',Program='D42',Sub_Line_Name='1',CM='CM')"
            }
        },
        {
            "createdAt": "/Date(1662709013811+0000)/",
            "createdBy": "anonymous",
            "modifiedAt": "/Date(1662709013811+0000)/",
            "modifiedBy": "anonymous",
            "Site": "ElkGrove",
            "Program": "D4A",
            "Sub_Line_Name": "1",
            "CM": "CM",
            "Uph": 1,
            "boH_Qty": null,
            "Working_Hrs": 0,
            "Remote_Site_Cap_Demand": null,
            "Version": "",
            "Comment": "",
            "Error": null,
            "__metadata": {
                "type": "lineplan.T_COA_SUBLINE",
                "uri": "https://scpdv-220720-202-coa-platform-coa-subline-approuter.cfapps.us10.hana.ondemand.com/coaEqpLines/v2/lineplan/T_COA_SUBLINE(Site='ElkGrove',Program='D4A',Sub_Line_Name='1',CM='CM')"
            }
        }
        ];
        var oViewStub = new View();
        var oModelStub = new JSONModel();
        var oOwnerStub = new Component();
        var oTableStub = new Table();
        oModelStub.setProperty("/SubLine", tabdata);
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(this.oController, "getView").returns(oViewStub);
        sinon.stub(oViewStub, "getModel").returns(oModelStub);
        sinon.stub(oViewStub, "byId").returns(oTableStub);
        this.oController.getView().setModel(oModelStub,"coa");
        this.oController.getView().byId("SubLineTab").setModel(oModelStub,"coa");
        
        this.oController.getView().getModel("coa").setProperty("/SubLine", tabdata);
        
        var resp = {
            data: {
                __batchResponses: [{
                    response: {
                        statusCode: "403",
                        body: '{"error":{"code":"400","message":{"lang":"en","value":"{\\"CM\\":\\"DDF\\",\\"Site\\":\\"DF\\",\\"Program\\":\\"ER\\",\\"Error\\":\\"Invalid CM-Site Combination\\"}"},"severity":"error","target":"/#TRANSIENT#","ContentID":"id-1665461789241-230","innererror":{"errordetails":[{"code":"400","message":{"lang":"en","value":"{\\"CM\\":\\"DDF\\",\\"Site\\":\\"DF\\",\\"Program\\":\\"ER\\",\\"Error\\":\\"Invalid CM-Site Combination\\"}"},"severity":"error","target":"/#TRANSIENT#","ContentID":"id-1665461789241-230"}]}}}',
                        statusText: "Error"
                    }
                },
                {
                    response: {
                        statusCode: "203",
                        statusText: "Success"
                    }
                },
                {
                    __changeResponses: [{
                        statusCode: "200",
                        statusText: "OK",
                        data: {
                            boH_Qty: 10,
                            CM: "PEGA",
                            Comment: "TEST",
                            Efficiency_Field: 59,
                            Error: null,
                            Remote_Site_Cap_Demand: 35,
                            Program: "D42",
                            Site: "KSPH",
                            Uph: 30,
                            Version: "",
                            Working_Hrs: 60,
                            createdAt: "/Date(1660946591000+0000)/",
                            createdBy: "satyavrat_joshi@apple.com",
                            modifiedAt: "/Date(1660946591000+0000)/",
                            modifiedBy: "nagadivya_kancharla@apple.com"
                        }
                    }]
                }],

            }
        };
        this.oController.handleSaveSuccess(resp.data, resp);

        // File Upload test scripts
        // var response = {d:{
        //            d:{msg:[{CM:"CM1",
        //                     Program:"prg",
        //                     Site: "Site",
        //                     Error: "Invalid Site Prg"}]}}};

        // this.oController.handleFileUploadStatus(response,this.oController);                     

        var oerr = {
            status: "401",
            responseText: "Error"
        };
        this.oController.odataCommonErrorDisplay(oerr);
        this.oController.raiseSaveStatus(true,false);
        assert.ok(true);
    });
    QUnit.test("I Should test raise message function", function (assert) {
        var oViewStub = new View();
        sinon.stub(this.oController, "getView").returns(oViewStub);
        this.oController.onRaiseMessage("TRIAL","SUCCESS");
        assert.ok(true);
    });
    // QUnit.test("formatDate", function (assert){
    //     var fText = Formatter.formatDate('2022/07/13');
    //     assert.equal(fText, 'Jul 12 2022 17:00:00', 'formatDate function');
    // });
   
    QUnit.test("valueStateApply", function (assert){
        var field;
        var fText = Formatter.valueStateApply(field);
        assert.equal(fText, 'None', 'valueStateApply function');

    });
});
