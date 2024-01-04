sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet",
    "../utils/oDataResp"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageBox, Filter, FilterOperator, Spreadsheet, oDataResp) {
        "use strict";

        return Controller.extend("coa.rfidonhand.controller.Main", {
            onInit: function () {
                this.oDataModel = this.getOwnerComponent().getModel("MainModel");
                this.getView().setModel(this.oDataModel);
                this._oSmartTable = this.getView().byId("rfidonhandtable");
                this._oSmartFilterBar = this.getView().byId("smartFilterBar");

                this.setJSONModelToView();
                this.changedArray = [];


                if (!this.getOwnerComponent().getModel("authModel").getProperty("/display")) {
                    this.getOwnerComponent().getRouter().getTargets().display("TargetNoAuth");
                }

                this.appODataChangeLogModel = this.getOwnerComponent().getModel("ChangeLogModel");
                this.getView().setModel(this.appODataChangeLogModel, "changeLogModel");

                this.changedArray = [];
                this.changedPath = [];


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

            setJSONModelToView: function () {
                let jModel = new sap.ui.model.json.JSONModel();
                this.getView().setModel(jModel, "RfidModel");
                this.getView().getModel("RfidModel").setSizeLimit(10000);
                this.getView().getModel("RfidModel").setProperty("/statusEdit", false);
            },


            onPressUpload: function (oEvent) {
                if (this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length === 0) {
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

            openMassUploadFragment: function () {
                let selRowCnt = this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass update more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }
                Fragment.load({ name: "coa.rfidonhand.Fragments.MassUpdate", controller: this }).then(function name(oFragment) {
                    this._oDialogFileUpload = oFragment;
                    this.getView().addDependent(this._oDialogFileUpload);
                    this._oDialogFileUpload.open();
                }.bind(this));
            },
            onMassUpdateAccept: function (oEvent) {
                this.massUpdateAction = "";
                let transferflag = sap.ui.getCore().byId("inpTransfer_Flag").getValue();
                if(transferflag !== "Y" && transferflag !== "N" && transferflag !== "" && transferflag !== null && transferflag !== " "){
                    sap.m.MessageBox.error("Transfer Flag must be Y or N or blank");
                    return;
                }
                if (oEvent) {
                    this.massUpdateAction = oEvent.getParameter("id");
                }
                this.onCloseDialog();
            },
            updateUi: function () {
                this._oSmartTable.setBusy(true);
                this.onMassUpdate();
                this._oSmartTable.setBusy(false);
            },
            validateMandatoryFields: function(){
                if(!this.massUpdateValues[0] && !this.massUpdateValues[1] && !this.massUpdateValues[2] && !this.massUpdateValues[3] && !this.massUpdateValues[4]){
                    sap.m.MessageToast.show("No Changes made");
                    return false;
                }else{
                    return true;
                }
            },
            onMassUpdate: function () {
                let that = this;
                this.changedArray=[];
                this.changedPath=[];
                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                let isValid = this.validateMandatoryFields();
                if(!isValid){
                    return;
                }
                oDataResp.updateSelectAllFlag(that);
                selectedRows = smartTable.getTable().getSelectedIndices();
                let allRecordsLoaded = true;
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    let rowContext = smartTable.getTable().getContextByIndex(index);

                    if (rowContext && !this.selectAll) {

                        let obj = {};
                           obj = JSON.parse(JSON.stringify(rowContext.getProperty(rowContext.sPath)));
                           obj.To_GHSite = this.massUpdateValues[0];
                           obj.To_Program = this.massUpdateValues[1];
                           obj.Tp_Business_Grp = this.massUpdateValues[2];
                           obj.Transfer_Flag = this.massUpdateValues[3];
                           obj.Comments = this.massUpdateValues[4];
                           this.changedArray.push(obj);
                           this.changedPath.push(rowContext.sPath);
                        
                    }
                    else {

                        allRecordsLoaded = false;
                        break;
                        // Perform getting all the filters and calling new entity
                    }
                }

                if (allRecordsLoaded && !this.selectAll) {
                    this.onTableDataSave(null,null,null,true,false);
                } else if(!allRecordsLoaded && !this.selectAll){
                    MessageBox.information("Not all the records are loaded on UI.Please scroll down to load all the records");
                    return;
                } else {
                    this.getView().setBusy(true);
                    let filters = this.getView().byId("rfidonhandtable").getTable().getBinding("rows").sFilterParams;
                    if (filters) {
                        filters = decodeURI(filters.split('$filter=')[1]);
                    }
                    let payloadData = {
                        "url": filters,
                        "To_GH_Site": this.massUpdateValues[0],
                        "To_Program": this.massUpdateValues[1],
                        "To_Business_Grp": this.massUpdateValues[2],
                        "Transfer_Flag": this.massUpdateValues[3],
                        "Comment": this.massUpdateValues[4],
                        "Approval_Status": "Pending"
                    };
                    let payloadDataA = JSON.stringify(payloadData);

                    let oDataUrl = this.getSelectAllAjaxUrl();
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
                            oDataResp.massUpdateSuccess(data,that);
                        },
                        error: function (oError) {
                            that.changedArray = [];
                            that.changedPath = [];
                            that.getView().setBusy(false);
                            that.handleUploadStatus(oError);
                        }
                    });
                }
            },

            getSelectAllAjaxUrl: function(){
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/rfid-services/rfid-tt/selectAllMassUpdate";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/rfid-services/rfid-tt/selectAllMassUpdate";
                }
                return oDataUrl;
            },



            onCloseDialog: function (oEvent) {
                this._oDialogFileUpload.close();
            },
            onAfterDilogClose: function (oEvent) {
                if (!this.getOwnerComponent().getModel("device").getProperty("/isMockServer")) {
                    this.massUpdateAction = oEvent.getParameter("origin").getId();
                }
                else if (this.getOwnerComponent().getModel("device").getProperty("/isMockServer")) {
                    this.massUpdateAction = "btnOK";
                }
                if (this.massUpdateAction === "btnOK") {
                    this.inputFields = sap.ui.getCore().byId("smartUpdateForm").getGroups()[0].getAggregation("formElements");
                    this.massUpdateValues = [];
                    this.inputFields.forEach(function (oItem) {
                        this.massUpdateValues.push(oItem.getFields()[0].getValue().toString().trim());
                    }.bind(this));
                }
                this._oDialogFileUpload.destroy();
                if (this.massUpdateAction === "btnOK") {
                    this.updateUi();
                }
            },
            validateCommentsOnSave: function (oEvent, ApprovalStatus, isCancel, isMassUpdateorStatusChg,isAppRejCan) {
                let i;
                if(isAppRejCan){
                for (i = 0; i < this._oSmartTable.getTable().getSelectedIndices().length; i++) {
                    let selIndices = this._oSmartTable.getTable().getSelectedIndices()[i];
                    if (this._oSmartTable.getTable().getContextByIndex(selIndices)) {
                        let comment = this._oSmartTable.getTable().getContextByIndex(selIndices).getProperty("Comments");

                        if (!comment) {
                            let errorExits = true;
                            return errorExits;
                        }
                    }
                }
            }else{
                return false;
            }

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

            populatePendingChanges: function (oModel) {
                let pendingChanges = oModel.getPendingChanges();
                if(pendingChanges){
                    let entries = Object.entries(pendingChanges);
                    let pendingArray = entries;

                return pendingArray;
            }
            },

            getSaveAjaxUrl: function(){
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/rfid-services/rfid-tt/rfid_tt_action";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/rfid-services/rfid-tt/rfid_tt_action";
                }
                return oDataUrl;
            },

            onTableDataSave: function (oEvent, ApprovalStatus, isCancel, isMassUpdateorStatusChg,isAppRejCan) {
                let that = this;
                let oModel = this.getOwnerComponent().getModel("MainModel");
                if (!oModel.hasPendingChanges() && !isMassUpdateorStatusChg) {
                    sap.m.MessageToast.show("No Changes are made.Save not required");
                    return;
                }

                let errorExits = this.validateCommentsOnSave(oEvent, ApprovalStatus, isCancel, isMassUpdateorStatusChg,isAppRejCan);

                if(errorExits){
                    MessageBox.show("Enter Comments for Changed record", {
                        title: "Validation Error",
                        icon: "ERROR",
                        actions: ["OK"],
                        styleClass: "sapUiSizeCompact"
                    });
                    return;
                }

                
                this.getView().setBusy(true);
                if(!isAppRejCan){
                    let pendingArray = this.populatePendingChanges(oModel);
                    this.fillChangedRowWithTrim(pendingArray);

                }
              

                let dataArr = [];

                this.changedArray.forEach(function (oItem) {
                    let obj = {};
                    obj.RFID_Timestamp = oItem.TIMESTAMP
                    obj.Asset_Id = oItem.ALDERAN;
                    obj.RFID = oItem.RFID;
                    obj.AQID = oItem.AQID;
                    obj.Raw_AQID = oItem.Raw_Aqid;
                    obj.Mapped_AQID = oItem.Mapped_Aqid;
                    obj.Short_Name = oItem.Short_Name;
                    obj.Serial_Number = oItem.SERNR;
                    obj.EQ_Name = oItem.Equipment_Name;
                    obj.CarryOverOldProgram = oItem.CarryOverOldProgram;
                    obj.MFR = oItem.MFR;
                    obj.Asset_Own = oItem.ASSETOWN;
                    obj.CM = oItem.CM;
                    obj.Site = oItem.SITE;
                    obj.CM_Program = oItem.ZALDR_CMPROGRAM;
                    obj.Asset_Status = oItem.STATUS;
                    obj.Timestamp_3DV = oItem.createdAt;
                    obj.Line_ID = oItem.LineId;
                    obj.Override_lineId = oItem.OVERRIDE_LINEID;
                    obj.Line_Type = oItem.LineType;
                    obj.UPH = oItem.Uph;
                    obj.Version = oItem.Version_Id;
                    obj.To_GHSite = that.fillTranferFields(oItem.To_GHSite, isCancel);
                    obj.Transfer_Flag = that.fillTranferFields(oItem.Transfer_Flag, isCancel);
                    obj.To_CM = that.fillTranferFields(oItem.To_CM, isCancel);
                    obj.To_Site = that.fillTranferFields(oItem.To_Site, isCancel);
                    obj.To_Program = that.fillTranferFields(oItem.To_Program, isCancel);
                    obj.To_Business_Grp = that.fillTranferFields(oItem.Tp_Business_Grp, isCancel);
                    obj.Comments = that.fillTranferComments(oItem.Comments, isCancel);
                    obj.CarryOverAqid = oItem.CarryOverAqid;
                    obj.CarryOverEqName = oItem.CarryOverEqName;
                    obj.Approval_Status = that.getApprovalStatus(ApprovalStatus, oItem, isCancel);
                    if (oItem.Submit_Dte) {
                        obj.Submit_Date = oItem.Submit_Dte;
                    }
                    if (oItem.Submit_By) {
                        obj.Submit_By = oItem.Submit_By;
                    }
                    if (ApprovalStatus) {
                        obj.Review_Date = new Date();
                        obj.Reviewed_By = oItem.Reviewed_By;
                    } else {
                        obj.Submit_Date = new Date();
                        obj.Submit_By = oItem.Reviewed_By;
                    }
                    dataArr.push(obj);
                });

                let la = {
                    "RfidData": dataArr
                };
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
                        oDataResp.SaveSuccess(isCancel,that);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.commonSaveError(oError,isMassUpdateorStatusChg,that);
                        that.changedArray = [];
                        that.changedPath = [];
                    }
                });
            },

            commonSaveSuccess: function(isCancel,that){
            if(!that.getOwnerComponent().getModel("device").getProperty("/isMockServer")){
                that.refreshAndSetTabletoDisplay();
                }
                if (isCancel) {
                    MessageBox.success("Records Cancelled Successfully");
                }
                else {
                    MessageBox.success("Data Saved Successfully");
                }
            },

            commonSaveError: function(oError,isMassUpdateorStatusChg,that){
                if(isMassUpdateorStatusChg){
                    that.handleUploadStatus(oError);
                } else {
                    oDataResp.raiseCustomErrorOnSave(oError,that);
                }
            },

            fillTranferComments: function (comment, isCancel) {
                if (isCancel) {
                    comment = "Transfer Cancelled";
                }
                return comment;
            },

            handleUploadStatus: function (response) {
                try {
                    let responseArray = JSON.parse(response.responseJSON.error.message.value);
                    oDataResp.filterErrorRecordsBindTable(responseArray,this);

                    Fragment.load({ name: "coa.rfidonhand.Fragments.UploadLogs", controller: this }).then(function name(oFragment) {
                        this._RecordLogsPopover = oFragment;
                        this.getView().addDependent(this._RecordLogsPopover);
                        this._RecordLogsPopover.open();
                    }.bind(this));
                } catch (error) {
                    this.raiseBackendException(response);
                }
            },

            fillTranferFields: function (value, isCancel) {
                if (isCancel) {
                    value = "";
                }
                return value;
            },

            getApprovalStatus: function (ApprovalStatus, oItem, isCancel) {
                if (isCancel) {
                    return "";
                } else if (ApprovalStatus) {
                    return ApprovalStatus;
                } else {
                    return "Pending";
                }
            },

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
                MessageBox.error("Unexpected System Error. Please Contact Technical Support",{
                    title: "System Error"+ ' - ' + message,
                    details: message
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
                MessageBox.error("Unexpected System Error. Please Contact Technical Support",{
                    title: "System Error"+ ' - ' + message,
                    details: message
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

            onCOSmartTbleApprove: function () {
                this.changedArray=[];
                this.changedPath=[];
                if (this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }
                let selRowCnt = this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass approve more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }
                oDataResp.updateSelectAllFlag(this);
                // check if any one of the records has approved status
                let index, i,allRecordsLoaded = true;
                let selectedRows = this._oSmartTable.getTable().getSelectedIndices();
                for (i = 0; i < selectedRows.length; i++) {
                    index = selectedRows[i];
                    if(this._oSmartTable.getTable().getContextByIndex(index)){
                        let currentStatus = this._oSmartTable.getTable().getContextByIndex(index).getProperty("Approval_Status");
                    if (currentStatus) {
                        currentStatus = currentStatus.toLowerCase();
                        if (currentStatus === "approved") {
                            sap.m.MessageToast.show("One or More records have Approved Status Already.Please Check");
                            return;
                        } else if(currentStatus === "rejected"){
                            sap.m.MessageToast.show("One or More records have Rejected status. Please save the record to approve");
                            return;
                        }
                    } else {
                        sap.m.MessageToast.show("Approve can happen only from pending.Save the record and approve");
                        return;
                    }
                }else {
                    allRecordsLoaded = false;
                    break;
                }

                }

                this.updateTableModelStatus("Approval_Status", "Approved");
                this.approveRecords(allRecordsLoaded);
                
            },

            approveRecords: function(allRecordsLoaded){
                if (allRecordsLoaded && !this.selectAll) {
                    this.onTableDataSave(undefined, "Approved", false, true,true);
                } else if(!allRecordsLoaded && !this.selectAll){
                    MessageBox.information("Not all the records are loaded on UI.Please scroll down to load all the records");
                    return;
                }
                else {
                    oDataResp.massStatusChange("Approved",this);
                }
            },

            
            updateTableModelStatus: function (key, value) {
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
                        obj.Approval_Status = value;
                       this.changedArray.push(obj);
                        this.changedPath.push(rowContext.sPath);
                    }
                    else {

                        allRecordsLoaded = false;
                        break;
                        // Perform getting all the filters and calling new entity
                    }
                }

                return allRecordsLoaded;
            },

            onCOSmartTbleReject: function () {
                this.changedArray=[];
                this.changedPath=[];
                if (this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }

                let selRowCnt = this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass reject more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }
                oDataResp.updateSelectAllFlag(this);
                // check if any one of the records has rejected status
                let index, i,allRecordsLoaded = true;
                let selectedRows = this._oSmartTable.getTable().getSelectedIndices();
                for (i = 0; i < selectedRows.length; i++) {
                    index = selectedRows[i];
                    if(this._oSmartTable.getTable().getContextByIndex(index)){
                        let currentStatus = this._oSmartTable.getTable().getContextByIndex(index).getProperty("Approval_Status");
                    if (currentStatus) {
                        currentStatus = currentStatus.toLowerCase();
                        if (currentStatus === "rejected" ) {
                            sap.m.MessageToast.show("One or More records have Rejected Status.Please Check");
                            return;
                        }
                        else if (currentStatus === "approved") {
                            sap.m.MessageToast.show("Cannot Reject Approved Records");
                            return;
                        }
                    } else{
                        sap.m.MessageToast.show("One or More records have Blank Status.Please Check");
                            return;

                    }
                }else {
                    allRecordsLoaded = false;
                    break;
                }
                }

                 this.updateTableModelStatus("Approval_Status", "Rejected");
                 this.rejectRecords(allRecordsLoaded);
            },

            rejectRecords: function(allRecordsLoaded){
                if (allRecordsLoaded && !this.selectAll) {
                    this.onTableDataSave(undefined, "Rejected", false, true,true);
                } else if(!allRecordsLoaded && !this.selectAll){
                    MessageBox.information("Not all the records are loaded on UI.Please scroll down to load all the records");
                    return;
                }
                else {
                    oDataResp.massStatusChange("Rejected",this);
                }
            },
            onDataReceived: function (oEvent) {
                let table = oEvent.getSource().getTable();
                let columns = table.getColumns();
                for (let i = 0; i < columns.length; i++) {
                    columns[i].setWidth("14rem");
                    if (columns[i].data("p13nData").columnKey === "Approval_Status") {
                        columns[i].getTemplate().bindProperty("editable", "RfidModel>/statusEdit");
                    }
                    if (columns[i].data("p13nData").columnKey === "ErrorMsg") {
                        columns[i].setWidth("45rem");
                    }
                }

                this.setNullabeForSmartTableFields(columns);

            },

            setNullabeForSmartTableFields: function (columns) {
                columns.forEach(function (oItem) {
                    oItem.getAggregation("customData")[0].getProperty("value").nullable = true;
                });
            },

            onRFIDSTInitialise: function (oEvent) {
                let table = oEvent.getSource().getTable();
                let columns = table.getColumns();
                let i;
                for (i = 0; i < columns.length; i++) {
                    columns[i].setWidth("14rem");
                    if (columns[i].data("p13nData").columnKey === "ErrorMsg") {
                        columns[i].setWidth("45rem");
                    }
                }
                oEvent.getSource()._oEditButton.bindProperty("enabled", "authModel>/modifiy");
            },

            fillFilterArray: function(rfidProArr,names,selIndices,aFilters){
                let j;
                for ( j = 0; j < rfidProArr.length; j++) {
                    if (names.includes(rfidProArr[j].name)) {
                        let value = this._oSmartTable.getTable().getContextByIndex(selIndices).getProperty(rfidProArr[j].name);
                        aFilters.push(new Filter(rfidProArr[j].name, FilterOperator.EQ, value));
                    }
                }
                return aFilters;
            },

            fillFiltersforExport: function (aFilters) {
                let allRecordsLoaded = true,sFilterInUrl,i;
                try{
                    this.getView().setBusy(true);
                for ( i = 0; i < this._oSmartTable.getTable().getSelectedIndices().length; i++) {
                    
                    let selIndices = this._oSmartTable.getTable().getSelectedIndices()[i];
                    if(this._oSmartTable.getTable().getContextByIndex(selIndices)){
                        let entityTypesArr = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType;
                        let rfidEntity = entityTypesArr.filter(data => data.name === "RFIDDetails");
                        let rfidProArr = rfidEntity[0].property;
                        let names = ["AQID", "CM", "SITE", "ZALDR_CMPROGRAM", "RFID", "LineId", "Uph"];


                    if (rfidProArr && rfidProArr.length !== 0) {
                         aFilters = this.fillFilterArray(rfidProArr,names,selIndices,aFilters);

                    }
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
                    sFilterInUrl = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, this.getOwnerComponent().getModel("MainModel").oMetadata, this.getOwnerComponent().getModel("MainModel").oMetadata._getEntityTypeByPath("/RFIDDetails"));
               } else{
                   sFilterInUrl = this.getView().byId("rfidonhandtable").getTable().getBinding("rows").sFilterParams;
               }
               return sFilterInUrl;
            },

            onBeforeExportRFID: function (oEvent) {
                let aFilters = [];

                oEvent.getParameter("exportSettings").dataSource.sizeLimit = 3000;
                if (this._oSmartTable.getTable().getSelectedIndices().length !== 0 &&
                    this._oSmartTable.getTable().getSelectedIndices().length !== oEvent.getSource().getTable().getBinding("rows").getLength()
                    && this._oSmartTable.getTable().getSelectedIndices().length <= 200000) {

                    let sFilterInUrl = this.fillFiltersforExport(aFilters);
                    sFilterInUrl = "&" + sFilterInUrl;

                    let serviceUri = this.getOwnerComponent().getModel("MainModel").sServiceUrl;
                    let sPath = serviceUri + "/RFIDDetails?$format=json" + sFilterInUrl;
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
                    if (columns[i].property === "createdAt" || columns[i].property === "modifiedAt") {
                        columns[i].type = "DateTime";
                        columns[i].utc = false;
                    } 
                }
            },

            showChangeLog: function () {
                let oView = this.getView();

                if (!this._diaChangeLog) {
                    this._diaChangeLog = Fragment.load({
                        id: oView.getId(),
                        name: "coa.rfidonhand.Fragments.ChangeLog",
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

            applyTableLogFilter: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new Filter({
                    filters: [
                        new Filter("Table", "EQ", "T_COA_RFID_TT")
                    ]
                }));

                oDataResp.replaceChangeLogFields(oBindingParams);

            },
            onSFBSearch: function (oEvent) {
                this.refreshAndSetTabletoDisplay();
            },

            onTableRefresh: function (oEvent) {
                let aFilters = this.getView().byId("smartFilterBar").getFilters();
                if(aFilters && aFilters.length !== 0){
                    this.refreshAndSetTabletoDisplay();
                    this.getView().byId("rfidonhandtable").applyVariant({});
                }else{
                    sap.m.MessageToast.show("Provide Mandatory Fields in selection");
                }
            },

            refreshAndSetTabletoDisplay: function () {
                this.getView().getModel().resetChanges();
                if (this.getView().byId("rfidonhandtable").getModel("sm4rtM0d3l").getProperty("/editable")) {
                    this.getView().byId("rfidonhandtable")._oEditButton.firePress();
                    this.getView().byId("rfidonhandtable").getModel("sm4rtM0d3l").setProperty("/editable", false);
                }
                this.getView().byId("rfidonhandtable").rebindTable();
            },

            toCapital: function (oEvent) {
                oEvent.getSource().setValue(oEvent.getSource().getValue().toUpperCase());
            },

            formatDate: function (value) {
                if (value) {
                    let date = new Date(value);
                    let oOutFormat1 = sap.ui.core.format.DateFormat.getDateTimeInstance({
                        pattern: "MMM d y HH:mm:ss"
                    });
                    date = oOutFormat1.format(date);
                    return date;
                } else {
                    return value;
                }
            },

            historyTabInit: function (oEvent) {
                let oTable = oEvent.getSource().getTable();
                let aColumns = oTable.getColumns();
                let that = this;

                oDataResp.setFormatterModifiedAt(aColumns,oTable,that);
            },
            beforeExportChangeLog: function (oEvent) {
                this.setDateTimeDuringExport(oEvent);
            },
            onEditToggle: function (oEvent) {
                let edit = oEvent.getSource().getModel("sm4rtM0d3l").getProperty("/editable");
                if (edit) {
                    this.getView().byId("rfidonhandtable").addStyleClass("zMultiSelectEdit");
                    this.getView().byId("rfidonhandtable").addStyleClass("zTableTrEdit");
                    this.getView().byId("rfidonhandtable").removeStyleClass("zMultiSelectDisplay");
                    this.getView().byId("rfidonhandtable").removeStyleClass("zTableTrDisplay");

                } else {
                    this.getView().byId("rfidonhandtable").addStyleClass("zMultiSelectDisplay");
                    this.getView().byId("rfidonhandtable").addStyleClass("zTableTrDisplay");
                    this.getView().byId("rfidonhandtable").removeStyleClass("zMultiSelectEdit");
                    this.getView().byId("rfidonhandtable").removeStyleClass("zTableTrEdit");
                }

            },

            onCOSmartTbleCancelReq: function (oEvent) {
                if (this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }

                let selRowCnt = this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length;
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
                            let oModel = this.getOwnerComponent().getModel("MainModel");
                            let allRecordsLoaded = true;
                            let smartTable = this._oSmartTable;
                            let selectedRows = [];
                            selectedRows = smartTable.getTable().getSelectedIndices();

                            let oError = this.validateBeforeCancel(oModel,selectedRows)
                            if(oError){
                                MessageBox.error("Cannot Cancel.One or more records have Status Blank");
                                return;
                                }                            

                                
                           allRecordsLoaded = this.setCancelData(oModel,selectedRows);

                            if(allRecordsLoaded && !this.selectAll){
                                this.onTableDataSave(undefined, null, true, true,false);
                            } else if(!allRecordsLoaded && !this.selectAll){
                               MessageBox.information("Not all the records are loaded on UI.Please scroll down to load all the records");
                               return;
                            }else{
                                oDataResp.massStatusChange("Clear",this);
                            }
                        }
                    }.bind(this)
                });
            },


            setCancelData: function(oModel,selectedRows){
                let i,allRecordsLoaded = true;
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    let rowContext = this._oSmartTable.getTable().getContextByIndex(index);
                    if(rowContext){
                         this.updateCancelChangedArray(oModel,rowContext);
                } else{
                    allRecordsLoaded = false;
                    break;
                }
                }
                return allRecordsLoaded;

            },

            validateBeforeCancel: function(oModel,selectedRows){
                let i;
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    let rowContext = this._oSmartTable.getTable().getContextByIndex(index);
                    if(rowContext){
                    if (!oModel.getProperty(rowContext.sPath + "/" + "Approval_Status")) {
                        return true;
                    }
                }
                }
            },

            updateCancelChangedArray: function(oModel,rowContext){
           
                let obj = {};
                    obj = rowContext.getProperty(rowContext.sPath);
                    obj.To_CM = "";
                    obj.To_Site = "";
                    obj.To_Program = "";
                    obj.Tp_Business_Grp = "";
                    obj.Transfer_Flag = "";
                    obj.To_GHSite = "";
                    this.changedArray.push(obj);
                    this.changedPath.push(rowContext.sPath);
            
            
        },

        onCOSmartTbleReset: function(){
            if (this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length === 0) {
                sap.m.MessageToast.show("Select Atleast one record");
                return;
            }
            let selRowCnt = this.getView().byId("rfidonhandtable").getTable().getSelectedIndices().length;
            if (selRowCnt > '5000') {
                MessageBox.error("You cannot mass reset more than 5000 records.", {
                    title: "System Error"
                });
                return;
            }
            // check if any one of the records has approved status
            let index, i, allRecordsLoaded=true;
            let selectedRows = this._oSmartTable.getTable().getSelectedIndices();
            for (i = 0; i < selectedRows.length; i++) {
                index = selectedRows[i];
                if(this._oSmartTable.getTable().getContextByIndex(index)){
                    let currentStatus = this._oSmartTable.getTable().getContextByIndex(index).getProperty("Approval_Status");
                if (currentStatus) {
                    currentStatus = currentStatus.toLowerCase();
                    if (currentStatus !== "approved") {
                        sap.m.MessageToast.show("Only Approved Records can be Reset.Please check");
                        return;
                    }
                }else{
                    sap.m.MessageToast.show("Only Approved Records can be Reset.Please check");
                        return;
                }
     
            }else {
                allRecordsLoaded = false;
                break;
            }

            }

             this.updateTableModelStatus("Approval_Status", "Pending");
             this.resetRecords(allRecordsLoaded);
        },

          resetRecords: function(allRecordsLoaded){
            if (allRecordsLoaded && !this.selectAll) {
                this.onTableDataSave(undefined,"Pending", false, true,true);
            } else if(!allRecordsLoaded && !this.selectAll){
                MessageBox.information("Not all the records are loaded on UI.Please scroll down to load all the records");
                return;
            }
                else {
                oDataResp.massStatusChange("Reset",this);
            }

          },
 
            tableSelChange: function (oEvent) {
                this.selectAll = oEvent.getParameter("selectAll");
            },
            onAfterErrorClose: function (oEvent) {
                this._RecordLogsPopover.destroy();
            },

            fnOutput_frag_CloseLog: function (oEvent) {
                this.getView().getModel("RfidModel").setProperty("/RfidLogs", []);
                this._RecordLogsPopover.close();
            },


            createColumns: function () {
                return [
                    {
                        label: "Asset ID",
                        property: "Asset_Id"
                    },
                    {
                        label: "RFID",
                        property: "RFID"
                    },
                    {
                        label: "AQID",
                        property: "AQID"
                    },
                    {
                        label: "Raw AQID",
                        property: "Raw_AQID"
                    },
                    {
                        label: "Mapped AQID",
                        property: "Mapped_AQID"
                    },
                    {
                        label: "CM",
                        property: "CM"
                    },
                    {
                        label: "Site",
                        property: "Site"
                    },
                    {
                        label: "Validation Errors",
                        property: "ErrorMsg"
                    }
                ];
            },

            handleErrorlogDownload: function (oEvent) {
                try {
                    let binding = sap.ui.getCore().byId("tabError").getBinding("rows");
                    let oSettings = {
                        workbook: {
                            columns: this.createColumns()
                        },
                        dataSource: binding.getModel().getProperty(binding.getPath()),
                        fileName: "RFIDLogs.xlsx",
                    };
                    let oSheet = new Spreadsheet(oSettings);
                    oSheet.build().finally(function () {
                        oSheet.destroy();
                    });
                } catch (e) {
                    console.log(e);
                }
            },
            onCancel: function(oEvent){
                this.changedArray=[];
                this.changedPath=[];
                let key = oEvent.getSource().getProperty("key");
                oDataResp.updateSelectAllFlag(this);
                if(key ===  "cancel"){
                    this.onCOSmartTbleCancelReq();
                } else if(key === "reset"){
                    this.onCOSmartTbleReset();
                }
            }
        });
    });
