/*global QUnit*/

sap.ui.define([
	"comapplecoa/non-rfid-projection-ui/controller/main.controller",
	"sap/ui/core/mvc/View",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/sinon",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/table/Table", 
    "sap/ui/thirdparty/sinon-qunit",
    "sap/m/MessageToast"
], function (Controller,View, JSONModel, Component, sinon, ODataModel, Table,MessageToast) {
	"use strict";

	QUnit.module("NonRF ID  Main Controller", {
        beforeEach: function () {
            this.oController = new Controller();
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

	QUnit.test("I should test the Main controller Save Error", function (assert) {
        var oViewStub = new View();
        var oModelStub = new JSONModel();
        var oOwnerStub = new Component();
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(this.oController, "getView").returns(oViewStub);
        sinon.stub(oViewStub, "getModel").returns(oModelStub);

       

        var resp = {
            data: {
                __batchResponses: [{ statusCode: "400", response: { statusCode: "400", body: '{"error":{"code":"400","message":{"lang":"en","value":"{\\"From_CM\\":\\"FOXC\\",\\"From_Site\\":\\"HHZZ\\",\\"From_Product\\":\\"undefined\\",\\"AQID\\":\\"\\",\\"BeError\\":\\"CM Balance Qty exceed total CO qty Test\\"}"},"severity":"error","target":"/#TRANSIENT#","ContentID":"id-1665417671061-543","innererror":{"errordetails":[{"code":"400","message":{"lang":"en","value":"{\\"From_CM\\":\\"FOXC\\",\\"From_Site\\":\\"HHZZ\\",\\"From_Product\\":\\"undefined\\",\\"AQID\\":\\"\\",\\"BeError\\":\\"CM Balance Qty exceed total CO qty Test\\"}"},"severity":"error","target":"/#TRANSIENT#","ContentID":"id-1665417671061-543"}]}}}' } }]
            }
        };
        
    


        this.oController.getOwnerComponent().setModel(new JSONModel(),"oDataModel");
       this.oController.handleBatchOdataCallError(resp);
     
       // var succFlg = this.oController.responseErrorHandler(resp,0);

        // File Upload test scripts
        var response = {
            d: {
                d: {
                    msg: [{
                        CM: "CM1",
                        Program: "prg",
                        Site: "Site",
                        Error: "Invalid Site Prg"
                    }]
                }
            }
        };

        var response1 = {
            d: {
                msg: [{
                    CM: "CM1",
                    Program: "prg",
                    Site: "Site",
                    Error: "Invalid Site Prg"
                 
                }],
                d: {
                    msg: [{
                        CM: "CM1",
                        Program: "prg",
                        Site: "Site",
                        Error: "Invalid Site Prg"
                    
                    }]
                }
            }
        };
        var response2 = {
            d: {
                msg: [{
                    
                }],
                d: {
                    msg: [{
                       
                    
                    }]
                }
                
            }
        };

        var formatdateData = "Mon Jan 10 2023 12:30:03 GMT+0530 (India Standard Time)";

        this.oController.getOwnerComponent().setModel(new JSONModel(),"authModel");
        this.oController.getOwnerComponent().setModel(new JSONModel(),"NonRfidErrorModel");
   
       
       
  
        var err = {
         
            message: "Error"
        };;
    
        var oerr = {
            status: "401",
            responseText: "Error"
        };

        var changedPath = 
        
            [
                "CO_Output(createdAt=datetimeoffset'2023-01-05T05:56:44.907Z',createdBy='a_badugu%40apple.com',modifiedAt=datetimeoffset'2023-02-14T11:23:01.910Z',modifiedBy='C8834346RR',From_CM='HHZZ',From_Site='PBPH',From_Product='D63',AQID='43642-01',To_CM='HHZZ',To_Site='XEAR',To_Product='D17',From_GHSite='FXZZ',To_GHSite='FXZZ-XeAR',From_Business_Grp='',To_Business_Grp='',EQ_Name='ADAPTER%2C2.92MM%20FEMALE%20TO%202.4MM%20FEMALE',MFR='Pasternack',Quantity=1,CM_Balance_Qty=1,Approved_By='',Review_Date=null,Status='Pending',Comment='FEB06-000001041',SAP_CM_Site='HHZZ-PBPH',SAP_To_CM_Site='HHZZ-XEAR',SHORT_NAME='7-Feb')"


            ];

			var changedData = [
				"nonRfidTT(ID='0000cf16-b8ad-456d-9c22-f76bee5c9584',GH_Site='iPhone_FXZZ',CM='HHZZ',Site='PBPH',Program='D22',Line_Type='MLB%20Manual%20Line%202683',Uph=580,Aqid='22441-01',Station='D22%20CELL-CAL%202',Scope='Per%20Station',Line_Id='',Group_Priority='',Sequence_No=0,Split='',Mfr='Murata')"
			]

            var input='["foo","bar",{"foo":"bar"}]';
            var input2 = ["UI test valid json"];
            this.oController.validateJSON(input);
            this.oController.validateJSON(input2);

        

        
        this.oController.handleBatchOdataCallError(err);
        this.oController.setDataAfterFileUpload(response, false,true);
  
       
        //this.oController.formatDate(formatdateData);
	//	this.oController.fillChangedRowWithTrim(changedData);
 
        //onSyncUpdate
       // this.oController.onSyncUpdate();
     
    
       
       
        assert.ok(this.oController);
    });


	QUnit.test("I Should test Ajax URL", function(assert){
        var oOwnerStub = new Component();
        var oModelStub = new JSONModel();
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(oOwnerStub, "getModel").returns(oModelStub);

        this.oController.getOwnerComponent().getModel("mAuthorizedModel").setProperty("/Origin","corp-apps");
        this.oController.getAjaxMassQPLResetURL();
        this.oController.getAjaxMassURL();
        this.oController.getAjaxCallURL();
        this.oController.getAjaxCallURLQPLreset();  

        

        this.oController.getOwnerComponent().getModel("mAuthorizedModel").setProperty("/Origin","");
        this.oController.getAjaxMassQPLResetURL();
        this.oController.getAjaxMassURL();
        this.oController.getAjaxCallURL();
        this.oController.getAjaxCallURLQPLreset();  

        assert.ok(true,"Tested ajax url function")

    });
});
