sap.ui.define([], function () {
    "use strict";
    return {
        
        handleSaveRespsnse : function(response,changedArrLength,that){
            that.changedArray = [];
            let errorRecords = 0;
            let responseArray = response.d.msg;
            if(response.d.msg && response.d.msg.length !==0){
               if(responseArray && typeof(responseArray) !== 'string'){
               responseArray.forEach(function(oItem,index){
                   if(oItem.Error){
                       errorRecords++;
                   }
               });
               that.setErrorColumn(responseArray);
           }
       }
       if(typeof(responseArray) === 'string'){
           responseArray = [];
       }
       if(errorRecords !== 0 && errorRecords !== undefined){
       if(errorRecords === changedArrLength){
        sap.m.MessageBox.error("Error While Saving Data. Check Error Column for more details");
       } else if(errorRecords !== changedArrLength){
        sap.m.MessageBox.error("Partial Data Saved.Check Error Column for more details");
       } 
       }else{

        sap.m.MessageBox.show(response.d.msg);
           that.getView().getModel().resetChanges();
           that.getView().byId("MainTab").rebindTable();
           that.refreshAndSetTabletoDisplay();
       }


         },

         handleUploadPress: function (oEvent, that) {
            let mAuthorizedModel = that.getOwnerComponent().getModel("mAuthorizedModel");

            let filedata = oEvent.getParameter("files")[0];
            if (oEvent.getParameter("files")[0].size > 5049892) {


                sap.m.MessageBox.error("File Upload is allowed only for 16K records or File Size less than 5 MB", {
                    title: "Error"
                });
                return;
            }



            let l_url;
            let appid = mAuthorizedModel.getProperty('/appid');
            if (mAuthorizedModel.getProperty('/Origin') === "corp-apps") {
                l_url = "/coa-api/v1/coa/non-rfid-tt-service//Upload_Nonrfid/csv";

            }
            else {
                l_url = "/coa-api-ext/v1/ext/coa/non-rfid-tt-service/Upload_Nonrfid/csv";
            }

            that.getView().setBusy(true);

            let settings = {
                "url": l_url,
                "method": "PUT",
                "headers": {
                    "Content-Type": "text/csv",
                    'appid': appid
                },
                "data": filedata,
                "processData": false,
                "error": function (err) {
                    that.getView().setBusy(false);

                    that.handleFileUploadError(err, that);
                },
            };
            $.ajax(settings).done(function (response, data) {
                that.getView().setBusy(false);
                that.getView().byId("fileUploader").clear();
                that.handleFileUploadStatus(response, that, false);
            });
        },

        handleFileUploadError: function (response, that) {

            let err = false, resp, valResp,valRespChk ;
            if (response.responseJSON !== undefined) {
                if (response.responseJSON.msg) {

                    valRespChk = that.validateJSON(response.responseJSON.msg);
                    valResp = valRespChk;

                    if (valResp){
                        resp = JSON.parse(response.responseJSON.msg);
                        if (response && resp && Array.isArray(JSON.parse(response.responseJSON.msg))) {
                            for (let item of resp) {
                                if (item.ErrorMsg && item.ErrorMsg !== "") {
                                    err = true;
                                }
                            }
                            if (err) {
                                let localModel = that.getView().getModel("NonRFIDTTModel");
                                localModel.setProperty("/NonRFIdErrData", resp);
                            }
                            that.setDataForErrorLogs(err, resp, true);
                        }

                    }
                    if(!valResp){
                        resp = response.responseJSON.msg;
                        sap.m.MessageBox.information(resp);

                    }


                }
                else if (response.responseJSON.message){
                    resp = response.responseJSON.message;
                    code =  response.responseJSON.code;
                    if (code === "Bad Request"){
                     sap.m.MessageBox.information(resp);
                     that.getView().byId("OTBRefresh").firePress();

                    }


                }



            }
            else {
                resp = response.responseText;
                sap.m.MessageBox.information(resp);
             that.getView().byId("OTBRefresh").firePress();

            }



        },

        handleFileUploadStatus: function (response, that, testCase) {
            let err = false, resp;
            if (response.d.msg) {
                resp = response.d.msg;
            } else if (response.d.d.msg) {
                resp = response.d.d.msg;
            }
            if (response && resp && Array.isArray(resp)) {
                for (let item of resp) {
                    if (item.Error && item.Error !== "") {
                        err = true;
                    }
                }
                if (err) {
                    let localModel = that.getView().getModel("NonRFIDTTModel");
                    localModel.setProperty("/ErrorLogsOp", resp);
                }
                that.setDataForErrorLogs(err, resp, testCase);
            }
            else {
                that.setDataForErrorLogs(false, resp, false);

            }
        },


        setErrorColumn: function(responseArray,that){
            let oModel = that.getOwnerComponent().getModel("oDataModel");
            let PendingChg = Object.keys(oModel.getPendingChanges());
            let i;
            for (i = 0; i < PendingChg.length; i++) {
                let rowVal = oModel.getProperty("/" + PendingChg[i]);
                let resRow = responseArray.find(el => el.GH_Site === rowVal.GH_Site &&
                    el.CM === rowVal.CM &&
                    el.Site === rowVal.Site &&
                    el.Program === rowVal.Program &&
                    el.Line_Type === rowVal.Line_Type &&
                    el.Uph  === rowVal.Uph && 
                    el.Aqid === rowVal.Aqid &&
                    el.Station === rowVal.Station && 
                    el.Scope === rowVal.Scope && 
                    el.Line_Id === rowVal.Line_Id &&
                    el.Group_Priority === rowVal.Group_Priority &&
                    el.Sequence_No === rowVal.Sequence_No &&
                    el.Split === rowVal.Split &&
                    el.Mfr === rowVal.Mfr);
                if (resRow && resRow.Error) {
                    oModel.setProperty("/" + PendingChg[i] + "/Error", resRow.Error);
                  //  oModel.setProperty("/" + PendingChg[i] + "/Comments", resRow.Comments);
                }
            }
          //  that.getView().getModel().resetChanges();
        },

        onSplitSuccessChk: function(splitrowData,that) {
            let mAuthorizedModel = that.getOwnerComponent().getModel("mAuthorizedModel");
            mAuthorizedModel.setProperty("/SplitSave",false);
            that.onTableDataSave(null, "split",splitrowData);

        },


        onSplitSaveChk : function(splitRowArr,that) {
            let mAuthorizedModel = that.getOwnerComponent().getModel("mAuthorizedModel");
            if (!that.oSplitSaveDialog) {
                that.oSplitSaveDialog = new sap.m.Dialog({
                    type: sap.m.DialogType.Message,
                    title: "Confirm",
                    content: new sap.m.Text({ text: "Do you want to save unsaved Data" }),
                    beginButton: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: "Yes",
                        press: function () {
                            mAuthorizedModel.setProperty("/SplitSave",true);
                            that.onTableDataSave(null,undefined,undefined,splitRowArr);
                            that.oSplitSaveDialog.close();
                        }.bind(that)
                    }),
                    endButton: new sap.m.Button({
                        type: sap.m.ButtonType.Emphasized,
                        text: "No",
                        press: function () {
                            mAuthorizedModel.setProperty("/SplitSave",false);
                            that.onTableDataSave(null, "split", splitRowArr);
                            that.oSplitSaveDialog.close();
                        }.bind(that)
                    })
                });
            }
            that.oSplitSaveDialog.open();

        },

        onSyncValidation : function(programVal,ghVal){
            if (programVal.length !== 0 && ghVal.length === 0 ){
                MessageBox.error("Select atleast one GH Site to Proceed");
               return;
            }
        },

        onSltMassUpdVal : function(notAllRecordLaoded) {
            if (notAllRecordLaoded) {
                MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                return;

            }
        },

         onChanRFSmartble: function (oEvent,that) {
                let params = oEvent.getParameters();   
                let old_value = oEvent.getSource().getLastValue(); 
                    let regInt =  /^(Y|""|^(?=\s*$))$/;
                    let chacolumn  = oEvent.getSource();
                    if (regInt.test(params.newValue)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValue(old_value);
                        oEvent.getSource().setValueStateText("Enter Y or blank only");
                    }   
                   
                    function message() {
                        chacolumn.setValueState(sap.ui.core.ValueState.None);
                        chacolumn.setValueStateText("");
                     }
                     setTimeout(message,3000);    
            },

            onChanRFSmartbleQty: function (oEvent,that) {
            let params = oEvent.getParameters();   
            let old_value = oEvent.getSource().getLastValue(); 
             let regInt = /^\s*(?=.*[0.1-9])\d*(?:\.\d{0,2})?\s*$/;
            let chacolumn  = oEvent.getSource();

            

                if (regInt.test(params.newValue)) {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                    oEvent.getSource().setValueStateText("");
                }
                else {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                    if(params.newValue === ""){
                        oEvent.getSource().setValue("");

                    }
                    else{
                        oEvent.getSource().setValue(old_value);

                    }
                  
                    oEvent.getSource().setValueStateText("Enter Valid Number Greater than 0");
                }    
               
                function message() {
                    
                    chacolumn.setValueState(sap.ui.core.ValueState.None);
                    chacolumn.setValueStateText("");
                    
                   
                 }
                 setTimeout(message,3000);
            
        },


        SynchSuccess : function(response,that) {
            that.onSyncDialofClose();
            that._oSmartTable.setBusy(false);
            if(response.msg){
                let message = response.msg;
                sap.m.MessageBox.success(message);

            }
            that.getView().getModel("NonRFIDTTModel").setProperty("/selGHSite",[]);
            that.getView().getModel("NonRFIDTTModel").setProperty("/selprogram",[]);   
        },

        deleteCheck : function(dCheck,that) {
            if (dCheck) {
                sap.m.MessageToast.show("Approved Records cannot be deleted");
                that.oDelConfirmDialog.close();
                return;
            }

           
        },

        checkSplitRecord : function(response,that){
            that.getView().byId("MainTab").rebindTable();
            that.changedArray = [];
            that.getView().getModel().resetChanges();
            sap.m.MessageToast.show(response.d.msg);



        },

        

        getGhSiteDDSync: function (oEvent,isFragmentOpen,Field,that) {

            let oDataModel = that.getOwnerComponent().getModel("oDataModel");

            that.getView().setBusy(true);

            oDataModel.read("/F4help", {

                urlParameters: {
                    "$orderby": `${Field} asc`,
                    "$select": `${Field}`
                },

                success: function (oData) {
                    that.getView().setBusy(false);
                    that.bindResulttoModel(oData,"GH_Site");
                    if (isFragmentOpen) {
                        that.openSyncNonRFIDDialog();
                    }

                }.bind(that),
                error: function (oError) {
                    that.getView().setBusy(false);
                    that.handleBatchOdataCallError(oError);
                }.bind(that)
            });
        },

        getProgramDDSync: function (oEvent, isFragmentOpen, Field,that) {
            let oDataModel = that.getOwnerComponent().getModel("oDataModel");
            that.getView().setBusy(true);

            oDataModel.read("/F4help", {

                urlParameters: {
                    "$orderby": `${Field} asc`,
                    "$select": `${Field}`
                },

                success: function (oData) {
                    that.getView().setBusy(false);
                    that.bindResulttoModel(oData,"Program");
                    if (isFragmentOpen) {
                        that.openSyncNonRFIDDialog();
                    }

                }.bind(that),
                error: function (oError) {
                    that.getView().setBusy(false);
                    that.handleBatchOdataCallError(oError);
                }.bind(that)
            });
        },

        massUpdateSucess: function(that,response) {
            that.getView().setBusy(false);
            that._oSmartTable.setBusy(false);
            that.getView().getModel().resetChanges();
            that.getView().byId("MainTab").rebindTable();
            that.handleErrorLogs(response, that, false);

        },






        handleErrorLogs: function (response, that, testCase) {
            let err = false, resp;
            if(response !== undefined) {

                if (response.d && response.d.msg) {
                    resp = response.d.msg;
                } else if (response.d && response.d.d && response.d.d.msg) {
                    resp = response.d.d.msg;
                } else if(response.msg) {
                    resp = response.msg;
    
                }
                
                if (response && resp && Array.isArray(resp)) {
                    for (let item of resp) {
                        if (item.Error && item.Error !== "") {
                            err = true;
                        }
                    }
                    if (err) {
                        let localModel = that.getView().getModel("NonRFIDTTModel");
                        localModel.setProperty("/ErrorLogsOp", resp);
                    }
                    that.setDataForErrorLogs(err, resp, testCase,that);
                }
                else {
                    sap.m.MessageBox.information(resp);
                    that.getView().byId("OTBRefresh").firePress();
    
                }

            }
            else {
                sap.m.MessageBox.information(resp);
                that.getView().byId("OTBRefresh").firePress();

            }
        },

           /**
   * Method: setDataForErrorLogs
   * Description: This method is used to open the fragment when user upload the excel file
   * 
   * **/
           setDataForErrorLogs: function (err, resp, testCase,that) {

            if (!err) {
                sap.m.MessageToast.show("Data Saved successfully refresh the table");
                if (testCase !== true) {
                
                    that.refreshAndSetTabletoDisplay();
                }
            } else {
                sap.ui.core.Fragment.load({ name: "com.apple.coa.coanonrfidtrackerui.Fragments.Error_LogsDialog", controller: that }).then(function name(oFragment) {
                    that._RecordLogsPopover = oFragment;
                    that.getView().addDependent(that._RecordLogsPopover);
                    that._RecordLogsPopover.open();
                }.bind(that));
                if (testCase !== true) {
                    that.refreshAndSetTabletoDisplay();

                }
            }
        },

        approveUIValidation: function (allRecordsLoaded, approveValidation,that) {
            let recordsnotLoaded = true, approveErrorOccured = false;
            let selectedRows = that._oSmartTable.getTable().getSelectedIndices();
           
            let index, i;
            for (i = 0; i < selectedRows.length; i++) {
                index = selectedRows[i];
               
                if (that._oSmartTable.getTable().getContextByIndex(index)) {
                    let rowContext = that._oSmartTable.getTable().getContextByIndex(index);
                    that._oSmartTable.getModel().setProperty(rowContext.sPath + "/Error", " ");
                    let currentStatus = that._oSmartTable.getTable().getContextByIndex(index).getProperty("Status");
                     if (currentStatus) {
                        currentStatus = currentStatus.toLowerCase();
                        if (currentStatus === "approved") {
                            sap.m.MessageToast.show("One or More records have Approved Status Already.Please Check");
                            approveErrorOccured = true;
                            break;
                        } else if (currentStatus === "rejected") {
                            sap.m.MessageToast.show("One or More records have Rejected status. Please save the record to approve");
                            approveErrorOccured = true;
                            break;
                        }
                    } else {
                        sap.m.MessageToast.show("Approve can happen only from pending.Save the record and approve");
                        approveErrorOccured = true;
                        break;
                    }
                } else {
                    recordsnotLoaded = false;

                    break;
                }

            }

            if (!recordsnotLoaded) {

                return [recordsnotLoaded, approveErrorOccured];

            }
            else {

                return [allRecordsLoaded, approveErrorOccured];
            }


        },
        validateBeforeCancel: function (oModel, selectedRows,that) {
            let i;
            for (i = 0; i < selectedRows.length; i++) {
                let index = selectedRows[i];
                let rowContext = that._oSmartTable.getTable().getContextByIndex(index);
                if (rowContext) {
                    that._oSmartTable.getModel().setProperty(rowContext.sPath + "/Error", " ");
                    if (!oModel.getProperty(rowContext.sPath + "/" + "Status")) {
                        return true;
                    }
                }
            }
        },

        resetUIValidation: function (allRecordsLoaded, resetValidation,that) {
            let recordsnotLoaded = true, resetErrorOccured = false;
            let selectedRows = that._oSmartTable.getTable().getSelectedIndices();
            let index, i;
            for (i = 0; i < selectedRows.length; i++) {
                index = selectedRows[i];
                if (that._oSmartTable.getTable().getContextByIndex(index)) {
                    let rowContext = that._oSmartTable.getTable().getContextByIndex(index);
                    that._oSmartTable.getModel().setProperty(rowContext.sPath + "/Error", " ");
                    let currentStatus = that._oSmartTable.getTable().getContextByIndex(index).getProperty("Status");
                    if (currentStatus) {
                        currentStatus = currentStatus.toLowerCase();
                        if (currentStatus !== "approved") {
                            sap.m.MessageToast.show("Only Approved Records can be Reset.Please check");
                            resetErrorOccured = true;
                            break;
                        }
                    } else {
                        sap.m.MessageToast.show("Only Approved Records can be Reset.Please check");
                        resetErrorOccured = true;
                        break;
                    }

                } else {
                    recordsnotLoaded = false;

                    break;
                }

            }
            if (!recordsnotLoaded) {

                return [recordsnotLoaded, resetErrorOccured];

            }
            else {

                return [allRecordsLoaded, resetErrorOccured];
            }



        },


        rejectUIValidation: function (allRecordsLoaded, rejectValidation,that) {
            let recordsnotLoaded = true, rejectErrorOccured = false;
            let selectedRows = that._oSmartTable.getTable().getSelectedIndices();
            let index, i;
            for (i = 0; i < selectedRows.length; i++) {
                index = selectedRows[i];
                if (that._oSmartTable.getTable().getContextByIndex(index)) {
                    let rowContext = that._oSmartTable.getTable().getContextByIndex(index);
                    that._oSmartTable.getModel().setProperty(rowContext.sPath + "/Error", " ");
                    let currentStatus = that._oSmartTable.getTable().getContextByIndex(index).getProperty("Status");
                    if (currentStatus) {
                        currentStatus = currentStatus.toLowerCase();
                        if (currentStatus === "rejected") {
                            sap.m.MessageToast.show("One or More records have Rejected Status.Please Check");
                            rejectErrorOccured = true;
                            break;
                        }
                        else if (currentStatus === "approved") {
                            sap.m.MessageToast.show("Cannot Reject Approved Records");
                            rejectErrorOccured = true;
                            break;
                        }
                    } else {
                        sap.m.MessageToast.show("One or More records have Blank Status.Please Check");
                        rejectErrorOccured = true;
                        break;

                    }
                } else {
                    recordsnotLoaded = false;

                    break;
                }
            }
            if (!recordsnotLoaded) {

                return [recordsnotLoaded, rejectErrorOccured];

            }
            else {

                return [allRecordsLoaded, rejectErrorOccured];
            }



        },

         historyTabInit: function (oEvent,that) {
                let oTable = oEvent.getSource().getTable();
                let aColumns = oTable.getColumns();

                for (let acol of aColumns) {
                    acol.setWidth("15rem");
                    if (acol.data("p13nData").columnKey === "modifiedAt") {
                        acol.getTemplate().getBindingInfo("text").formatter = that.formatDate();
                    }     
                }
            },

         

        errorTabInit: function (oEvent) {
            let oTable = oEvent.getSource().getTable();
            let aColumns = oTable.getColumns();
            let i;
            for (i = 0; i < aColumns.length; i++) {
                let sPath = "NonRFIDTTModel>" + aColumns[i].data("p13nData").columnKey;
                aColumns[i].getTemplate().bindText(sPath);
                aColumns[i].setWidth("6rem");
                if (aColumns[i].data("p13nData").columnKey === "Error") {
                    aColumns[i].setWidth("15rem");
                }
            }
        },

        removeErrorPendingChangesQ: function(that){
            let oModel = that.getView().getModel();
            let pendingChanges = oModel.getPendingChanges();
            let entries = Object.entries(pendingChanges);
            let changedData = false;
            if(entries && entries.length !==0){
            let i,j;
            let pendingArray = JSON.parse(JSON.stringify(entries));
            for(i = 0;i< entries.length; i++){
                let entries1 = entries[i];
                for(j = 0; j< entries1.length; j++){
                    if(entries1[j].hasOwnProperty("Error")){
                        delete pendingArray[i][j].Error;
                        delete pendingArray[i][j].__metadata;
                    }
                    if(entries1[j].hasOwnProperty("To_GHSite") || entries1[j].hasOwnProperty("To_Program") || entries1[j].hasOwnProperty("To_Business_Grp")
                    || entries1[j].hasOwnProperty("Override_Qty") || entries1[j].hasOwnProperty("Transfer_Qty")  || entries1[j].hasOwnProperty("Transfer_Flag")
                    || entries1[j].hasOwnProperty("Comments") ){
                        changedData = true;
                       
                    } 
                   
                }
            }
 
            if (changedData){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
                
        },

        deleteUiValidation: function(that){
            let smartTable = that._oSmartTable;
            let i;
            let selectedRows = [];
            selectedRows = smartTable.getTable().getSelectedIndices();
            let allRecordsLoaded = true;
            for (i = 0; i < selectedRows.length; i++) {
                let index = selectedRows[i];  
                if (!smartTable.getTable().getContextByIndex(index)) {
                    allRecordsLoaded = false;
                    break;
                }
            }

            return  allRecordsLoaded;
        }

    };
}, true);