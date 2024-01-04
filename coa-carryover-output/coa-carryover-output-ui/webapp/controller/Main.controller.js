sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    "sap/ui/model/Filter",
    "../utils/oDataResp"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageBox, exportLibrary, Spreadsheet, Filter, oDataResp) {
        "use strict";


        return Controller.extend("coa.coacarryoveroutputui.controller.Main", {
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            onInit: function () {
                // Authorization model
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let roles = mAuthorizedModel.getProperty('/AuthorizationScopes');
                if (roles.length === 0) {
                    this.getRouter().navTo("AccessDenied");
                    return;
                }

                let oDataModel = this.getOwnerComponent().getModel("MainModel");
                // getting the app id and saving in the model to use agian in the on save function
                let ModelappId = this.getOwnerComponent().getModel("MainModel").getHeaders().appid;
                mAuthorizedModel.setProperty('/ModelappId', ModelappId);

                this._oSmartTable = this.getView().byId("idCarryOverSmartTble");
                this._oSmartFilterBar = this.getView().byId("idCarryOverSmartFilBar");
                this.getView().setModel(oDataModel);
                this._oSmartFilterBar.addEventDelegate({
                    "onAfterRendering": function (oEvent) {
                        let oButton = oEvent.srcControl._oSearchButton;
                        oButton.setText("Search");
                    }
                });

                this.appODataChangeLogModel = this.getOwnerComponent().getModel("ChangeLogModel");
                this.getView().setModel(this.appODataChangeLogModel, "changeLogModel");
                this.changedArray = [];
                //setting local JSON to the view
                this.setJSONModelToView();

            },

            /**
             * Method: onCOTbleSearch
             * Description: This method is called when press on search and refresh button
             **/

            onCOTbleSearch: function () {

                let oDataModel = this.getOwnerComponent().getModel("MainModel");

                oDataModel.resetChanges();
                this.getView().byId("idCarryOverSmartTble").rebindTable();
                this.getView().byId("idCarryOverSmartTble").setEditable(false);


            },
            onChange: function (oEvent) {
                let params = oEvent.getParameters();
                let NumberFld = ["CM Balance", "idInputCMBal"]
                if (NumberFld.includes(params.id)) {
                    let regInt = /^(?:(?:\d+(?:\.\d{0,2})?)|\s*)$/;
                    if (regInt.test(params.newValue)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValueStateText("Only positive number with two decimal places is accepted");
                        oEvent.getSource().setValue('');
                    }
                }
            },
            onChangeCmBalSmartble: function (oEvent) {
                let params = oEvent.getParameters();   
                let old_value = oEvent.getSource().getLastValue(); 
                    let regInt = /^(?:(?:\d+(?:\.\d{0,2})?)|\s*)$/;
                    let chacolumn  = oEvent.getSource();
                    if (regInt.test(params.newValue)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValue(old_value);
                        oEvent.getSource().setValueStateText("Only positive number with two decimal places is accepted");
                    }   
                   
                    function message() {
                        chacolumn.setValueState(sap.ui.core.ValueState.None);
                        chacolumn.setValueStateText("");
                     }
                     setTimeout(message,3000);
                
            },


            /**
             * Method: onCOTbleSearch
             * Description: This method is called when press on  refresh button
             **/

            onRefreshbtn: function (oEvent) {
                if (this.getView().byId('idCarryOverSmartTble')) {
                    this.getView().byId('idCarryOverSmartTble').applyVariant({});
                }
                this.onCOTbleSearch();
            },

            /**
             * Method: onDataReceived
             * Description: This method is used Before binding the table
             **/
            onDataReceived: function (oEvent) {

                this._oSmartTable.getModel().refresh(true);
           

            },


            TableRowSelectionChange: function (oevt) {
                let selectAll = oevt.getParameters().selectAll;
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");

                if (selectAll === true) {
                    mAuthorizedModel.setProperty('/TableSlctAll', true);
                }
                else {
                    mAuthorizedModel.setProperty('/TableSlctAll', false);

                }

            },

            /**
             * Method: onMassUpdate
             * Description: This method is called to update the table data on click of update button on fragment
             **/



            onMassUpdate: function () {
                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getTable().getSelectedIndices();
                let tabOdata = smartTable.getTable().getModel().oData;
                let allRecordsLoaded = true, chgFlg;
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
                            break;
                        }
                    }
                   
                    this.changedArray = chgArray;
                }

                this. onMasUpdateChkSelAll(allRecordsLoaded,chgFlg);
       

            },

            onMasUpdateChkSelAll : function (allRecordsLoaded,chgFlg) {
                 // send the changed data to the ajax call for the mass update block of data
                 if (allRecordsLoaded === false) {
                    if (chgFlg === true) {
                        this.onSave(null, true);
                    } else {
                        sap.m.MessageToast.show("No Changes made");
                    }
                }
                else {
                    this._oSmartTable.setBusy(true);
                    this.MassUpdateSelectAll();
                }

            },

            MassUpdateSelectAll: function () {
         
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let that = this;
                let appid = mAuthorizedModel.getProperty('/ModelappId');
                let filters = this.getView().byId("idCarryOverSmartTble").getTable().getBinding("rows").sFilterParams;
                if (filters) {
                    filters = decodeURI(filters.split('$filter=')[1]);
                }
                let OutputData = {}, chg = false;

                OutputData.URL = filters;
                if (this.massUpdateValues[0].trim() !== '') {
                    chg = true;
                    OutputData.CM_Balance_Qty = parseInt(this.massUpdateValues[0].trim());
                }
                if (this.massUpdateValues[1] !== '') {
                    chg = true;
                    OutputData.Comment = this.massUpdateValues[1];
                }
                if (chg === false) {
                    sap.m.MessageToast.show("No Changes made");
                    return;
                }

                OutputData = JSON.stringify(OutputData);
                let oDataUrl = this.getAjaxCallURL();
                

                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: OutputData,
                    headers: {
                        "appid": appid
                    },
                    success: function (response) {
                        that._oSmartTable.setBusy(false);
                        that.handleFileUploadStatus(response, that, false);
                    },

                    error: function (oError) {
                        that._oSmartTable.setBusy(false);
                        that.changedArray = [];
                        let message, messageInfo;
                        if (oError.responseText !== undefined) {
                            try{
                                messageInfo = JSON.parse(oError.responseText);
                            message = messageInfo.error.message.value;
                            }
                            
                            catch (e) {
                                MessageBox.error("Communication Error");
                            }
                        }
                        that.onRaiseMessageUpload(message)



                    }
                });

            },

            getAjaxCallURL : function () {
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let oDataUrl;
                if (mAuthorizedModel.getProperty('/Origin') === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/coo-output-services/output/output_action";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/coo-output-services/output/output_action";
                }
                return oDataUrl;

            },

            onRaiseMessageUpload: function (message) {
                MessageBox.show(message, {
                    title: "Error",
                    styleClass: "sapUiSizeCompact",

                    actions: ["OK"]
                });
            },


            updateChgRowTabData: function (tabOdata, chgRow) {
                let obj = {}, chgFlg = false;
                for (let j = 0; j < this.massUpdateValues.length; j++) {
                    let value = this.massUpdateValues[j].trim();
                    if (value) {
                        chgRow[this.inputFields[j].getId()] = value;
                        chgFlg = true;
                    }
                }
                obj.tabOdata = tabOdata;
                obj.chgRow = chgRow;
                obj.chgFlg = chgFlg;
                return obj;
            },

            onMassUpdateAccept: function (oEvent) {
                this.massUpdateAction = "";
                if (oEvent) {
                    this.massUpdateAction = oEvent.getParameter("id");
                }

                this.onDialofClose();
            },



            updateUi: function () {
                this._oSmartTable.setBusy(true);
                this.onMassUpdate();
                this._oSmartTable.setBusy(false);
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

            onOpenUploadDialog: function (oEvent, that) {

                if (this.getView().byId("idCarryOverSmartTble").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select at least one record");
                    return;
                }

                // to check if there are any unsaved changes 
                if (this._oSmartTable.getModel().hasPendingChanges()) {
                    MessageBox.warning(
                        "There are unsaved changes in the Table.Data will be lost.Do you want to proceed?", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction === "OK") {
                                this.openMassUploadFragment();
                            } else {
                                sap.m.MessageToast.show("Click on Save Button and proceed to mass update");
                            }
                        }.bind(this)
                    });
                } else {

                    this.openMassUploadFragment();
                }
            },

            openMassUploadFragment: function () {
                let selRowCnt = this.getView().byId("idCarryOverSmartTble").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass update more than 5000 records.", {
                        title: "System Error",
                    });
                    return;
                }
                Fragment.load({
                    name: "coa.coacarryoveroutputui.Fragments.Dialog.UploadDataDialog",
                    controller: this
                }).then(function name(oFragment) {
                    this._oUploadCoreDialog = oFragment;
                    this.getView().addDependent(this._oUploadCoreDialog);
                    this._oUploadCoreDialog.open();
                }.bind(this));

            },

            onDialofClose: function (oEvent) {

                this.onUploadDialogClse();
            },

            // To Close the Dialog 
            /**
             * Method: onUploadDialogClse
             * Description: This method is called to close the Fragment Dialog, on click of cancel button
             **/

            onUploadDialogClse: function () {
                this._oUploadCoreDialog.close();
            },


            /**
             * Method: onSave
             * Description: This method is called on click of save button
             **/

            onSave: function (status, massUpdate) {

                let oModel = this.getOwnerComponent().getModel("MainModel");
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                if (jQuery.isEmptyObject(oModel.getPendingChanges()) && (massUpdate === false || massUpdate === undefined )) {
                    sap.m.MessageToast.show("No Changes are made.Save not required");
                    return;
                }
                let action;
                if (status && status.sId) {
                    action = 'Save';
                } else {
                    action = status
                }
                if (massUpdate === true) {
                    action = "";
                } else {
                    this.changedArray = [];
                    let pendingArray = this.removeErrorPendingChanges(oModel);
                    this.fillChangedRowWithTrim(pendingArray);
                }
                let dataArr = [];

                this.changedArray.forEach(function (oItem) {
                    let obj = {};

                    obj.From_CM = oItem.From_CM;
                    obj.From_Site = oItem.From_Site;
                    obj.From_Product = oItem.From_Product;
                    obj.AQID = oItem.AQID;
                    obj.To_CM = oItem.To_CM;
                    obj.To_Site = oItem.To_Site;
                    obj.To_Product = oItem.To_Product;
                    let cmBalqty = oItem.CM_Balance_Qty;
                    obj.CM_Balance_Qty = parseFloat(cmBalqty);
                    obj.Comment = oItem.Comment;

                    if (status === "Approved" || status === "Rejected") {
                        obj.Status = oItem.Status;
                    }
                    obj.Approved_By = oItem.Approved_By;
                    obj.EQ_Name = oItem.EQ_Name;
                    obj.From_Business_Grp = oItem.From_Business_Grp;
                    obj.From_GHSite = oItem.From_GHSite;
                    obj.MFR = oItem.MFR;
                    let chanqty = oItem.Quantity;
                    obj.Quantity = parseFloat(chanqty)
                    obj.Review_Date = oItem.Review_Date;
                    obj.SAP_CM_Site = oItem.SAP_CM_Site;
                    obj.SAP_To_CM_Site = oItem.SAP_To_CM_Site;
                    obj.To_Business_Grp = oItem.To_Business_Grp;
                    obj.To_GHSite = oItem.To_GHSite;
                    obj.createdAt = oItem.createdAt;
                    obj.createdBy = oItem.createdBy;
                    obj.modifiedAt = oItem.modifiedAt;
                    obj.modifiedBy = oItem.modifiedBy;
                    obj.CO_Type = oItem.CO_Type;
                    //new fields added for user id
                    obj.modifiedBy_Name = oItem.modifiedBy_Name;
                    obj.modifiedBy_mail = oItem.modifiedBy_mail;
                    obj.createdBy_Name  = oItem.createdBy_Name;
                    obj.createdBy_mail = oItem.createdBy_mail;
                    obj.Approved_By_Name = oItem.Approved_By_Name;
                    obj.Approved_By_mail = oItem.Approved_By_mail;


                    // new fields ends
                   
                    dataArr.push(obj);
                });


                // saving the save action 
                mAuthorizedModel.setProperty("/saveAction", action);
                let preData = {
                    "OutputData": dataArr,
                    "Action": action
                };

                let payloadData = JSON.stringify(preData);

                let l_url = this.getAjaxCallURL();
                let appid = mAuthorizedModel.getProperty('/ModelappId');
                

                let that = this;
                $.ajax({
                    url: l_url,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadData,
                    headers: {
                        "appid": appid
                    },
                    success: function (response) {
                        if (action === "Save") {
                            that.handleTableSaveRecord(response,that);
                        }
                        else {
                            that.changedArray = [];
                            that.getView().getModel().resetChanges();
                            that.getView().byId("idCarryOverSmartTble").rebindTable();
                            that.handleFileUploadStatus(response, that, false);
                        }
                    },
                    error: function (oError) {
                        that.changedArray = [];
                        that.getView().getModel().resetChanges();
                        that.getView().byId("idCarryOverSmartTble").rebindTable();
                        that.handleBatchOdataCallError(oError);
                    }
                });
            },

            /**
        * Method: handleTableSaveRecord
        * Description: This method is used for table save response check 
        **/

            handleTableSaveRecord: function (response,that) {

                let err = false, resp;
                if (response.d.msg) {
                    resp = response.d.msg;
                } else if (response.d.d.msg) {
                    resp = response.d.d.msg;
                }
                if (response && resp && Array.isArray(resp)) {
                    for (let item of resp) {
                        if (item.BeError && item.BeError !== "") {
                            err = true;
                        }
                    }
                    if (err) {
                        let changedPath = this.changedPath;
                        this.checkTbleSaveRecord(resp, that,changedPath);
                    }
                    else {
                        sap.m.MessageToast.show("Data Saved Successfully");
                    }

                }
                else {
                    sap.m.MessageToast.show(resp);
                    this.onCOTbleSearch();
                }
            },
            /**
        * Method: checkTbleSaveRecord
        * Description: This method is used for table save response check 
        **/

            checkTbleSaveRecord: function (resp, changedPath) {
                oDataResp.checkTbleSaveRecord(resp, this, changedPath);
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
                    changedRow.flgChg = [];
                    if (changedRow.Comment) {
                        changedRow.Comment = changedRow.Comment.trim();

                        this._oSmartTable.getModel().setProperty("/" + sPathArray[0] + "/Comment", changedRow.Comment.trim());
                        changedRow.flgChg.push("Comment");
                    }
                    if (changedRow.CM_Balance_Qty) {



                        this._oSmartTable.getModel().setProperty("/" + sPathArray[0] + "/CM_Balance_Qty", changedRow.CM_Balance_Qty);
                        changedRow.flgChg.push("CM_Balance_Qty");
                    }
                    this.changedArray.push(changedRow);
                    this.changedPath.push(sPathArray[0]);
                }
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
            /**
             * Method: onRaiseMessage
             * Description: This  is commmon method to show the message.
             **/
            onRaiseMessage: function (message, icon) {
                MessageBox.show("Unexpected System Error. Please Contact Technical Support", {
                    icon: icon,
                    title: "System Error",
                    styleClass: "sapUiSizeCompact",
                    details: message,
                    actions: ["OK"]
                });
            },


               // checkPendingChanges before approve

            onBeforeApprove: function () {
                oDataResp.onBeforeApprove(this);
            },

            /**
             * Method: onCOSmartTbleApprove
             * Description: This method is called on click of approve button
             **/

            onCOSmartTbleApprove: function () {

               
            
                this.changedArray = [];
               

                let oModel = this.getOwnerComponent().getModel("MainModel");
                let tableRows = this._oSmartTable.getTable().getSelectedIndices();
                let allRecordsApprove = true;

                for (let i of tableRows) {
                    let index = i;
                    let rowContext = this._oSmartTable.getTable().getContextByIndex(index);
                    if (rowContext) {
                        let currentStatus = rowContext.getProperty("Status");
                        let chkstatus = this.checkApproveStatus(currentStatus, oModel, rowContext);
                        if (chkstatus) {
                            return;
                        }
                    }
                    else {
                        allRecordsApprove = false;
                        this.onSelAllMassApprRej("Approved");
                        break;
                    }
                }
                if (allRecordsApprove) {
                    this.onSave('Approved', false);
                }
            },
        
            onSelAllMassApprRej: function (action) {
                oDataResp.onSelAllMassApprRej(action,this);
            },

            checkApproveStatus: function (currentStatus, oModel, rowContext) {
                this.changedArray = [];
                if (currentStatus === "Approved" || currentStatus === "Rejected" || currentStatus === "New" || currentStatus === null) {

                    sap.m.MessageToast.show("Only pending Entries Can be Approved");
                    return true


                }
                else if (currentStatus === "Pending") {
                    oModel.setProperty(rowContext.sPath + "/" + "Status", "Approved");
                    let selrow = oModel.getProperty(rowContext.getPath());
                    selrow.Status = "Approved";
                    this.changedArray.push(selrow);

                }


            },


              

               // checkPendingChanges before Reject
            onBeforeReject: function () {
                oDataResp.onBeforeReject(this);
            },

            /**
             * Method: onCOSmartTblReject
             * Description: This method is called on click of Reject button
             **/

            onCOSmartTblReject: function () {
                this.changedArray = [];
                
                let oModel = this.getOwnerComponent().getModel("MainModel");
                let tableRows = this._oSmartTable.getTable().getSelectedIndices();
                let allRecordsReject = true;

                for (let i of tableRows) {
                    let index = i;
                    let rowContext = this._oSmartTable.getTable().getContextByIndex(index);
                    if (rowContext) {
                        let currentStatus = this._oSmartTable.getTable().getContextByIndex(index).getProperty("Status");
                         let rejestatus = this.checkRejectStatus(currentStatus, oModel, rowContext);
                        if (rejestatus) {
                            return;
                        }

                    }

                    else {
                        allRecordsReject = false;
                        this.onSelAllMassApprRej("Rejected");
                        break;
                    }

                }

                if (allRecordsReject) {
                    this.onSave('Rejected', false);

                }


            },

            checkRejectStatus: function (currentStatus, oModel, rowContext) {

                if (currentStatus === "Approved" || currentStatus === "Rejected" || currentStatus === "New" || currentStatus === null) {


                    sap.m.MessageToast.show("Only pending Entries Can be Rejected");
                    return true;


                } else if (currentStatus === "Pending") {
                    oModel.setProperty(rowContext.sPath + "/" + "Status", "Rejected");
                    let selrow = oModel.getProperty(rowContext.getPath());
                    selrow.Status = "Rejected";
                    this.changedArray.push(selrow);
                }

            },

            /**
             * Method: onCustomDownload
             * Description: This method is called on clicking of download button, before expoxting the table data checking the selected row and predefined coulmns 
             **/

            onCustomDownload: function (oEvent) {

                if (this._oSmartTable.getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select at least one record");
                    return;
                }
                let getSeleKey = oEvent.oSource.mProperties.key;
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                mAuthorizedModel.setProperty("/selectedDownloadKey", getSeleKey);



                this.prepareDownloadTemplate(oEvent);


            },

            prepareDownloadTemplate: function (oEvent) {
                let mainModel = this.getOwnerComponent().getModel("MainModel");
                let smarTble = this._oSmartTable.getTable();
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let getSeleKey = mAuthorizedModel.getProperty("/selectedDownloadKey");


                let colTemplate = this.GetDownloadColoumns();



                // to check if select all is selected
                let chckSlcAll = mAuthorizedModel.getProperty('/TableSlctAll');
                if (chckSlcAll === true) {



                    this.SelAllFinalDownload(colTemplate);



                } else {

                    let sSelBindingPath = [];
                    let allRecordsdownload;

                    if (smarTble.getSelectedIndices().length !== 0) {
                        let tableRows = this._oSmartTable.getTable().getSelectedIndices();

                        let prepareDownloadData = this.prepareDownloadData(sSelBindingPath, tableRows);

                        sSelBindingPath = prepareDownloadData[0];
                        allRecordsdownload = prepareDownloadData[1];

                    }
                    if (allRecordsdownload) {

                        let getDownData = this.getDownloadedData(mainModel, sSelBindingPath);
                        let toDownloadRow = [];

                        let tabData = getDownData[0];
                        let sSelctedData = getDownData[1];


                        toDownloadRow = this.onDownloadCheck(tabData, sSelctedData, getSeleKey);
                        this.FinalDownload(toDownloadRow, colTemplate);

                    }
                    else {


                        this.SelAllFinalDownload(colTemplate);

                    }
                }

            },

            prepareDownloadData: function (sSelBindingPath, tableRows) {
                let allRecordsdownload = true;

                for (let i of tableRows) {
                    let index = i;
                    let rowContext = this._oSmartTable.getTable().getContextByIndex(index);
                    if (rowContext) {

                        let sPath = rowContext.sPath.slice(1);
                        sSelBindingPath.push(sPath);
                    }
                    else {
                        allRecordsdownload = false;
                    }


                }
                return [sSelBindingPath, allRecordsdownload];




            },

            GetDownloadColoumns: function () {

                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let getSeleKey = mAuthorizedModel.getProperty("/selectedDownloadKey");
                let colTemplate;
                if (getSeleKey === "All Output") {

                    let smartTbleClumn = this._oSmartTable.getTable()._getVisibleColumns();


                    colTemplate = smartTbleClumn.map(function (row) {


                        let path;

                        path = row.mProperties.filterProperty;


                        return {
                            label: row.getLabel().getText(),
                            property: path

                        }

                    });


                } 
                else if (getSeleKey === "CO Output") {

                    colTemplate = [{
                        label: "From Product",
                        property: "From_Product"

                    }, {
                        label: "From Site",
                        property: ["From_GHSite"],
                        type: exportLibrary.EdmType.String,
                        template: '{0} {1}'


                    }, {
                        label: "From Business Group",
                        property: "From_Business_Grp"

                    }, {
                        label: "To Product",
                        property: "To_Product"

                    }, {
                        label: "To Site",
                        property: "To_GHSite"

                    }, {
                        label: "To Business Group",
                        property: "To_Business_Grp"

                    }, {
                        label: "AppleID",
                        property: "AQID"

                    }, {
                        label: "Quantity",
                        property: "Quantity"

                    }
                   
                    ]

                }

                return colTemplate;

            },


            FinalDownload: function (toDownloadRow, colTemplate) {


                if (toDownloadRow === undefined) {
                    return;
                }
                if (toDownloadRow.length === 0) {
                    sap.m.MessageToast.show("Quantity that has zero/empty values cannot be downloaded.");
                    return;
                }


                let oSettings, oSheet;
                oSettings = {
                    workbook: {
                        columns: colTemplate,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: toDownloadRow,
                    fileName: 'CO Output.xlsx',
                    worker: false
                };



                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
                this.getView().byId("idCarryOverSmartTble").rebindTable();

            },
            SelAllFinalDownload: function (colTemplate) {

                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let getSeleKey = mAuthorizedModel.getProperty("/selectedDownloadKey");
                let slectData = "&$select=From_GHSite,From_Product,From_Business_Grp,AQID,SHORT_NAME,To_GHSite,To_Product,To_Business_Grp,EQ_Name,MFR,Quantity,CM_Balance_Qty,Comment,Status,Approved_By,Review_Date,createdBy,createdAt,modifiedBy,modifiedAt,BeError,From_CM,From_Site,To_CM,To_Site";
                let slectDataCoOutput = "&$select=From_GHSite,From_Product,From_Business_Grp,AQID,To_GHSite,To_Product,To_Business_Grp,Quantity";
                let tableRows = this._oSmartTable.getTable().getSelectedIndices().length;
                let sFilterInUrl = this._oSmartTable.getTable().getBinding("rows").sFilterParams;
                let dataURL;
                let serviceUri = this.getOwnerComponent().getModel("MainModel").sServiceUrl;
                dataURL = serviceUri + "/CO_Output?" + sFilterInUrl + slectData;

                // below filter is to pass to the backend to validate the quantity and cm balance quantity
                if (getSeleKey === "CO Output") {
                  let downnval = encodeURI(" and  (Quantity ne 0)");
                     sFilterInUrl = this._oSmartTable.getTable().getBinding("rows").sFilterParams + downnval;
                     dataURL = serviceUri + "/CO_Output_Export?" + sFilterInUrl + slectDataCoOutput;
                }
            
                let appid = mAuthorizedModel.getProperty('/ModelappId');


                let oSettings, oSheet;
                oSettings = {
                    workbook: {
                        columns: colTemplate,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: {
                        type: "odata",
                        dataUrl: dataURL,
                        serviceUrl: serviceUri,
                        count: tableRows,
                        sizeLimit:5000,
                        useBatch: true,
                        headers: {
                            "Accept": "application/json",
                            "appid": appid,
                            "Accept-Language": "en-GB",
                            "sap-contextid-accept": "header",
                            "sap-cancel-on-close": "true",
                            "DataServiceVersion": "2.0",
                            "MaxDataServiceVersion": "2.0",
                            "X-Requested-With": "XMLHttpRequest"

                        },

                    },
                    fileName: 'CO Output.xlsx'

                };

                oSheet = new Spreadsheet(oSettings);
                let changeDate = oSheet._mSettings.workbook.columns;
                this.setDateTimeDuringExport(changeDate);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });




            },

            setDateTimeDuringExport: function (columns) {
                let i;
                for (i = 0; i < columns.length; i++) {
                    if (columns[i].property === "createdAt" || columns[i].property === "modifiedAt" || columns[i].property === "Review_Date") {
                        columns[i].type = "DateTime";
                        columns[i].utc = false;
                        columns[i].timezone = "PST";
                    }
                }
            },



            getDownloadedData: function (mainModel, sSelBindingPath) {

                let tabData = Object.entries(mainModel.oData);

                let sSelctedData = Object.entries(sSelBindingPath);

                return [tabData, sSelctedData];



            },




            applyTableLogFilter: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("Table", "EQ", "T_COA_OUTPUT")
                    ]
                }));

                // Replace removed duplicate fields to correct fields in this application
                oBindingParams.filters[0].aFilters.forEach(function(oItem,index){
                    if(oItem.oValue1 === "COMMENTS"){
                        oItem.oValue1 = "COMMENT";
                    } 
                    else if(oItem.oValue1 === "EQUIPNAME"){
                        oItem.oValue1 = "EQUIPMENT_NAME";
                    }
                });
            },
            /**
             * Method: onDownloadCheck
             * Description: This method will validate the rows before downloading the file
             *              
             **/
           
            onDownloadCheck: function (tabData, sSelctedData, getSeleKey) {
           
                let toDownloadRow = [];
                for (let t of tabData) {
                    for (let k of sSelctedData) {

                        if (t[0] === k[1] && getSeleKey === "CO Output") {
                            toDownloadRow.push(t[1]);
                            toDownloadRow = toDownloadRow.filter(this.chkDownloadQuantity);

                        }
                        else if (t[0] === k[1] && getSeleKey === "All Output") {
                            t[1].Review_Date = this.formatDate(t[1].Review_Date);
                            t[1].modifiedAt = this.formatDate(t[1].modifiedAt);
                            t[1].createdAt = this.formatDate(t[1].createdAt);
                            toDownloadRow.push(t[1]);
                        }

                    }

                }

                if(getSeleKey === "CO Output"){
                    toDownloadRow  = this.dwnloadCheckCoOput(toDownloadRow);    
                }
     
                return toDownloadRow;

            },


             /**
             * Method: dwnloadCheckCoOput
             * Description: to validate the download in case of Dowbload CO Output is selected
             *              
             **/
            dwnloadCheckCoOput : function (toDownloadRow) {

                const chkArr = [];
                // If the Status = Approved then take CM Balance Qty count else for any other Status take Quantity field count as Quantity field value

                toDownloadRow.forEach((element, index) => {
                   if(element.Status === "Approved"){
                    element.Quantity = parseInt(element.CM_Balance_Qty);
                   }
                });
        // Summarise the Quantity if 5 key field (From GH Site, From Product, AppleID, To GH Site, To Product) combination values are SAME in the downloaded file using Download CO Output option
                toDownloadRow.forEach(e => {
                     
                    const index = toDownloadRow.findIndex(el => el.From_GHSite === e.From_GHSite && el.From_Product === e.From_Product && el.To_Product === e.To_Product && el.To_Site === e.To_Site &&  el.AQID === e.AQID);
                    if(index >= 0){
                       e.Quantity = parseInt(e.Quantity);
                      chkArr.push(e);  
                    }
            });
            const keys = ["From_GHSite","From_Product","To_Product","To_GHSite","AQID"];
            // Summarise the Quantity  in the below funciton
            toDownloadRow   =  oDataResp.MergeDownloadData(chkArr,keys);
            return toDownloadRow;

            },


            /**
             * Method: chkDownloadQuantity
             * Description: if the Quantiy coloumn value is 0, below function will be called, when user download the files - CO output ,
             *              all the line item which have quanity as 0 would be excluded
             **/

            chkDownloadQuantity: function (toDownloadRow) {
                return (parseInt(toDownloadRow.Quantity) !== 0 || parseInt(toDownloadRow.CM_Balance_Qty) !== 0);

            },
           

            onPressHistory: function () {
                let oView = this.getView();

                if (!this._diaChangeLog) {
                    this._diaChangeLog = Fragment.load({
                        id: oView.getId(),
                        name: "coa.coacarryoveroutputui.Fragments.Dialog.ChangeLog",
                        controller: this
                    }).then(function (oDialog) {
                        oDialog.setModel(oView.getModel("changeLogModel"));
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

            historyTabInit: function (oEvent) {
                let oTable = oEvent.getSource().getTable();
                let aColumns = oTable.getColumns();
                let that = this;

                for (let acol of aColumns) {
                    acol.setWidth("15rem");
                    if (acol.data("p13nData").columnKey === "modifiedAt") {
                        acol.getTemplate().getBindingInfo("text").formatter = that.formatDate;
                    }
                }
            },
            /**
            * Method: formatDate
            * Description: This method is used to change the time to PST time zone
            **/
            formatDate: function (value) {
                if (value) {
                    let date = new Date(value);
                    let oOutFormat1 = sap.ui.core.format.DateFormat.getDateTimeInstance({
                        pattern: "MMM d y HH:mm:ss"
                    });
                    date = oOutFormat1.format(date,false);
                    return date;
                } else {
                    return value;
                }
            },




            /**
          * Method: handleUploadPress
          * Description: This method is used for file upload response check 
          **/

            handleUploadPress: function (oEvent) {
                oDataResp.handleUploadPress(oEvent, this);
            },

            /**
        * Method: handleFileUploadStatus
        * Description: This method is used for file upload response check 
        **/



            handleFileUploadStatus: function (response, testCase) {
                oDataResp.handleFileUploadStatus(response, this, testCase);
            },



            /**
       * Method: setDataAfterFileUpload
       * Description: This method is used to open the fragment when user upload the excel file
       * 
       * **/
           
            setDataAfterFileUpload: function (err, resp, testCase) {
                oDataResp.setDataAfterFileUpload(err, resp, testCase,this);
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
                this.getView().getModel("OutputErrorModel").setProperty("/CarryoverOutput", []);

                this._RecordLogsPopover.close();

            },


            errorTabInit: function (oEvent) {
                oDataResp.errorTabInit(oEvent);
            },

           
            setJSONModelToView: function () {
                let localModel = new sap.ui.model.json.JSONModel;
                this.getView().setModel(localModel, "OutputErrorModel");
                this.getView().getModel("OutputErrorModel").setSizeLimit(10000);

            },


            onDelete: function (oEvent) {
                let selIndices = this.getView().byId("idCarryOverSmartTble").getTable().getSelectedIndices();
                let selRowCnt = this.getView().byId("idCarryOverSmartTble").getTable().getSelectedIndices().length;
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
                if (!this.oDelConfirmDialog) {
                    this.oDelConfirmDialog = new sap.m.Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Confirm",
                        content: new sap.m.Text({ text: "Are you sure to delete the selected entries from table?" }),
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Delete",
                            press: function () {
                                this.checkDeleteData();
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


            

            checkDeleteData: function () {
                oDataResp.checkDeleteData(this);
            },


            validateCoType: function (cotype,oModel,rowContext) {
                oDataResp.validateCoType(cotype,oModel,rowContext,this);
            },

            

        });
    });


   