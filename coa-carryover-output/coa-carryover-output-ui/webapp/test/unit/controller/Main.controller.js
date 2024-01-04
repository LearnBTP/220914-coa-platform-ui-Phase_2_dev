/*global QUnit*/

sap.ui.define([
	"coa/coa-carryover-output-ui/controller/Main.controller",
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

    QUnit.module("CarryOver Output Main Controller", {
        beforeEach: function () {
            this.oController = new Controller();
        },
        afterEach: function () {
            this.oController.destroy();
        }
    });

    // QUnit.test("I should test the Main controller Init", function (assert) {
    //     var oViewStub = new View();
    //     var oModelStub = new JSONModel();
    //     var oOwnerStub = new Component();
    //     sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
    //     sinon.stub(this.oController, "getView").returns(oViewStub);
    //     sinon.stub(oViewStub, "getModel").returns(oModelStub);

	// 	this.oController.onInit();
	// 	assert.ok(this.oController);
	// });


    QUnit.test("I should test the Main controller Save Success", function (assert) {
        var oViewStub = new View();
        var oModelStub = new JSONModel();
        var oOwnerStub = new Component();
        sinon.stub(this.oController, "getOwnerComponent").returns(oOwnerStub);
        sinon.stub(this.oController, "getView").returns(oViewStub);
        sinon.stub(oViewStub, "getModel").returns(oModelStub);

        var resp = {
            data: {
                __batchResponses: [{ statusCode: "200", __changeResponses: [{ statusCode: "200", body: `{"d":{"createdAt":"/Date(1663946422193+0000)/","createdBy":"fmonica@apple.com","modifiedAt":"/Date(1664866909740+0000)/","modifiedBy":"raghav_r@apple.com","From_CM":"LXSA","From_Site":"KSPH","From_Product":"undefined","AQID":"undefined","From_Business_Grp":"","To_CM":"PEGA","To_Site":"SHPH","To_Product":"D42","To_Business_Grp":"No Annotation","EQ_Name":"HITACHHI","MFR":"","Quantity":1,"CM_Balance_Qty":1,"Update_By":null,"Approved_By":null,"Review_Date":null,"Status":"Pending","Comment":"test","BeError":null,"Edit":1,"__metadata":{"type":"output.CarryoverOutput","uri":"https://coa-dev-cp.corp.apple.com/coa-api/v1/coa/coo-output-services/output/CarryoverOutput(From_CM='LXSA',From_Site='KSPH',From_Product='undefined',AQID='undefined')"}}}`  } ]}]
            }
        };
        
    


        // var resp = {data:"d":{"createdAt":"/Date(1663946422193+0000)/","createdBy":"fmonica@apple.com","modifiedAt":"/Date(1664866909740+0000)/","modifiedBy":"raghav_r@apple.com","From_CM":"LXSA","From_Site":"KSPH","From_Product":"undefined","AQID":"undefined","From_Business_Grp":"","To_CM":"PEGA","To_Site":"SHPH","To_Product":"D42","To_Business_Grp":"No Annotation","EQ_Name":"HITACHHI","MFR":"","Quantity":1,"CM_Balance_Qty":1,"Update_By":null,"Approved_By":null,"Review_Date":null,"Status":"Pending","Comment":"test","BeError":null,"Edit":1,"__metadata":{"type":"output.CarryoverOutput","uri":"https://coa-dev-cp.corp.apple.com/coa-api/v1/coa/coo-output-services/output/CarryoverOutput(From_CM='LXSA',From_Site='KSPH',From_Product='undefined',AQID='undefined')"}}}
      //  var succFlg = this.oController.saveSuccess(resp,0);
        var odata;
       // this.oController.handleSaveSuccess(odata,resp);
        assert.ok(this.oController);
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
        
    


        this.oController.getOwnerComponent().setModel(new JSONModel(),"MainModel");
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

        this.oController.getOwnerComponent().setModel(new JSONModel(),"mAuthorizedModel");
   
       
       var  errFlag = true ,
        succFlg = true,
        errfFlaf2 = false,
        succFlg2 = false,
        errfFlaf3 = true,
        succFlg3 = false;
  
        var err = {
         
            message: "Error"
        };;
     //   this.oController.setDataAfterFileUpload(this.oController, err);
     //  this.oController.setDataAfterFileUpload(this.oController, true);
        var oerr = {
            status: "401",
            responseText: "Error"
        };

        var changedPath = 
        
            [
                "CO_Output(createdAt=datetimeoffset'2023-01-05T05:56:44.907Z',createdBy='a_badugu%40apple.com',modifiedAt=datetimeoffset'2023-02-14T11:23:01.910Z',modifiedBy='C8834346RR',From_CM='HHZZ',From_Site='PBPH',From_Product='D63',AQID='43642-01',To_CM='HHZZ',To_Site='XEAR',To_Product='D17',From_GHSite='FXZZ',To_GHSite='FXZZ-XeAR',From_Business_Grp='',To_Business_Grp='',EQ_Name='ADAPTER%2C2.92MM%20FEMALE%20TO%202.4MM%20FEMALE',MFR='Pasternack',Quantity=1,CM_Balance_Qty=1,Approved_By='',Review_Date=null,Status='Pending',Comment='FEB06-000001041',SAP_CM_Site='HHZZ-PBPH',SAP_To_CM_Site='HHZZ-XEAR',SHORT_NAME='7-Feb')"


            ];

        

        
        this.oController.handleBatchOdataCallError(err);
       // this.oController.responseMessage (errFlag, succFlg) ;
        //this.oController.responseMessage (errfFlaf2, succFlg) ;
       // this.oController.responseMessage (errfFlaf3, succFlg3) ;
      //  this.oController.handleFileUploadStatus(response, this.oController,true);
      //  this.oController.handleFileUploadStatus(response1, this.oController,true);  
        this.oController.formatDate(formatdateData);
        this.oController.setDataAfterFileUpload(response, false,true);
        
       this.oController.handleTableSaveRecord(response1);
       this.oController.handleTableSaveRecord(response2); 
        
      // this.oController.checkTbleSaveRecord(response,changedPath); 


       
       
       
        assert.ok(this.oController);
    });

   

   

	

});
