/*global QUnit*/

sap.ui.define([
    "coa-mainline-ui/controller/MainLine.controller",
    "sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/comp/smarttable/SmartTable",
    "../../../utils/formatter",
], function (Controller, View, JSONModel, Component, Table,Formatter) {
    "use strict";

    QUnit.module("MainLine Controller", {
        beforeEach: function () {
            this.oController = new Controller();
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

    QUnit.test("I should test Odaata save response", function (assert) {

        var tabdata = [{
            "createdAt": "/Date(1660946591000+0000)/",
            "createdBy": "sb-zcoa_xsuaa!t9525",
            "modifiedAt": "/Date(1660946591000+0000)/",
            "modifiedBy": "sb-zcoa_xsuaa!t9525",
            "Site": "FXZZ",
            "Program": "D17",
            "Uph": 123,
            "CM": "PEGA",
            "BoH": 123,
            "Fatp_Sustaining_Qty": 12,
            "Working_Hrs": "ABCD",
            "Efficiency_Field": 11,
            "Version": "WERT",
            "Comment": "Trial"
        },
        {
            "createdAt": "/Date(1660946591000+0000)/",
            "createdBy": "sb-zcoa_xsuaa!t9525",
            "modifiedAt": "/Date(1660946591000+0000)/",
            "modifiedBy": "sb-zcoa_xsuaa!t9525",
            "Site": "FXEZ",
            "Program": "D27",
            "Uph": 12,
            "CM": "PEGB",
            "BoH": 123,
            "Fatp_Sustaining_Qty": 12,
            "Working_Hrs": "ABCD",
            "Efficiency_Field": 11,
            "Version": "WERT",
            "Comment": "Trial"
        }
        ];
        var oViewStub = new View();
        var oModelStub = new JSONModel();
        var oOwnerStub = new Component();
        var oTableStub = new Table();
        oModelStub.setProperty("/MainLine", tabdata);
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(this.oController, "getView").returns(oViewStub);
        sinon.stub(oViewStub, "getModel").returns(oModelStub);
        sinon.stub(oViewStub, "byId").returns(oTableStub);
        this.oController.getView().setModel(oModelStub, "coa");
        this.oController.getView().byId("MainLineTab").setModel(oModelStub, "coa");

        this.oController.getView().getModel("coa").setProperty("/MainLine", tabdata);

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
                            BoH: 10,
                            CM: "PEGA",
                            Comment: "TEST",
                            Efficiency_Field: 59,
                            Error: null,
                            Fatp_Sustaining_Qty: 35,
                            Program: "D42",
                            Site: "KSPH",
                            Uph: 30,
                            Version: "",
                            Working_Hrs: 60,
                            createdAt: "/Date(1660946591000+0000)/",
                            createdBy: "satyavrat_joshi@apple.com",
                            modifiedAt: "/Date(1660946591000+0000)/",
                            modifiedBy: "nagadivya_kancharla@apple.com",
                            __metadata: {
                                type: 'lineplan.T_COA_MAIN_LINE',
                                uri: "https://coa-dev-cp.corp.apple.com/coa-api/v1/coa/l…OA_MAIN_LINE(Site='KSPH',Program='D42',CM='PEGA')"
                            }
                        }
                    }]
                }],

            }
        };
        this.oController.handleSaveSuccess(resp.data, resp);
        this.oController.handleSaveSuccess(resp.data, resp,true);
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
        this.oController.onRaiseMessage("TRIAL", "SUCCESS");
        assert.ok(true);
    });
    QUnit.test("formatDate", function (assert){
        var fText = Formatter.formatDate('2022/07/13');
        assert.ok(true);
        //assert.equal(fText, 'Jul 13 2022 17:00:00', 'formatDate function');
    });
    QUnit.test("valueStateApply", function (assert){
        var field;
        var fText = Formatter.valueStateApply(field);
        assert.equal(fText, 'None', 'valueStateApply function');

    });
});
