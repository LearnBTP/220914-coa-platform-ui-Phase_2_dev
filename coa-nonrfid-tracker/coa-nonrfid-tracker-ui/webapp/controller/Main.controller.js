sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "../utils/oDataResp",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment,MessageBox, oDataResp, Filter,FilterOperator) {
        "use strict";

        return Controller.extend("com.apple.coa.coanonrfidtrackerui.controller.Main", {

            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            onInit: function () {

                // Authorization model
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                this.getView().setModel(mAuthorizedModel, "mAuthorizedModel");
                let roles = mAuthorizedModel.getProperty('/AuthorizationScopes');
                if (roles.length === 0) {
                    this.getRouter().navTo("AccessDenied");
                    return;
                }

                let oDataModel = this.getOwnerComponent().getModel("oDataModel");

                this.getView().setModel(oDataModel);

                this._oSmartTable = this.getView().byId("MainTab");


                oDataModel.attachBatchRequestCompleted(function () {
                    if (this.split) {
                        this._oSmartTable.getTable().setFirstVisibleRow(this.firstrow);
                        this.split = false;
                    }
                }.bind(this));


                let oSmartFilterBar = this.getView().byId("smartFilterBar");
                oSmartFilterBar.addEventDelegate({
                    "onAfterRendering": function (oEvent) {
                        let oButton = oEvent.srcControl._oSearchButton;
                        oButton.setText("Search");
                    }
                });

                this.changedArray = [];

                this.initializeJSONModel();
            },
            initializeJSONModel: function () {
                this.getView().setModel(new JSONModel(), "NonRFIDTTModel");
                this.getView().getModel("NonRFIDTTModel").setSizeLimit(10000);
            },

            onSFBSearch: function (oEvent) {
                this.refreshAndSetTabletoDisplay();
            },


            refreshAndSetTabletoDisplay: function () {
                this.getView().getModel().resetChanges();
                if (this.getView().byId("MainTab").getModel("sm4rtM0d3l").getProperty("/editable")) {
                    this.getView().byId("MainTab")._oEditButton.firePress();
                    this.getView().byId("MainTab").getModel("sm4rtM0d3l").setProperty("/editable", false);
                }
                this.getView().byId("MainTab").rebindTable();
            },
           
             historyTabInit: function (oEvent) {
                oDataResp.historyTabInit(oEvent,this);
            },

            onRefresh: function (oEvent) {
                let aFilters = this.getView().byId("smartFilterBar").getFilters();
                if (aFilters && aFilters.length !== 0) {
                    this.refreshAndSetTabletoDisplay();
                    this.getView().byId("MainTab").applyVariant({});
                } else {
                    sap.m.MessageToast.show("Provide Mandatory Fields in selection");
                }
            },

            onEditToggle : function () {
              // check if editable data changed or not

              let tbleDataChged = oDataResp.removeErrorPendingChangesQ(this);
              if (tbleDataChged){

                  MessageBox.error("Please Save or Refresh the data  before editing the records", {
                      title: "System Error"
                  });
                 
              }
            },

            /**
              * Method: onDelete
              * Description: This method is called on click of delete  button 
              **/
            onDelete: function (oEvent) {
                let selIndices = this.getView().byId("MainTab").getTable().getSelectedIndices();
                let selRowCnt = this.getView().byId("MainTab").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot delete more than 5000 records.", {
                        title: "System Error",
                    });
                    return;
                }
                if (selIndices.length === 0) {
                    sap.m.MessageToast.show("Please select the records for delete");
                    return;
                }

                // check if editable data changed or not

                let tbleDataChged = oDataResp.removeErrorPendingChangesQ(this);

                if (tbleDataChged){

                    MessageBox.error("Please Save or Refresh the data before Deleting the records", {
                        title: "System Error"
                    });
                    return;

                }

                if (!this.oDelConfirmDialog) {
                    this.oDelConfirmDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Confirm",
                        content: new sap.m.Text({ text: "Are you sure to delete the selected entries from table?" }),
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Delete",
                            press: function () {
                                // validating the record before deleting
                                let ttModel = this.getView().getModel("NonRFIDTTModel");
                                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                                if (chckSlcAll === false) {
                                    this.validateDeleteRecord();
                                    let dCheck = this.validateDeleteRecord();
                                    if (dCheck) {
                                        oDataResp.deleteCheck(dCheck,this);
                                    }

                                }

                                this.deleteFromBackend();
                                this.oDelConfirmDialog.close();
                            }.bind(this)
                        }),
                        endButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Cancel",
                            press: function () {
                                this.oDelConfirmDialog.close();
                            }.bind(this)
                        })
                    });
                }
                this.oDelConfirmDialog.open();
            },

            /**
             * Method: deleteFromBackend
             * Description: This method is called to delete the entries from the backend table
             **/
            deleteFromBackend: function () {

                this.changedArray = [];

                let oModel = this.getOwnerComponent().getModel("oDataModel");
                let ttModel = this.getView().getModel("NonRFIDTTModel");
                let tableRows = this._oSmartTable.getTable().getSelectedIndices();


                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                let allRecordsLoaded = oDataResp.deleteUiValidation(this);
                if (chckSlcAll === true ) {
                    this.massStatusChange("delete");

                } else if(chckSlcAll === false && !allRecordsLoaded){
                    MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                    return;
                }
                else {

                    for (let i of tableRows) {
                        let index = i,
                            rowContext = this._oSmartTable.getTable().getContextByIndex(index);


                        if (rowContext) {
                            let delRow = {};
                            delRow = rowContext.getProperty(rowContext.sPath);

                            this.setModelProperty(oModel, rowContext, delRow);
                        }
                    }

                    this.onTableDataSave(null, "dsplit", []);

                }


            },

            setModelProperty: function (oModel, rowContext, delRow) {
                if (delRow.Error || delRow.Error === null || delRow.Error === "") {
                    this._oSmartTable.getModel().setProperty(rowContext.sPath + "/Error", "ErrorRecord");


                }

            },


             

            /**
               * Method: onTableDataSave
               * Description: This method is called on click of save button
               **/
          

            onTableDataSave: function (oEvent, status, splitData,spLitRowSave) {
                this.firstrow = this._oSmartTable.getTable().getFirstVisibleRow();
                let mainAction = status;
                let splitrowData
                if (splitData === undefined) {
                    splitData = [];

                }

                let oModel = this.getOwnerComponent().getModel("oDataModel");
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                if (jQuery.isEmptyObject(oModel.getPendingChanges()) && (status !== "split") && status !== "massupdate" && status !== "Approved" && status !== "Rejected" && status !== "cancel" && status !== "reset" && status !== "dsplit") {
                    sap.m.MessageToast.show("No Changes done");
                    return;
                }
                let action;
                let chckSplitSave = mAuthorizedModel.getProperty('/SplitSave');
                if(chckSplitSave){
                     splitrowData = spLitRowSave;
                }

                action = this.checkSaveAction(status);


                let pendingArray = this.removeErrorPendingChanges(oModel);
                if(action ===  "save" || action ===  "split"  || action ===  "dsplit"){
                    this.fillChangedRowWithTrim(pendingArray);
                }

                let dataArr = [];

                this.getView().setBusy(true);

                this.changedArray.forEach(function (oItem) {
                    let obj = {};
                    obj.GH_Site = oItem.GH_Site;
                    obj.CM = oItem.CM;
                    obj.Site = oItem.Site;
                    obj.Program = oItem.Program;
                    obj.Line_Type = oItem.Line_Type;
                    obj.Uph = oItem.Uph;
                    obj.Aqid = oItem.Aqid;
                    obj.Station = oItem.Station;
                    obj.Scope = oItem.Scope;
                    obj.Line_Id = oItem.Line_Id;
                    obj.Parent_Item = oItem.Parent_Item;
                    obj.Alt_Station = oItem.Alt_Station;
                    obj.Group_Priority = oItem.Group_Priority;
                    obj.Sequence_No = oItem.Sequence_No;
                    obj.Split = oItem.Split;
                    obj.Equipment_Name = oItem.Equipment_Name;
                    obj.confLevel = parseFloat(oItem.confLevel);
                    obj.Projected_Qty = parseFloat(oItem.Projected_Qty);
                    obj.Transfer_Qty = parseFloat(oItem.Transfer_Qty);
                    obj.Override_Qty = parseFloat(oItem.Override_Qty);

                    obj.Mfr = oItem.Mfr;
                    obj.BusinessGrp = oItem.GH_BusinessGrpSite;
                    obj.Dept = oItem.Dept;
                    obj.RFID_Scope = oItem.RFID_Scope;
                    obj.Group_ID = oItem.Group_ID;
                    obj.Line_Priority = oItem.Line_Priority;
                    obj.Equipment_Type = oItem.Equipment_Type;
                    obj.To_CM = oItem.To_CM;
                    obj.To_Site = oItem.To_Site;
                    obj.To_Program = oItem.To_Program;
                    obj.To_Business_Grp = oItem.To_Business_Grp;
                    obj.To_GHSite = oItem.To_GHSite;
                    obj.Transfer_Flag = oItem.Transfer_Flag;
                    obj.Comments = oItem.Comments;
                    obj.Status = oItem.Status;
                    obj.Mapped_Aqid = oItem.Mapped_Aqid;

                    obj.SAP_CM_Site = oItem.SAP_CM_Site;
                    obj.SAP_To_CM_Site = oItem.SAP_To_CM_Site;
                    dataArr.push(obj);
                });

                this.changedArray.forEach(function (oItem) {
                    delete oItem.__metadata;
                    delete oItem.flgChg;
                    delete oItem.Edit;

                });

                let preData;
                let changedArrLength = this.changedArray.length;

                if (splitData.length !== 0) {
                    splitData[0].Transfer_Qty = parseFloat(splitData[0].Transfer_Qty);
                    splitData[0].confLevel = parseFloat(splitData[0].confLevel);
                    splitData[0].Projected_Qty = parseFloat(splitData[0].Projected_Qty);
                    splitData[0].Override_Qty = parseFloat(splitData[0].Override_Qty);
                    preData = {
                        "NonRfidData": splitData,
                        "action": action

                    };

                }
                else {
                    preData = {
                        "NonRfidData": dataArr,
                        "action": action

                    };
                }

                let payloadData = JSON.stringify(preData);

                let l_url = this.getSaveAjaxUrl();
                let that = this;
                $.ajax({
                    url: l_url,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadData,
                    headers: {
                        "appid": mAuthorizedModel.getProperty('/appid')
                    },
                    success: function (response) {
                        that.getView().setBusy(false);
                        let chkSplitSave =  mAuthorizedModel.getProperty('/SplitSave');
                       if(chkSplitSave){
                        oDataResp.onSplitSuccessChk(splitrowData,that);
                       }

                        if (action === "split") {
                            oDataResp.checkSplitRecord(response,that);

                        } else if (mainAction === undefined || mainAction === "dsplit" || mainAction === "Approved" || mainAction === "Rejected" || mainAction === "cancel" || mainAction === "reset") {

                            that.handleSaveRespsnse(response, changedArrLength);


                        }
                        else if (mainAction === "massupdate") {
                            that.handleErrorLogs(response, that, false);

                        }

                    },
                    error: function (oError) {
                        that.tableRefreshOnError();
                        that.handleBatchOdataCallError(oError);
                    }
                });

            },

            tableRefreshOnError: function () {
                this.getView().setBusy(false);
                this.changedArray = [];
                this.getView().getModel().resetChanges();
                this.getView().byId("MainTab").rebindTable();


            },


            checkSaveAction: function (status) {
                let action;

                if (status === undefined) {
                    action = "save";

                }
                else if (status === "split") {
                    action = "split";
                    this.split = true;

                }
                else if (status === "massupdate") {
                    action = "save";

                }
                else if (status === "dsplit") {
                    action = "dsplit";

                }
                else if (status === "Approved") {
                    action = "approve";

                }
                else if (status === "Rejected") {
                    action = "reject";

                }
                else if (status === "cancel") {
                    action = "cancel";

                } else if (status === "reset") {
                    action = "reset";
                }

                return action;


            },

            /**
   * Method: handleSaveRespsnse
   * Description: This method is used to check the response on click of save success 
   **/

            handleSaveRespsnse: function (response, changedArrLength) {
                oDataResp.handleSaveRespsnse(response, changedArrLength, this);
            },

            /**
      * Method: setErrorColumn
      * Description: This method is used for table save response check 
      **/

            setErrorColumn: function (responseArray) {
                oDataResp.setErrorColumn(responseArray, this);
            },


            handleBatchOdataCallError: function (oError) {
                let message, messageInfo;
                try {
                    message = oError.message;

                    if (message === undefined && oError.responseText !== undefined) {

                        messageInfo = JSON.parse(oError.responseText);
                        message = messageInfo.error.message.value;

                    }

                } catch (e) {
                    message = oError.responseText;
                }

                this.onRaiseMessage(message, "ERROR");
            },

            onRaiseMessage: function (message, icon) {
                MessageBox.show("Unexpected System Error. Please Contact Technical Support", {
                    icon: icon,
                    title: "System Error",
                    styleClass: "sapUiSizeCompact",
                    details: message,
                    actions: ["OK"]
                });
            },

            //  to get the pending changes
            removeErrorPendingChanges: function (oModel) {
                let pendingChanges = oModel.getPendingChanges();
                return Object.entries(pendingChanges);
            },

            fillChangedRowWithTrim: function (pendingArray) {
                let i;
                this.changedPath = [];
                for (i = 0; i < pendingArray.length; i++) {
                    let sPathArray = pendingArray[i];
                    let changedRow = this._oSmartTable.getModel().getProperty("/" + sPathArray[0]);


                    this.changedArray.push(changedRow);
                    this.changedPath.push(sPathArray[0]);
                }
            },

            onAfterDilogClose: function (oEvent) {

                if (this.massUpdateAction === "btnOK") {
                    this.inputFields = sap.ui.getCore().byId("smartUpdateForm").getGroups()[0].getAggregation("formElements");
                    this.massUpdateValues = [];
                    this.inputFields.forEach(function (oItem) {
                        this.massUpdateValues.push(oItem.getFields()[0].getValue().toString().trim());
                    }.bind(this));
                }
                this._oUploadCoreDialog.destroy();
               
                if (this.massUpdateAction === "btnOK") {
                    this.updateUi();
                }
            },


            //    handleFileUploadStatus
            handleFileUploadStatus: function (response) {
                oDataResp.handleFileUploadStatus(response, this, false);
            },

            //    handleFileUploadError
            handleFileUploadError: function (response) {
                oDataResp.handleFileUploadError(response, this);
            },

           

            onSyncAccept: function (oEvent) {

                    this.inputFields = sap.ui.getCore().byId("smartSynchForm").getGroups()[0].getAggregation("formElements");
                    this.synchAllValues = [];
                    let ghVal = sap.ui.getCore().byId("ghSiteInput").getSelectedKeys();
                    let programVal = sap.ui.getCore().byId("programInput").getSelectedKeys();
                    this.synchAllValues.push(ghVal);
                    this.synchAllValues.push(programVal);
                    oDataResp.onSyncValidation(programVal,ghVal);
                    this.updateUISynch();
            },


            updateUi: function () {
                this._oSmartTable.setBusy(true);
                this.onMassUpdate();
                this._oSmartTable.setBusy(false);
            },

            updateUISynch: function () {
                this._oSmartTable.setBusy(true);
                this.onSyncUpdate();
                this._oSmartTable.setBusy(false);
            },
            
            onMassUpdate: function () {

                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getTable().getSelectedIndices();
                let tabOdata = smartTable.getTable().getModel().oData;
                let allRecordsLoaded = true, chgFlg;
                let notAllRecordLaoded = false;
                let chgArray = [];

                if (smartTable.getTable()._getTotalRowCount() !== selectedRows.length) {
                    allRecordsLoaded = false;
                    for (i = 0; i < selectedRows.length; i++) {
                        let index = selectedRows[i];
                        let rowContext = smartTable.getTable().getContextByIndex(index);

                        if (rowContext) {

                            let chgRow = {};
                            chgRow = rowContext.getProperty(rowContext.sPath);
                            let obj = this.updateChgRowTabData(tabOdata, chgRow);

                            chgFlg = obj.chgFlg
                            if (chgFlg === false) {
                                break;
                            }
                            chgArray.push(obj.chgRow);

                        }
                        else {
                            notAllRecordLaoded = true;
                            break;

                        }
                    }

                    this.changedArray = chgArray;
                }

                this.onMasUpdateChkSelAll(allRecordsLoaded, chgFlg, notAllRecordLaoded);


            },

            onSyncUpdate: function () {

                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let that = this;
                let SynchData = {}, chg = false;
                if (this.synchAllValues[0].length !== 0) {
                    chg = true;
                    SynchData.GH_Site = this.synchAllValues[0];
                }
                if (this.synchAllValues[1].length !== 0) {
                    chg = true;
                    SynchData.Program_Org = this.synchAllValues[1];
                }
              
                if (chg === false) {
                    sap.m.MessageToast.show("No Changes made");
                    return;
                }

                let la = {
                    "request": SynchData
                };
                let payloadData = JSON.stringify(la);

                let oDataURl = this.getSynchAjaxUrl();
                this._oSmartTable.setBusy(true);
                sap.ui.core.BusyIndicator.show();
                $.ajax({
                    url: oDataURl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadData,
                    headers: {
                        "appid": mAuthorizedModel.getProperty('/appid')
                    },
                    success: function (response) {
                        sap.ui.core.BusyIndicator.hide();
                        oDataResp.SynchSuccess(response,that);
                      
                    },

                    error: function (oError) {
                        sap.ui.core.BusyIndicator.hide();
                        that.getView().getModel("NonRFIDTTModel").setProperty("/selGHSite",[]);
                        that.getView().getModel("NonRFIDTTModel").setProperty("/selprogram",[]);  
                         that.onSyncDialofClose();
                        that._oSmartTable.setBusy(false);
                        that.changedArray = [];
                        let message, messageInfo;
                        if (oError.responseText !== undefined) {
                            message = oError.responseText;
                            try {
                                messageInfo = JSON.parse(oError.responseText);
                                message = messageInfo.error.message.value;
                            }

                            catch (e) {
                                MessageBox.error("Communication Error");
                            }
                        }
                        else {
                            that.onRaiseMessageUpload(message);

                        }
                        that.onRaiseMessageUpload(message);

                    }
                });

            },

            onMasUpdateChkSelAll: function (allRecordsLoaded, chgFlg, notAllRecordLaoded) {
                // send the changed data to the ajax call for the mass update block of data
                if (allRecordsLoaded === false) {
                    oDataResp.onSltMassUpdVal(notAllRecordLaoded);

                     if (chgFlg === true) {
                        this.onTableDataSave(null, "massupdate", []);
                    } else {
                        sap.m.MessageToast.show("No Changes made");
                    }
                }
                else {
                    this._oSmartTable.setBusy(true);
                    this.MassUpdateSelectAll();
                }
            },

              /**
         * Method: handleUploadPress
         * Description: This method is used for file upload response check 
         **/

              handleUploadPress: function (oEvent) {
                oDataResp.handleUploadPress(oEvent, this);
            },




            MassUpdateSelectAll: function () {

                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let that = this;
                const regex = /(\d+\.\d*)m|(\d+)m/g;
                let filters = this.getView().byId("MainTab").getTable().getBinding("rows").sFilterParams;
                if (filters) {
                    filters = decodeURI(filters.split('$filter=')[1]);
                }
                filters = filters.replaceAll(regex, (match, p1, p2) => {
                    if (p1 !== undefined) {
                      return p1 + '0';
                    } else if (p2 !== undefined) {
                      return p2 + '.00';
                    }
                  });


                  let NonRfidData = {}, chg = false;
                
                NonRfidData.URL = filters;

                if (this.massUpdateValues[0] !== '') {
                    chg = true;
                    NonRfidData.To_GHSite = this.massUpdateValues[0].trim();

                }

                if (this.massUpdateValues[1] !== '') {
                    chg = true;
                    NonRfidData.To_Program = this.massUpdateValues[1].trim();

                }
                if (this.massUpdateValues[2] !== '') {
                    chg = true;
                    NonRfidData.To_Business_Grp = this.massUpdateValues[2].trim();

                }
                if (this.massUpdateValues[3] !== '') {
                    chg = true;
                    NonRfidData.Transfer_Qty = parseFloat(this.massUpdateValues[3]);

                }    
                if (this.massUpdateValues[4] !== '' || this.massUpdateValues[4] === '') {
                    chg = true;
                    NonRfidData.Transfer_Flag = this.massUpdateValues[4].trim();

                }
                if (this.massUpdateValues[5] !== '') {
                    chg = true;
                    NonRfidData.Comments = this.massUpdateValues[5].trim();

                }
                if (chg === false) {
                    sap.m.MessageToast.show("No Changes made");
                    return;
                }

                NonRfidData = JSON.stringify(NonRfidData);
                let oDataURl = this.getMassUpdateAjaxUrl();
                this._oSmartTable.setBusy(true);
                this.getView().setBusy(true);
                $.ajax({
                    url: oDataURl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: NonRfidData,
                    headers: {
                        "appid": mAuthorizedModel.getProperty('/appid')
                    },
                    success: function (response) {
                        oDataResp.massUpdateSucess(that,response);
                    },

                    error: function (oError) {
                        that.getView().setBusy(false);
                        that._oSmartTable.setBusy(false);
                        that.MassUpdateError(oError);

                    }
                });

            },

            MassUpdateError: function (oError) {
                this._oSmartTable.setBusy(false);
                this.changedArray = [];
                let message, messageInfo;
                if (oError.responseText !== undefined) {
                    message = oError.responseText;
                    try {
                        messageInfo = JSON.parse(oError.responseText);
                        message = messageInfo.error.message.value;
                    }

                    catch (e) {
                        MessageBox.error("Communication Error");
                    }
                }
                else {
                    this.onRaiseMessageUpload(message);

                }
                this.onRaiseMessageUpload(message);

            },
            
            onRaiseMessageUpload: function (message) {
                MessageBox.show(message, {
                    title: "Error",
                    styleClass: "sapUiSizeCompact",

                    actions: ["OK"]
                });
            },

            onMassUpdateAccept: function (oEvent) {
                this.massUpdateAction = "";
                if (oEvent) {
                    this.massUpdateAction = oEvent.getParameter("id");
                }

                this.onDialofClose(oEvent);
            },
 
            onDialofClose: function (oEvent) {
                this.massUpdateAction = "";
                if (oEvent) {
                    this.massUpdateAction = oEvent.getParameter("id");
                }
              
                this.onUploadDialogClse();
            },

            //  to close the synch fragment 
            onSyncDialofClose: function (oEvent) {  
                this.getView().getModel("NonRFIDTTModel").setProperty("/selGHSite",[]);
                this.getView().getModel("NonRFIDTTModel").setProperty("/selprogram",[]); 
               this.onSyncGHSDialogClse();
            },

            // To Close the Dialog 
            /**
             * Method: onUploadDialogClse
             * Description: This method is called to close the Fragment Dialog, on click of cancel button
             **/

            onUploadDialogClse: function () {
                this._oUploadCoreDialog.close();
            },


            onSyncGHSDialogClse: function () {
                this._oSyncCoreDialog.close();
            },

            onOpenUploadDialog: function (oEvent, that) {

                if (this.getView().byId("MainTab").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select at least one record");
                    return;
                }
                let selRowCnt = this.getView().byId("MainTab").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass update more than 5000 records.", {
                        title: "System Error",
                    });
                    return;
                }

                // check if editable data changed or not

                let tbleDataChged = oDataResp.removeErrorPendingChangesQ(this);

                if (tbleDataChged){

                    MessageBox.error("Please Save or Refresh the data before performing the Mass Update", {
                        title: "System Error"
                    });
                    return;

                }
                Fragment.load({
                    name: "com.apple.coa.coanonrfidtrackerui.Fragments.MassUpload",
                    controller: this
                }).then(function name(oFragmentMass) {
                    this._oUploadCoreDialog = oFragmentMass;
                    this.getView().addDependent(this._oUploadCoreDialog);
                    this._oUploadCoreDialog.open();
                }.bind(this));
          
            },

           
            // TO open the Sync dialog

            onOpenSyncDialog: function (oEvent) {

                // check if editable data changed or not

                let tbleDataChged = oDataResp.removeErrorPendingChangesQ(this);
                if (tbleDataChged){

                    MessageBox.error("Please Save or Refresh the data before doing the Sync", {
                        title: "System Error"
                    });
                    return;

                }

                this.openSyncNonRFIDDialog();
            },

            openSyncNonRFIDDialog: function (oEvent) {
             
              if(!this._oSyncCoreDialog ){
                this.getView().getModel("NonRFIDTTModel").setProperty("/selGHSite",[]);
                this.getView().getModel("NonRFIDTTModel").setProperty("/selprogram",[]);
                Fragment.load({
                    name: "com.apple.coa.coanonrfidtrackerui.Fragments.SyncNonRfid",
                    controller: this
                }).then(function name(oFragment) {
                    this._oSyncCoreDialog = oFragment;
                    this._oSyncCoreDialog.setModel(this.getView().getModel("NonRFIDTTModel"), "NonRFIDTTModel");
                    this.getView().addDependent(this._oSyncCoreDialog);
                    this._oSyncCoreDialog.open();

                }.bind(this));
                } else{
               
                this._oSyncCoreDialog.open();
            }
            },

            getGhSiteDD: function (oEvent,isFragmentOpen,Field) {
                oDataResp.getGhSiteDDSync(oEvent,isFragmentOpen,Field,this);
            },
            getProgramDD: function (oEvent, isFragmentOpen, Field) {
                oDataResp.getProgramDDSync(oEvent,isFragmentOpen,Field,this);
               
            },

           

            chkSynchDropdownData : function() {
                let chhGhValue = this.getView().getModel("NonRFIDTTModel").getProperty("/GH_Site");
                let chgPrgram = this.getView().getModel("NonRFIDTTModel").getProperty("/Program");
                if(chhGhValue === undefined || chhGhValue.length===0){
                    oDataResp.getGhSiteDDSync(undefined,true,'GH_Site_Org',this);

                }
                if(chgPrgram === undefined || chgPrgram.length===0){
                    oDataResp.getProgramDDSync(undefined,true,'Program_Org',this);

                }
            },


           bindResulttoModel: function (oData,Dropdown) {
            let that = this;
                if(Dropdown ==="GH_Site"){
                    that.getView().getModel("NonRFIDTTModel").setProperty("/GH_Site", oData.results);

                }
                else if (Dropdown ==="Program"){
                    that.getView().getModel("NonRFIDTTModel").setProperty("/Program", oData.results);
                }
                
                      
                
            },


            updateChgRowTabData: function (tabOdata, chgRow) {
                let obj = {}, chgFlg = false;
                for (let j = 0; j < this.massUpdateValues.length; j++) {
                    let value = this.massUpdateValues[j].trim();
                    if (value || (j===4 && value === "")) {
                        chgRow[this.inputFields[j].getId()] = value;
                        chgFlg = true;
                    }
                    
                }
                obj.tabOdata = tabOdata;
                obj.chgRow = chgRow;
                obj.chgFlg = chgFlg;
                return obj;
            },

            onTableSplit: function (oEvent) {
                let oModel = this.getOwnerComponent().getModel("oDataModel");
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let pendingArray = this.removeErrorPendingChanges(oModel);

                let splitRow = this.getView().getModel().getProperty(oEvent.getSource().getBindingContext().getPath());
                delete splitRow.__metadata;
                let splitRowArr = [splitRow];
                if(pendingArray.length !==0){
                    oDataResp.onSplitSaveChk(splitRowArr,this);

                }else {
                    mAuthorizedModel.setProperty("/SplitSave",false);
                    this.changedArray = [];
                    this.onTableDataSave(null, "split", splitRowArr);
                }
               
            },

            onCOSmartTbleReset: function () {
                if (this.getView().byId("MainTab").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }
                let selRowCnt = this.getView().byId("MainTab").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass reset more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }
                // check if any one of the records has approved status
                let allRecordsLoaded = true, resetValidation = false;

                let ttModel = this.getView().getModel("NonRFIDTTModel");
                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                if (chckSlcAll !== true) {
                    let getValidatedData = oDataResp.resetUIValidation(allRecordsLoaded, resetValidation, this);
                    allRecordsLoaded = getValidatedData[0];
                    resetValidation = getValidatedData[1];
                    if (resetValidation) {
                        return;

                    }
                    else if (!allRecordsLoaded) {
                        MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                        return;
                    }


                }


                this.updateTableModelStatus("Status", "Pending");
                this.resetRecords(allRecordsLoaded);
            },




            resetRecords: function (allRecordsLoaded) {

                let ttModel = this.getView().getModel("NonRFIDTTModel");
                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                if (chckSlcAll === true) {
                    this.massStatusChange("Reset");

                }
                else {
                    if (allRecordsLoaded) {
                        this.onTableDataSave(undefined, "reset", []);
                    } else {
                        this.massStatusChange("Reset");
                    }

                }






            },

            /**
           * Method: onCancel
           * Description: This method is called when user clicks on cancel and reset button
           **/

            onCancel: function (oEvent) {
                let key = oEvent.getSource().getProperty("key");
                // check if editable data changed or not

                let tbleDataChged = oDataResp.removeErrorPendingChangesQ(this);

                if (tbleDataChged){

                    MessageBox.error("Please Save or Refresh the data before Cancelling/Resetting the records", {
                        title: "System Error"
                    });
                    return;

                }

                if (key === "cancel") {
                    this.onCOSmartTbleCancelReq();
                } else if (key === "reset") {
                    this.onCOSmartTbleReset();
                }
            },
            /**
           * Method: onCancel
           * Description: This method is called when user clicks on cancel button
           * UI is passing the complete row to the backend with the action as cancel, backend will reset the status
           **/


            onCOSmartTbleCancelReq: function (oEvent) {
                if (this.getView().byId("MainTab").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }

                let selRowCnt = this.getView().byId("MainTab").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass cancel more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }
                MessageBox.warning(
                    "Are you sure you want to cancel?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            this.cancelReqUIValidation();

                        }
                    }.bind(this)
                });
            },

            cancelReqUIValidation: function () {

                let oModel = this.getOwnerComponent().getModel("oDataModel");
                let allRecordsLoaded = true;
                let smartTable = this._oSmartTable;
                let selectedRows = [];
                selectedRows = smartTable.getTable().getSelectedIndices();
                let ttModel = this.getView().getModel("NonRFIDTTModel");
                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                if (chckSlcAll !== true) {
                    let oError = oDataResp.validateBeforeCancel(oModel, selectedRows, this)
                    if (oError) {
                        MessageBox.error("Cannot Cancel.One or more records have Status Blank");
                        return;
                    }


                    allRecordsLoaded = this.setCancelData(oModel, selectedRows);
                }


                if (chckSlcAll === true) {
                    this.massStatusChange("Clear");

                }
                else {
                    if (allRecordsLoaded === true) {
                        this.onTableDataSave(undefined, "cancel", []);
                    }
                    else if (!allRecordsLoaded) {
                        MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                        return;
                    }

                    else {
                        this.massStatusChange("Clear");
                    }

                }


            },

            massStatusChange: function (status) {
                this.getView().setBusy(true);
                let that = this;
                let filters = this.getView().byId("MainTab").getTable().getBinding("rows").sFilterParams;
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let URLArr = [];
                if (filters) {
                    filters = decodeURI(filters.split('$filter=')[1]);
                }


                let NonRfidData = {},
                    action,
                    preData;

                let objURL = {
                    URL: filters

                };
                URLArr.push(objURL);






                if (status === "Approved") {
                    action = "mapprove";
                }
                else if (status === "Rejected") {
                    action = "mreject";
                }
                else if (status === "delete") {
                    action = "mdelete";
                }
                else if (status === "Clear") {
                    action = "mcancel";
                }
                else if (status === "Reset") {
                    action = "mreset";
                }




                preData = {
                    "NonRfidData": URLArr,
                    "action": action

                };


                NonRfidData = JSON.stringify(preData);

                let oDataUrl = this.getSaveAjaxUrl();

                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: NonRfidData,
                    headers: {
                        "appid": mAuthorizedModel.getProperty('/appid')
                    },
                    success: function (response) {
                        that.getView().setBusy(false);
                        that.handleErrorLogs(response, that, false);
                    },
                    error: function (oError) {

                        that.getView().setBusy(false);
                        that.changedArray = [];
                        let message, messageInfo;
                        if (oError.responseText !== undefined) {
                            message = oError.responseText;
                            try {
                                messageInfo = JSON.parse(oError.responseText);
                                message = messageInfo.error.message.value;
                            }

                            catch (e) {
                                MessageBox.error("Communication Error");
                            }
                        }
                        else {
                            that.onRaiseMessageUpload(message);

                        }
                        that.onRaiseMessageUpload(message);
                    }
                });

            },

            getSaveAjaxUrl: function () {
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/non-rfid-tt-service/nonrfid_tt_action";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/non-rfid-tt-service/nonrfid_tt_action";
                }
                return oDataUrl;
            },

            getSynchAjaxUrl: function () {
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/non-rfid-tt-service/SyncNonRFIDTT";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/non-rfid-tt-service/SyncNonRFIDTT";
                }
                return oDataUrl;
            },

            getMassUpdateAjaxUrl: function () {
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/non-rfid-tt-service/selectAllMassUpdate";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/non-rfid-tt-service/selectAllMassUpdate";
                }
                return oDataUrl;
            },

            updateTableModelStatus: function (key, value) {
                this.changedArray = [];
                this.changedPath = [];
                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getTable().getSelectedIndices();
                let allRecordsLoaded = true;
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    let rowContext = smartTable.getTable().getContextByIndex(index);
                    if (rowContext) {
                        let obj = {};
                        obj = JSON.parse(JSON.stringify(rowContext.getProperty(rowContext.sPath)));
                        obj.Status = value;
                        this.changedArray.push(obj);
                        this.changedPath.push(rowContext.sPath);
                    }
                    else {

                        allRecordsLoaded = false;
                        break;

                    }
                }

                return allRecordsLoaded;
            },




            setCancelData: function (oModel, selectedRows) {
                let i, allRecordsLoaded = true;
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    let rowContext = this._oSmartTable.getTable().getContextByIndex(index);
                    if (rowContext) {
                        this.updateCancelChangedArray(oModel);
                    } else {
                        allRecordsLoaded = false;
                        break;
                    }
                }
                return allRecordsLoaded;

            },

            updateCancelChangedArray: function (oModel) {

                this.changedArray = [];
                this.changedPath = [];
                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getTable().getSelectedIndices();
                let allRecordsLoaded = true;
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    let rowContext = smartTable.getTable().getContextByIndex(index);
                    if (rowContext) {
                        let obj = {};
                        obj = JSON.parse(JSON.stringify(rowContext.getProperty(rowContext.sPath)));
                        this.changedArray.push(obj);
                        this.changedPath.push(rowContext.sPath);
                    }
                    else {

                        allRecordsLoaded = false;
                        break;

                    }
                }

                return allRecordsLoaded;

            },

            /**
                 * Method: onSmartTbleApprove
                 * Description: This method is called on click of approve button
                 **/

            onSmartTbleApprove: function () {
                if (this.getView().byId("MainTab").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }
                let selRowCnt = this.getView().byId("MainTab").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass approve more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }

                // check if editable data changed or not

                let tbleDataChged = oDataResp.removeErrorPendingChangesQ(this);

                if (tbleDataChged){

                    MessageBox.error("Please Save or Refresh the data before Approving the records", {
                        title: "System Error"
                    });
                    return;

                }
                // check if any one of the records has approved status
                let allRecordsLoaded = true, approveValidation = false;

                let ttModel = this.getView().getModel("NonRFIDTTModel");
                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                if (chckSlcAll !== true) {
                    let getValidatedData = oDataResp.approveUIValidation(allRecordsLoaded, approveValidation, this);
                    allRecordsLoaded = getValidatedData[0];
                    approveValidation = getValidatedData[1];


                    if (approveValidation) {
                        return;

                    }
                    else if (!allRecordsLoaded) {
                        MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                        return;
                    }


                }


                this.updateTableModelStatus("Status", "Approved");
                this.approveRecords(allRecordsLoaded);

            },




            /**
                  * Method: validateDeleteRecord
                  * Description: This method is used to validate the record before deleting
                  **/

            validateDeleteRecord: function () {

                let index, i;
                let selectedRows = this._oSmartTable.getTable().getSelectedIndices();
                for (i = 0; i < selectedRows.length; i++) {
                    index = selectedRows[i];
                    if (this._oSmartTable.getTable().getContextByIndex(index)) {
                        let currentStatus = this._oSmartTable.getTable().getContextByIndex(index).getProperty("Status");
                        if (currentStatus) {
                            currentStatus = currentStatus.toLowerCase();
                            if (currentStatus === "approved") {
                                return true;
                            }
                        }
                    }

                }

            },





            /**
                   * Method: onSmartTbleReject
                   * Description: This method is called on click of reject button
                   **/

            onSmartTbleReject: function () {
                if (this.getView().byId("MainTab").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }

                let selRowCnt = this.getView().byId("MainTab").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass reject more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }

                // check if editable data changed or not

                let tbleDataChged = oDataResp.removeErrorPendingChangesQ(this);

                if (tbleDataChged){

                    MessageBox.error("Please Save or Refresh the data before Rejecting the records", {
                        title: "System Error"
                    });
                    return;

                }


                // check if any one of the records has rejected status
                let allRecordsLoaded = true, rejectValidation = false;


                let ttModel = this.getView().getModel("NonRFIDTTModel");
                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                // checking if select all is selected, backend will validate the status as there are more records in the UI
                if (chckSlcAll !== true) {
                    let getValidatedData = oDataResp.rejectUIValidation(allRecordsLoaded, rejectValidation, this);
                    allRecordsLoaded = getValidatedData[0];
                    rejectValidation = getValidatedData[1];


                    if (rejectValidation) {
                        return;

                    }
                    else if (!allRecordsLoaded) {
                        MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                        return;
                    }

                }


                this.updateTableModelStatus("Status", "Rejected");
                this.rejectRecords(allRecordsLoaded);
            },




            approveRecords: function (allRecordsLoaded) {
                let ttModel = this.getView().getModel("NonRFIDTTModel");
                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                if (chckSlcAll === true) {
                    this.massStatusChange("Approved");

                }

                else {

                    if (allRecordsLoaded) {
                        this.onTableDataSave(undefined, "Approved", []);
                    }
                    else {
                        this.massStatusChange("Approved");
                    }

                }



            },
            rejectRecords: function (allRecordsLoaded) {

                let ttModel = this.getView().getModel("NonRFIDTTModel");
                let chckSlcAll = ttModel.getProperty('/TableSlctAll');
                if (chckSlcAll === true) {
                    this.massStatusChange("Rejected");

                }
                else {

                    if (allRecordsLoaded) {
                        this.onTableDataSave(undefined, "Rejected", []);
                    }
                    else {
                        this.massStatusChange("Rejected");
                    }

                }

            },

            onPressHistory: function () {
                let oView = this.getView();

                if (!this._diaChangeLog) {
                    this._diaChangeLog = Fragment.load({
                        id: oView.getId(),
                        name: "com.apple.coa.coanonrfidtrackerui.Fragments.ChangeLog",
                        controller: this
                    }).then(function (oDialog) {
                        oDialog.setModel(oView.getModel("LogOdataModel"));
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                this._diaChangeLog.then(function (oDialog) {
                    oDialog.open();
                    sap.ui.core.Fragment.byId(oView.getId(), "tabChangeLog").rebindTable();
                });
            },

            closeChangeLog: function (oEvent) {
                this._diaChangeLog.then(function (oDialog) {
                    oDialog.close();
                })
            },
            applyTableLogFilter: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new Filter({
                    filters: [new Filter("Table", "EQ", "T_COA_NONRFID_TT")]
                }));
            },
            toCapital: function (oEvent) {
                oEvent.getSource().setValue(oEvent.getSource().getValue().toUpperCase());
            },
            OnFieldChange: function (oEvent) {
                if (oEvent.getParameter('changeEvent').getSource()._sAnnotationLabel === 'To Business Group') {
                    oEvent.getParameter('changeEvent').getSource().setValue(oEvent.getParameter('changeEvent').getSource().getValue().toUpperCase());
                }
            },

            /**
       * Method: handleErrorLogs
       * Description: This method is used to check the response  
       **/

            handleErrorLogs: function (response, testCase) {
                oDataResp.handleErrorLogs(response, this, testCase);
            },

            onAfterErrorClose: function (oEvent) {
                this._RecordLogsPopover.destroy();
            },

            /**
       * Method: fnOutput_frag_CloseLog
       * Description: This method is used to close the popover 
       * 
       * **/

            fnOutput_frag_CloseLog: function () {
                this.getView().getModel("NonRFIDTTModel").setProperty("/ErrorLogsOp", []);

                this._RecordLogsPopover.close();

            },

            /**
      * Method: setDataForErrorLogs
      * Description: This method is used to open the fragment if there are any errors
      * 
      * **/

            setDataForErrorLogs: function (err, resp, testCase) {
                oDataResp.setDataForErrorLogs(err, resp, testCase, this);
            },

            errorTabInit: function (oEvent) {
                oDataResp.errorTabInit(oEvent);
            },

            TableRowSelectionChange: function (oevt) {
                let selectAll = oevt.getParameters().selectAll;
                let ttModel = this.getView().getModel("NonRFIDTTModel");

                if (selectAll === true) {
                    ttModel.setProperty('/TableSlctAll', true);
                }
                else {
                    ttModel.setProperty('/TableSlctAll', false);

                }

            },

            /**
      * Method: onChanRFSmartble
      * Description: This method is used for input validation of Transfer Flag 
      **/

            onChanRFSmartble: function (oEvent) {
                oDataResp.onChanRFSmartble(oEvent, this);
            },


           /**
      * Method: onChanRFSmartbleQty
      * Description: This method is used for input validation of Transfer qty and override qty
      **/

           onChanRFSmartbleQty: function (oEvent) {
            oDataResp.onChanRFSmartbleQty(oEvent, this);
        },


            onFldLiveChange: function (oEvent) {
                let value = oEvent.getSource().getValue();
                let params = oEvent.getParameters();
                let ttFlag = ["idtransferflag"];
                let ttQuantity = ["idInputTranQty"];
                let regVal = /^(Y|""|^(?=\s*$))$/;
                if (ttQuantity.includes(params.id )) {
                    let regInt = /^\s*(?=.*[0.1-9])\d*(?:\.\d{0,2})?\s*$/;


                    if (regInt.test(value)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Information);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValueStateText("Enter Valid Number Greater than 0");
                        oEvent.getSource().setValue('');
                    }
                } else if (ttFlag.includes(params.id)) {
                    if (regVal.test(value)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Information);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValueStateText("Enter Y or blank only");
                        oEvent.getSource().setValue('');
                    }

                }
            },


            onBeforeExportRFIDTT: function (oEvent) {
                let aFilters = [];

                if (this._oSmartTable.getTable().getSelectedIndices().length !== 0 && this._oSmartTable.getTable().getSelectedIndices().length !== oEvent.getSource().getTable().getBinding("rows").getLength()) {
                    let sFilterInUrl = this.fillFiltersforExport(aFilters);
                    sFilterInUrl = "&" + sFilterInUrl;
                    let serviceUri = this.getOwnerComponent().getModel("oDataModel").sServiceUrl;
                    let sPath = serviceUri + "/nonRfidTT?$format=json" + sFilterInUrl;
                    oEvent.getParameter("exportSettings").dataSource.count = this._oSmartTable.getTable().getSelectedIndices().length;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = sPath;
                }

                if (oEvent.getParameter("exportSettings").dataSource.count > 50000) {
                    sap.m.MessageToast.show("Record Count is greater than 50K.Only First 50K will be downloaded");
                    oEvent.getParameter("exportSettings").dataSource.count = 50000;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = oEvent.getParameter("exportSettings").dataSource.dataUrl + '&$top=50000&$skip=0';
                   
                }


                   this.setDateTimeDuringExport(oEvent);
            },


            fillFiltersforExport: function (aFilters) {
                let allRecordsLoaded = true, sFilterInUrl;
                try {
                    this.getView().setBusy(true);
                    let i;
                    for (i = 0; i < this._oSmartTable.getTable().getSelectedIndices().length; i++) {
                        let selIndices = this._oSmartTable.getTable().getSelectedIndices()[i];
                        if (this._oSmartTable.getTable().getContextByIndex(selIndices)) {

                            let names = ["CM", "Site", "Program", "Line_Type", "Uph", "Station", "Scope", "Line_Id", "Group_Priority", "Aqid", "Sequence_No", "Mfr"];



                            aFilters = this.fillFilterArray(names, selIndices, aFilters);

                        } else {
                            allRecordsLoaded = false;
                            break;
                        }


                    }
                    this.getView().setBusy(false);
                } catch (e) {
                    this.getView().setBusy(false);
                }
                if (allRecordsLoaded) {
                    sFilterInUrl = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, this.getOwnerComponent().getModel("oDataModel").oMetadata, this.getOwnerComponent().getModel("oDataModel").oMetadata._getEntityTypeByPath("/nonRfidTT"));
                } else {
                    sFilterInUrl = this.getView().byId("MainTab").getTable().getBinding("rows").sFilterParams;
                }
                return sFilterInUrl;
            },

             fillFilterArray: function (names, selIndices, aFilters) {
                let j;

                for (j = 0; j < names.length; j++) {
                    let value = this._oSmartTable.getTable().getContextByIndex(selIndices).getProperty(names[j]);
                    aFilters.push(new Filter(names[j], FilterOperator.EQ, value));
                }

                return aFilters;
            },


            setDateTimeDuringExport: function (oEvent) {
                let i;
                let columns = oEvent.getParameter("exportSettings").workbook.columns
                for (i = 0; i < columns.length; i++) {
                    if (columns[i].property === "createdAt" || columns[i].property === "modifiedAt") {
                        columns[i].type = "DateTime";
                        columns[i].utc = false;
                    }
                }
            },

            formatDate: function (sDate) {

                if (sDate) {
                    let date = new Date(sDate);
                    let oOutFormat1 = sap.ui.core.format.DateFormat.getDateTimeInstance({
                        pattern: "MMM d y HH:mm:ss"
                    });
                    date = oOutFormat1.format(date);
                    return date;
                } else {
                    return sDate;
                }
            },


        });
    });
