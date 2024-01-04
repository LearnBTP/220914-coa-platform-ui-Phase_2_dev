sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/ui/core/Fragment",
    "../utils/oDataResp",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Dialog, Fragment, oDataResp, MessageBox, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("com.apple.coa.rfidunscannableui.controller.Main", {
            onInit: function () {
                
                // user scope check
                if (!this.getOwnerComponent().getModel("authModel").getProperty("/display")) {
                    this.getOwnerComponent().getRouter().getTargets().display("TargetNoAuth");
                }

                // set smart table to global variable
                this._oSmartTable = this.getView().byId("rfidunscannabletable");

                // set ODataModel as default model for the view
                this.getView().setModel(this.getOwnerComponent().getModel("MainModel"));

                // set named json model for the view
                this.setJSONModelToView();

                let appODataModel =  this.getOwnerComponent().getModel("MainModel")
                appODataModel.attachBatchRequestCompleted(function () {
                    if(this.split){
                    this._oSmartTable.getTable().setFirstVisibleRow(this.firstrow);
                    this.split = false;
                    }
                }.bind(this));



                this.appODataChangeLogModel = this.getOwnerComponent().getModel("changeLogModel");
                this.getView().setModel(this.appODataChangeLogModel, "changeLogModel");

                // 
                this.oDataModel = this.getView().getModel();

                this.isMockServer = this.getOwnerComponent().getModel("device").getProperty("/isMockServer");


            },

            setJSONModelToView: function () {
                let e = new sap.ui.model.json.JSONModel;
                this.getView().setModel(e, "UnscannableModel");
                this.getView().getModel("UnscannableModel").setSizeLimit(10000);
            },
            // convert to capital
            toCapital: function (oEvent) {
                oEvent.getSource().setValue(oEvent.getSource().getValue().toUpperCase());
            },
            
            // save data to db
            onTableDataSave: function(){
                let oModel = this._oSmartTable.getModel();

                if (!oModel.hasPendingChanges()) {
                    sap.m.MessageToast.show("No Changes are made.Save not required");
                    return;
                }

                let pendingArray = this.populatePendingChanges(oModel);
                let changedData = this.fillChangedRowWithTrim(pendingArray);
                let isValid = oDataResp.validateBeforeSave(changedData.changedArray,changedData.changedPath,this);
                if(isValid){
                this.commonSaveApproveActions(changedData.changedArray,"Save",changedData.changedPath,false);
                } else{
                    MessageBox.error("Validation Error.Please check Error Column");
                    return;
                }  
            },
        getSaveAjaxUrl: function(){
            let oDataUrl;
            if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                oDataUrl = "/coa-api/v1/coa/rfid-unscannable-service/Unscannable_action";
            } else {
                oDataUrl = "/coa-api-ext/v1/ext/coa/rfid-unscannable-service/Unscannable_action";
            }
            return oDataUrl;
        },

        commonSaveApproveActions: function(changedArray,action,changedPath, isMassUpdateorStatusChg){
            
            let that = this;
            that.getView().setBusy(true);
            changedArray.forEach(function(oItem,index){
            oItem.QTY = parseInt(oItem.QTY);
            delete oItem.__metadata;
            delete oItem.ERROR;
            delete oItem.Parent;
            delete oItem.Edit;
            delete oItem.Approve;
            });

            let la =  {
                UnscanData : changedArray,
                Action: action
            } 
            let payloadData = JSON.stringify(la);

            let oDataUrl = this.getSaveAjaxUrl();
            $.ajax({
                url: oDataUrl,
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: payloadData,
                headers: {
                    "appid": that.getOwnerComponent().getModel("device").getProperty("/appid")
                },
                success: function (data) {
                    oDataResp.commonSaveSuccessFunction(data,changedPath, isMassUpdateorStatusChg,that);
                    
                },
                error: function (oError) {
                    that.getView().setBusy(false);
                    that._oSmartTable.getModel().resetChanges();
                    that.raiseBackendException(oError);
                }
            });
        },
        approveUIValidation: function () {
            let approveErrorOccured = false;
            let selectedRows = this._oSmartTable.getTable().getSelectedIndices();
            let isDataChanged = oDataResp.removeErrorPendingChangesQ(this);
                    let index, i;
                    for (i = 0; i < selectedRows.length; i++) {
                        index = selectedRows[i];
                        if(this._oSmartTable.getTable().getContextByIndex(index)){
                       let currentStatus = this._oSmartTable.getTable().getContextByIndex(index).getProperty("STATUS");
                        if (currentStatus) {
                            currentStatus = currentStatus.toLowerCase();
                            if (currentStatus === "approved") {
                                sap.m.MessageToast.show("One or More records have Approved Status Already.Please Check");
                                approveErrorOccured = true;
                                break;
                            } else if(currentStatus === "rejected"){
                                sap.m.MessageToast.show("One or More records have Rejected status. Please save the record to approve");
                                approveErrorOccured = true;
                                break;
                            } else if(currentStatus === "pending" && isDataChanged){
                                MessageBox.error("Please Save the data before Approving the records",{
                                    title: "Validation Error"
                                });
                                approveErrorOccured = true;
                                break;
                                
                            } else if(currentStatus.includes("reset")){
                                MessageBox.error("Records with Status Pending can be Approved",{
                                    title: "Validation Error"
                                });
                                approveErrorOccured = true;
                                break;
                            }
                        } else {
                            sap.m.MessageToast.show("Approve can happen only from pending.Save the record and approve");
                            approveErrorOccured = true;
                            break;
                        }
                    }     
                    }

                return approveErrorOccured;

        },
        onCOSmartTbleApprove: function(oEvent){
            if (this.getView().byId("rfidunscannabletable").getTable().getSelectedIndices().length === 0) {
                sap.m.MessageToast.show("Select Atleast one record");
                return;
            }else if(this.getView().byId("rfidunscannabletable").getTable().getSelectedIndices().length > 5000){
                MessageBox.error("Approved is allowed for maximum of 5000 records");
                return;
            }
            if(!this.selectAll){
            let approveErrorOccured = this.approveUIValidation();
            if(approveErrorOccured){
                return;
            }
        }
            let changedData =  this.prepareData("Approve");

            if(changedData.allRecordsLoaded && !this.selectAll){
                this.commonSaveApproveActions(changedData.changedArray,"Approve",[],true);
            }else if(!changedData.allRecordsLoaded && !this.selectAll){
                MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                return;
            }else{
                // implement select all mass approve
                this.massStatusChange("Approve");
            }
        },

        rejectUIValidation : function (){
            let rejectErrorOccured = false;
            let selectedRows = this._oSmartTable.getTable().getSelectedIndices();
            let isDataChanged = oDataResp.checkTbleDataChanged(this);
                    let index, i;
                    for (i = 0; i < selectedRows.length; i++) {
                        index = selectedRows[i];
                        if(this._oSmartTable.getTable().getContextByIndex(index)){
                        let currentStatus = this._oSmartTable.getTable().getContextByIndex(index).getProperty("STATUS");
                        if (currentStatus) {
                            currentStatus = currentStatus.toLowerCase();
                            if (currentStatus === "rejected" ) {
                                sap.m.MessageToast.show("One or More records have Rejected Status.Please Check");
                                rejectErrorOccured = true;
                                break;
                            }
                            else if (currentStatus === "approved") {
                                sap.m.MessageToast.show("Cannot Reject Approved Records");
                                rejectErrorOccured = true;
                                break;
                            }else if(currentStatus === "pending" && isDataChanged){
                                MessageBox.error("Please Save the data before Rejecting the records",{
                                    title: "Validation Error"
                                });
                                rejectErrorOccured = true;
                                break;
                            }else if(currentStatus.includes("reset")){
                                MessageBox.error("Records with Status Pending can be Approved",{
                                    title: "Validation Error"
                                });
                                rejectErrorOccured = true;
                                break;
                            }

                        } else{
                            sap.m.MessageToast.show("One or More records have Blank Status.Please Check");
                            rejectErrorOccured = true;
                            break;
        
                        }
                    }
                    }
                return rejectErrorOccured
        },

        onCOSmartTbleReject: function(oEvent){
            if (this.getView().byId("rfidunscannabletable").getTable().getSelectedIndices().length === 0) {
                sap.m.MessageToast.show("Select Atleast one record");
                return;
            }else if(this.getView().byId("rfidunscannabletable").getTable().getSelectedIndices().length > 5000){
                MessageBox.error("Reject is allowed for maximum of 5000 records");
                return;
            }
            if(!this.selectAll){
                let rejectErrorOccured = this.rejectUIValidation();
                if(rejectErrorOccured){
                    return;
                }
            }
            let changedData = this.prepareData("Reject");

            if(changedData.allRecordsLoaded && !this.selectAll){
                this.commonSaveApproveActions(changedData.changedArray, "Reject", [], true);
            } else if(!changedData.allRecordsLoaded && !this.selectAll){
                MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                return;
            }else{
                // implement select all mass reject
                this.massStatusChange("Reject");
            }
        },

        

        onDataReceived: function(oEvent){
            let table = oEvent.getSource().getTable();
            let columns = table.getColumns();
            let i;
            for (i = 0; i < columns.length; i++) {
                columns[i].setWidth("14rem");
                if (columns[i].data("p13nData").columnKey === "ERROR") {
                    columns[i].setWidth("45rem");
                }else if(columns[i].data("p13nData").columnKey === "Parent"){
                    columns[i].setShowFilterMenuEntry(false);
                    columns[i].setShowSortMenuEntry(false);
                }

            }

            this.setNullabeForSmartTableFields(columns);
        },
        formatDate: function (sDate) {
            if (sDate) {
                let date = new Date(sDate);
                let oOutFormat1 = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "MMM d y HH:mm:ss"
                });
                date = oOutFormat1.format(date,false);
                return date;
            } else {
                return sDate;
            }
        },

        setNullabeForSmartTableFields: function (columns) {
            columns.forEach(function (oItem) {
                oItem.getAggregation("customData")[0].getProperty("value").nullable = true;
            });
        },

        cancelUIValidation: function(key){
            let cancelErrorOccured = false;
            let selectedRows = this._oSmartTable.getTable().getSelectedIndices();
                    let index, i,action;
                    if(key === "cancel"){
                        action = "Cancelled";
                    }else{
                        action = "Reset";
                    }
                    for (i = 0; i < selectedRows.length; i++) {
                        index = selectedRows[i];
                        if(this._oSmartTable.getTable().getContextByIndex(index)){
                       let currentStatus = this._oSmartTable.getTable().getContextByIndex(index).getProperty("STATUS");
                        if (currentStatus) {
                            currentStatus = currentStatus.toLowerCase();
                            if (currentStatus !== "approved" && currentStatus !== "rejected" && currentStatus !== "pending") {
                                MessageBox.error(`Only Approved/Rejected/Pending Records can be ${action}.Please Check`,{
                                    title: "Validation Error"
                                });
                                cancelErrorOccured = true;
                                break;
                            } 
                        } else {
                            MessageBox.error(`Only Approved/Rejected/Pending Records can be ${action}.Please Check`,{
                                title: "Validation Error"
                            });
                            cancelErrorOccured = true;
                            break;
                        }
                    }     
                    }

                return cancelErrorOccured;
        },
        
        onCancel: function(oEvent){
            let key = oEvent.getSource().getProperty("key");
            if (this.getView().byId("rfidunscannabletable").getTable().getSelectedIndices().length === 0) {
                sap.m.MessageToast.show("Select Atleast one record");
                return;
            }else if(this.getView().byId("rfidunscannabletable").getTable().getSelectedIndices().length > 5000){
                MessageBox.error(`${key} is allowed for maximum of 5000 records`);
                return;
            }

            

            if(!this.selectAll){
                let cancelErrorOccured = this.cancelUIValidation(key);
                if(cancelErrorOccured){
                    return;
                }
            }

            if(key ===  "cancel"){
                this.onCOSmartTbleCancelReq();
            } else if(key === "reset"){
                this.onCOSmartTbleReset();
            }
        },

        onCOSmartTbleReset: function(oEvent){
            let changedData =  this.prepareData("Reset");

            if(changedData.allRecordsLoaded && !this.selectAll){
                this.commonSaveApproveActions(changedData.changedArray,"Reset", [], true);
            }else if(!changedData.allRecordsLoaded && !this.selectAll){
                MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                return;
            }else{
                // implement select all mass reset
                this.massStatusChange("Reset");
            }
        },

        onCOSmartTbleCancelReq: function(oEvent){
            let changedData =  this.prepareData("Cancel");

            if(changedData.allRecordsLoaded && !this.selectAll){
                this.commonSaveApproveActions(changedData.changedArray,"Cancel", [], true);
            }else if(!changedData.allRecordsLoaded && !this.selectAll){
                MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                return;
            }else{
                // implement select all mass cancel
                this.massStatusChange("Cancel");
            }
        },

        prepareData: function (key, value) {
            let smartTable = this._oSmartTable;
            let i;
            let selectedRows = [];
            selectedRows = smartTable.getTable().getSelectedIndices();
            let allRecordsLoaded = true;
            let changedArray=[],changedPath=[];
            for (i = 0; i < selectedRows.length; i++) {
                let index = selectedRows[i];  
                if (smartTable.getTable().getContextByIndex(index)) {
                    let rowContext = smartTable.getTable().getContextByIndex(index);
                    let obj = {};
                    obj = JSON.parse(JSON.stringify(rowContext.getProperty(rowContext.sPath)));
                    obj.Status = value;
                    changedArray.push(obj);
                    changedPath.push(rowContext.sPath);
                }
                else {

                    allRecordsLoaded = false;
                    break;
                    // Perform getting all the filters and calling new entity
                }
            }

            return {"changedArray": changedArray,"changedPath": changedPath,"allRecordsLoaded": allRecordsLoaded};
        },

            // populate changed records after removing spaces
            fillChangedRowWithTrim: function (pendingArray) {
                let i;
                let changedPath = [];
                let changedArray = [];
                
                for (i = 0; i < pendingArray.length; i++) {
                    let sPathArray = pendingArray[i];
                    let changedRow = this._oSmartTable.getModel().getProperty("/" + sPathArray[0]);
                    changedArray.push(changedRow);
                    changedPath.push(sPathArray[0]);
                }
                return {"changedArray": changedArray,"changedPath": changedPath};
            },

            // return pending changes
            populatePendingChanges: function (oModel) {
                let pendingChanges = oModel.getPendingChanges();
                if(pendingChanges){
                   return Object.entries(pendingChanges);
                }
            },

            handleUploadPress: function (oEvent) {
                oDataResp.handleUploadPress(oEvent, this);
            },

            handleUploadStatus: function (response) {
                oDataResp.handleFileUploadStatus(response, this);
            },


            refreshAndSetTabletoDisplay: function () {
                this.selectedIndices = [];
                this.getView().getModel().resetChanges();
                if (this.getView().byId("rfidunscannabletable").getModel("sm4rtM0d3l").getProperty("/editable")) {
                    this.getView().byId("rfidunscannabletable")._oEditButton.firePress();
                    this.getView().byId("rfidunscannabletable").getModel("sm4rtM0d3l").setProperty("/editable", false);
                }
                this.getView().byId("rfidunscannabletable").rebindTable();
            },

            // Common Error Function
            raiseBackendException: function (oError) {
                if (oError.status === 504 || oError.statusCode === 504 || oError.status === 502 || oError.statusCode === 502) {
                   this.raiseAjaxException(oError);

                } else if (oError.status === 400) {
                    this.raiseCustomExceptionCAP(oError);
                }
                else {
                    this.raiseSystemException(oError);
                }

            },

            raiseAjaxException: function(oError){
                let message = "", xmlDoc;
                let parser = new DOMParser();
                if (oError.responseText) {
                    xmlDoc = parser.parseFromString(oError.responseText, "text/xml");
                } else {
                    xmlDoc = parser.parseFromString(oError.response.body, "text/xml");
                }
                if (xmlDoc.getElementsByTagName("title") && xmlDoc.getElementsByTagName("title").length !== 0) {
                    message = xmlDoc.getElementsByTagName("title")[0].innerHTML;
                }
                MessageBox.error(message,{
                    title: "COA Error", 
                });
            },

            raiseSystemException: function(oError){
                let message = "";
                try {
                    let errorResp = JSON.parse(oError.responseText);
                    message = errorResp.error.message.value;
                } catch (e) {
                    message = oError.responseText;

                    if (!message && oError.message) {
                        message = oError.message;
                    }
                }
                MessageBox.error(message,{
                    title: "COA Error"
                });
            },

            raiseCustomExceptionCAP: function(oError){
                let message = "";
                try {
                    let errorResp = JSON.parse(oError.responseText);
                    message = errorResp.error.message.value;
                } catch (e) {
                    message = oError.responseText;

                    if (!message && oError.message) {
                        message = oError.message;
                    }
                }
                MessageBox.error(message);
            },

            // mass update click
            onMassUpdatePress: function (oEvent) {
                if (this.getView().byId("rfidunscannabletable").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }
                if (this._oSmartTable.getModel().hasPendingChanges()) {
                    MessageBox.warning(
                        "There are unsaved changes in Table.Data will be lost.want to proceed?", {
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
            // open massupdate fragment
            openMassUploadFragment: function () {
                let selRowCnt = this.getView().byId("rfidunscannabletable").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("Mass update is allowed for 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }
                Fragment.load({ name: "com.apple.coa.rfidunscannableui.Fragments.MassUpdate", controller: this }).then(function name(oFragment) {
                    this.oDialogMassUpdate = oFragment;
                    this.getView().addDependent(this.oDialogMassUpdate);
                    this.oDialogMassUpdate.open();
                }.bind(this));
            },
            // refresh button press
            onTableRefresh: function(oEvent){
                let aFilters = this.getView().byId("smartFilterBar").getFilters();
                if(aFilters && aFilters.length !== 0){
                this.refreshAndSetTabletoDisplay();
                if (this.getView().byId("rfidunscannabletable")) {
                    this.getView().byId("rfidunscannabletable").applyVariant({});
                }
                }else{
                    if(!this.isMockServer){
                    sap.m.MessageToast.show("Provide Mandatory Fields in selection");
                    }
                }
            },
            onCloseDialog: function (oEvent) {
                this.oDialogMassUpdate.close();
            },
            onAfterDilogClose: function (oEvent) {
                if (!this.isMockServer) {
                    this.massUpdateAction = oEvent.getParameter("origin").getId();
                }
                else if (this.isMockServer) {
                    this.massUpdateAction = "btnOK";
                }
                let massUpdateValues = [];
                if (this.massUpdateAction === "btnOK") {
                    this.inputFields = sap.ui.getCore().byId("smartUpdateForm").getGroups()[0].getAggregation("formElements");
                    this.inputFields.forEach(function (oItem) {
                        massUpdateValues.push(oItem.getFields()[0].getValue().toString().trim());
                    }.bind(this));
                }
                this.oDialogMassUpdate.destroy();
                if (this.massUpdateAction === "btnOK") {
                    this.updateUi(massUpdateValues);
                }
            },

            onMassUpdateAccept: function (oEvent) {
                this.massUpdateAction = "";
                if (oEvent) {
                    this.massUpdateAction = oEvent.getParameter("id");
                }
                this.onCloseDialog();
            },
            updateUi: function (massUpdateValues) {
                if(massUpdateValues[5]){
                    massUpdateValues[5] = massUpdateValues[5].toUpperCase();
                }
                if(massUpdateValues[3]){
                    massUpdateValues[3] = massUpdateValues[3].toUpperCase();
                }
                if(massUpdateValues[3] && massUpdateValues[3] !== "Y"){
                    MessageBox.error("Flex Kits must be Either blank or Y");
                    return;
                }else if( massUpdateValues[5] && massUpdateValues[5] !== "Y" && massUpdateValues[5] !== "N"){
                    MessageBox.error("Transfer Flag Accepts Either Y or N");
                    return;
                }
                this._oSmartTable.setBusy(true);
                this.onMassUpdate(massUpdateValues);
                this._oSmartTable.setBusy(false);
            },

            onMassUpdate: function (massUpdateValues) {
                let that = this;
                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                if(!massUpdateValues[0] && !massUpdateValues[1] && !massUpdateValues[2] && !massUpdateValues[3] && !massUpdateValues[4] && !massUpdateValues[5] && !massUpdateValues[6]){
                    sap.m.MessageBox.error("Nothing to Update");
                    return;
                }
                selectedRows = smartTable.getTable().getSelectedIndices();
                let allRecordsLoaded = true;
                let changedArray=[],changedPath=[];
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    
                    if (smartTable.getTable().getContextByIndex(index) && !this.selectAll) {
                        let rowContext = smartTable.getTable().getContextByIndex(index);
                        let obj = this.fillChangedArrMassUpdate(rowContext,massUpdateValues);
                        changedArray.push(obj);
                        changedPath.push(rowContext.sPath);
                    }
                    else {

                        allRecordsLoaded = false;
                        break;
                        // Perform getting all the filters and calling new entity
                    }
                }

                if (allRecordsLoaded && !this.selectAll) {
                    this.commonSaveApproveActions(changedArray, "Save",changedPath,true);
                } else if(!allRecordsLoaded && !this.selectAll){
                    MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                    return;
                }else {
                    this.selectAllMassUpdate(massUpdateValues,that);
                }
            },

            fillChangedArrMassUpdate: function(rowContext,massUpdateValues){
                let obj = JSON.parse(JSON.stringify(rowContext.getProperty(rowContext.sPath)));
                obj.TO_GHSITE = (massUpdateValues[0]) ? massUpdateValues[0] : obj.TO_GHSITE;
                obj.TO_PROGRAM = (massUpdateValues[1]) ? massUpdateValues[1] : obj.TO_PROGRAM;
                obj.TO_BUSINESS_GRP = (massUpdateValues[2]) ? massUpdateValues[2] : obj.TO_BUSINESS_GRP;
                obj.FLEX_KITS = (massUpdateValues[3]) ? massUpdateValues[3] : obj.FLEX_KITS;
                obj.QTY = (parseInt(massUpdateValues[4])) ? parseInt(massUpdateValues[4]) : obj.QTY;
                obj.TRANSFER_FLAG = (massUpdateValues[5]) ? massUpdateValues[5] : obj.TRANSFER_FLAG;
                obj.COMMENT = (massUpdateValues[6]) ? massUpdateValues[6] : obj.COMMENT;

                return obj;
            },

            selectAllMassUpdate: function(massUpdateValues,that){
            this.getView().setBusy(true);
            let filters = this.getView().byId("rfidunscannabletable").getTable().getBinding("rows").sFilterParams;
            if (filters) {
                filters = decodeURI(filters.split('$filter=')[1]);
            }
            let payloadData = {
                "URL": filters,
                "TO_GHSITE": massUpdateValues[0],
                "TO_PROGRAM": massUpdateValues[1],
                "TO_BUSINESS_GRP": massUpdateValues[2],
                "FLEX_KITS": massUpdateValues[3],
                "QTY": (massUpdateValues[4]) ? parseInt(massUpdateValues[4]) : 0,
                "TRANSFER_FLAG": massUpdateValues[5],
                "COMMENT": massUpdateValues[6],
                "Action": "Save"
            };
            let payloadDataA = JSON.stringify(payloadData);

            let oDataUrl = this.getSaveAjaxUrl();
            $.ajax({
                url: oDataUrl,
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: payloadDataA,
                headers: {
                    "appid": that.getOwnerComponent().getModel("device").getProperty("/appid")
                },
                success: function (data) {
                    that.getView().setBusy(false);
                    that.handleUploadStatus(data);
                },
                error: function (oError) {
                    that.getView().setBusy(false);
                    that.handleUploadStatus(oError);
                }
            });
        },

            massStatusChange: function(status){
                let isDataChanged = oDataResp.checkTbleDataChanged(this);
                if(isDataChanged && (status === "Approve" || status === "Reject")){
                    MessageBox.error(`Please Save the data before ${status}ing the records`,{
                        title: "Validation Error"
                    });
                    return;
                }
                let that = this,oDataUrl;
                this.getView().setBusy(true);
                let filters = this.getView().byId("rfidunscannabletable").getTable().getBinding("rows").sFilterParams;
                if (filters) {
                    filters = decodeURI(filters.split('$filter=')[1]);
                }
                let payloadData = {
                    "URL": filters,
                    "Action": status
                };
                let payloadDataA = JSON.stringify(payloadData);
                if(status === "DELETE"){
                    oDataUrl = this.getSplitDeleteAjaxUrl();    
                }else{
                   oDataUrl = this.getSaveAjaxUrl();
                }
                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadDataA,
                    headers: {
                        "appid": that.getOwnerComponent().getModel("device").getProperty("/appid")
                    },
                    success: function (data) {
                        that.getView().setBusy(false);
                        if(status === "DELETE" && !data.d.msg){
                        MessageBox.success("Deleted Successfully");
                        }else{
                        that.handleUploadStatus(data);
                        }
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.handleUploadStatus(oError);
                    }
                });
            },

            applyErrorLog: function (oEvent) {
                oDataResp.applyErrorLog(oEvent,this);

            },

            onDelete: function(oEvent){
                let delArr = [];
                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getTable().getSelectedIndices();
                if(selectedRows && selectedRows.length === 0){
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }else if(selectedRows.length > 5000){
                    MessageBox.error("Delete is allowed for 5000 records");
                    return;
                }
                let allRecordsLoaded = true;
                let changedPath = [];
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    if(smartTable.getTable().getContextByIndex(index)){
                    let rowContext = smartTable.getTable().getContextByIndex(index);
                    changedPath.push(rowContext.getPath());
                        let delRow = {},obj={};
                        delRow = rowContext.getProperty(rowContext.sPath);
                        obj.GH_SITE         = delRow.GH_SITE;      
                        obj.CM              = delRow.CM      
                        obj.SITE            = delRow.SITE      
                        obj.PROGRAM            = delRow.PROGRAM       
                        obj.FROM_BUSINESS_GRP = delRow.FROM_BUSINESS_GRP
                        obj.Line_Type       =   delRow.Line_Type
                        obj.Uph             = delRow.Uph 
                        obj.SEQUENCE_NO     = delRow.SEQUENCE_NO
                        obj.PROJECTED_QTY   = delRow.PROJECTED_QTY  
                        obj.AQID            = delRow.AQID 
                        obj.TO_GHSITE       = delRow.TO_GHSITE        
                        obj.TO_CM           = delRow.TO_CM  
                        obj.TO_SITE         = delRow.TO_SITE  
                        obj.TO_PROGRAM      = delRow.TO_PROGRAM;
                        obj.NPI_INDICATOR   = delRow.NPI_INDICATOR;
                        delArr.push(obj);
                }
                    else {

                        allRecordsLoaded = false;
                        break;
                        // Perform getting all the filters and calling new entity
                    }
                }

                
                if(allRecordsLoaded && !this.selectAll){
                this.splitDelete("DELETE",delArr,changedPath);
                }else if(!allRecordsLoaded && !this.selectAll){
                    MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                    return;
                }else{
                    this.massStatusChange("DELETE");
                }
            },

            getSplitDeleteAjaxUrl: function(){
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/rfid-unscannable-service/Unscannable_Split";
                }else{
                    oDataUrl = "/coa-api-ext/v1/ext/coa/rfid-unscannable-service/Unscannable_Split";    
                }
                return oDataUrl;
            },

            splitDelete: function(action, Arr,changedPath){
                let that = this;
                let payloadData = {
                    SplitData : Arr,
                    Action: action
                }; 

                let payloadDataA = JSON.stringify(payloadData);
                let oDataUrl = this.getSplitDeleteAjaxUrl();

                this.firstrow = that._oSmartTable.getTable().getFirstVisibleRow()

                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadDataA,
                    headers: {
                        "appid": that.getOwnerComponent().getModel("device").getProperty("/appid")
                    },
                    success: function (data) {
                        oDataResp.splitDeleteSuccess(data,action,changedPath,that);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.raiseBackendException(oError);
                    }
                });
            },

            onSplit: function(oEvent){
                let splitRow = this.getView().getModel().getProperty(oEvent.getSource().getBindingContext().getPath());
                let obj = {};
                obj.GH_SITE         = splitRow.GH_SITE;      
                obj.CM              = splitRow.CM      
                obj.SITE            = splitRow.SITE      
                obj.PROGRAM            = splitRow.PROGRAM       
                obj.FROM_BUSINESS_GRP = splitRow.FROM_BUSINESS_GRP
                obj.SEQUENCE_NO     = splitRow.SEQUENCE_NO
                obj.PROJECTED_QTY   = splitRow.PROJECTED_QTY  
                obj.AQID            = splitRow.AQID 
                obj.TO_GHSITE       = splitRow.TO_GHSITE        
                obj.TO_CM           = splitRow.TO_CM  
                obj.TO_SITE         = splitRow.TO_SITE  
                obj.TO_PROGRAM      = splitRow.TO_PROGRAM;    
                let splitRowArr     = [obj];
                obj.SEQUENCE_NO = null;
                obj.NPI_INDICATOR = splitRow.NPI_INDICATOR;
                splitRowArr.push(obj);
                this.splitDelete("SPLIT",splitRowArr); 
            },

            showChangeLog: function () {
                let oView = this.getView();

                if (!this._diaChangeLog) {
                    this._diaChangeLog = Fragment.load({ id: oView.getId(), name: "com.apple.coa.rfidunscannableui.Fragments.ChangeLog", controller: this }).then(function (oDialog) {
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

            applyTableLogFilter: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new Filter({
                    filters: [new Filter("Table", "EQ", "T_COA_RFID_UNSCANNABLE_TT")]
                }));
            },
            tableSelChange: function (oEvent) {
                this.selectAll = oEvent.getParameter("selectAll");
            },
            onSFBInitialise: function (oEvent) {
                oEvent.getSource()._oSearchButton.setText("Search");
                this.setNullableToFilterFields(oEvent);
            },

            setNullableToFilterFields: function (oEvent) {
                let fields = oEvent.getSource()._aFields;
                if (fields && fields.length !== 0) {
                    fields.forEach(function (oItem) {
                        oItem.nullable = true;
                    });
                }
            },
            onSFBSearch: function (oEvent) {
                this.refreshAndSetTabletoDisplay();
            },
            fillFilterArray: function(names,selIndices,aFilters){
                let j;
                
                    for(j = 0; j < names.length; j++){
                        let value = this._oSmartTable.getTable().getContextByIndex(selIndices).getProperty(names[j]);
                        aFilters.push(new Filter(names[j], FilterOperator.EQ, value));
                    }
                
                return aFilters;
            },

            fillFiltersforExport: function (aFilters) {
                let allRecordsLoaded = true,sFilterInUrl;
                try{
                    this.getView().setBusy(true);
                    let i;
                for ( i = 0; i < this._oSmartTable.getTable().getSelectedIndices().length; i++) {
                    let selIndices = this._oSmartTable.getTable().getSelectedIndices()[i];
                    if(this._oSmartTable.getTable().getContextByIndex(selIndices)){

                    let names = ["GH_SITE", "CM", "SITE", "PROGRAM", "FROM_BUSINESS_GRP", "AQID", "SEQUENCE_NO","NPI_INDICATOR"];


                    
                        aFilters = this.fillFilterArray(names,selIndices,aFilters);
                    
                } else{
                    allRecordsLoaded = false;
                    break;
                }


                }
                this.getView().setBusy(false);
            } catch(e){
                this.getView().setBusy(false);
            }
                if(allRecordsLoaded){
                     sFilterInUrl = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, this.getOwnerComponent().getModel("MainModel").oMetadata, this.getOwnerComponent().getModel("MainModel").oMetadata._getEntityTypeByPath("/Carryover_rfid_unscannable"));
                } else{
                    sFilterInUrl = this.getView().byId("rfidunscannabletable").getTable().getBinding("rows").sFilterParams;
                }
                return sFilterInUrl;
            },

            onBeforeExportRFIDUS: function (oEvent) {
                let aFilters = [];
                oEvent.getParameter("exportSettings").dataSource.sizeLimit = 3000;
                if (this._oSmartTable.getTable().getSelectedIndices().length !== 0 && this._oSmartTable.getTable().getSelectedIndices().length !== oEvent.getSource().getTable().getBinding("rows").getLength()) {
                    let sFilterInUrl = this.fillFiltersforExport(aFilters);
                    sFilterInUrl = "&" + sFilterInUrl;
                    let serviceUri = this.getOwnerComponent().getModel("MainModel").sServiceUrl;
                    let sPath = serviceUri + "/Carryover_rfid_unscannable?$format=json" + sFilterInUrl;
                    oEvent.getParameter("exportSettings").dataSource.count = this._oSmartTable.getTable().getSelectedIndices().length;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = sPath;
                }

                oDataResp.setLimitonDownload(oEvent,this);


                this.setDateTimeDuringExport(oEvent);
            },

            setDateTimeDuringExport: function (oEvent) {
                let i;
                let columns = oEvent.getParameter("exportSettings").workbook.columns
                for (i = 0; i < columns.length; i++) {
                    if (columns[i].property === "CREATEDAT" || columns[i].property === "MODIFIEDAT" || columns[i].property === "REVIEW_DATE") {
                        columns[i].type = "Date";
                        columns[i].utc = false;                  
                    }
                }
            },
            fnOutput_frag_CloseLog: function (oEvent) {
                this.getView().getModel("UnscannableModel").setProperty("/UnscannableUploadStatus", []);
                this._RecordLogsPopover.close();

            },
            onSyncRFIDProjection: function(oEvent){
                MessageBox.warning("This action will overwrite the previous projection, there could be potential change in the projection", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if(sAction === "OK"){
                            this.openSyncUnScannables();
                        }
                    }.bind(this)
                });
                
            },
           
            openSyncUnScannables: function(oEvent){
                this.getView().getModel("UnscannableModel").setProperty("/selGHSite",[]);
                this.getView().getModel("UnscannableModel").setProperty("/syncAll",false); 
                if(!this._oSyncCoreDialog ){
                Fragment.load({
                    name: "com.apple.coa.rfidunscannableui.Fragments.SyncUnScanable",
                    controller: this
                }).then(function name(oFragment) {
                    this._oSyncCoreDialog = oFragment;
                    this._oSyncCoreDialog.setModel(this.getView().getModel("UnscannableModel"),"UnscannableModel");
                    this.getView().addDependent(this._oSyncCoreDialog);
                    this._oSyncCoreDialog.open();
                    
                }.bind(this));
            } else{
                this._oSyncCoreDialog.open();
            }
            
            },
            onSyncDialofClose: function (oEvent) {
                this.getView().getModel("UnscannableModel").setProperty("/selGHSite",[]);
                this.getView().getModel("UnscannableModel").setProperty("/syncAll",false); 
                this.onSyncGHSDialogClse();
            },
            onSyncGHSDialogClse: function () {
                this._oSyncCoreDialog.close();
            },

            getGenerateUnscannableURL: function(){
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/rfid-unscannable-service/Generate_Unscannable";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/rfid-unscannable-service/Generate_Unscannable";
                }
                return oDataUrl;
            },
            onSyncAccept: function(oEvent){
                let that = this;
                let selectedGHSite = this.getView().getModel("UnscannableModel").getProperty("/selGHSite");
                let syncAll = (this.getView().getModel("UnscannableModel").getProperty("/syncAll")) ? "X": "";

                
                if((!selectedGHSite || selectedGHSite.length === 0) && !syncAll){
                    MessageBox.error("Select Atleast one GH Site to Proceed");
                    return;
                }
            
                selectedGHSite = (selectedGHSite && selectedGHSite.length !==0) ? selectedGHSite : [];

                let oDataUrl = that.getGenerateUnscannableURL();
                let syncLoad = {
                    GH_SITE: selectedGHSite,
                    syncall: syncAll
                }
                let payloadData = {
                    request: syncLoad
                };
                let payloadDataA = JSON.stringify(payloadData);
                that.getView().setBusy(true);
                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadDataA,
                    headers: {
                        "appid": that.getOwnerComponent().getModel("device").getProperty("/appid")
                    },
                    success: function (data) {
                        oDataResp.syncGenerateSuccess(data,that);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.raiseBackendException(oError,that);
                    }
                });
            },

            onChangeTQSmartble: function (oEvent) {
                oDataResp.onChangeTQSmartble(oEvent,this);
                
            },
            getGhSiteDDSync: function(oEvent,isFragmentOpen,Field){
                oDataResp.getGhSiteDD(oEvent,isFragmentOpen,Field,this);
            },
            openErrorFragment: function(err, resp,that){
                if(!that._RecordLogsPopover){
                    Fragment.load({ name: "com.apple.coa.rfidunscannableui.Fragments.UploadLogs", controller: that }).then(function name(oFragment) {
                        that._RecordLogsPopover = oFragment;
                        that.getView().addDependent(that._RecordLogsPopover);
                        that._RecordLogsPopover.open();
                    }.bind(this));
                    }else{
                        that._RecordLogsPopover.open();
                    }
            }
        });
    });
