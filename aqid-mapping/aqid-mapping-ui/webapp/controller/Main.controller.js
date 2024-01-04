sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "../utils/oDataResp"
],
    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */
    function (Controller, Fragment, MessageBox, Filter, FilterOperator, Sorter, oDataResp) {
        "use strict";

        return Controller.extend("coa.aqidmappingui.controller.Main", {
            onInit: function () {

                let oDataModel = this.getOwnerComponent().getModel("MainModel");
                this.getView().setModel(oDataModel);

                this._oSmartTable = this.getView().byId("AqidMappingTable");
                this._oSmartFilterBar = this.getView().byId("smartFilterBar");

                this.setJSONModelToView();
                this.getView().setModel("authModel", this.getOwnerComponent().getModel("authModel"));
                if (!this.getOwnerComponent().getModel("authModel").getProperty("/display")) {
                    this.getOwnerComponent().getRouter().getTargets().display("TargetNoAuth");
                    return;
                }

                this.appODataChangeLogModel = this.getOwnerComponent().getModel("changeLogModel");
                this.getView().setModel(this.appODataChangeLogModel, "changeLogModel");

                this.getLastSyncData(oDataModel);

                this.changedArray = [];
                this.changedPath = [];

            },

            getLastSyncData: function (oDataModel) {
                this.getView().setBusy(true);
                let aSorters = [];
                aSorters.push(new Sorter("createdAt", true))
                let mParameters = {
                    sorters: aSorters,
                    urlParameters: {
                        "$top": 1
                    },
                    success: function (oData, response) {
                        this.getView().setBusy(false);
                        if (oData.results && oData.results.length > 0) {
                            this.getView().getModel("AqidModel").setProperty("/lastSyncBy", oData.results[0].createdBy_Name);
                            this.getView().getModel("AqidModel").setProperty("/lastSyncLogId", oData.results[0].Log_Id);
                            this.getView().getModel("AqidModel").setProperty("/createdBy_mail", oData.results[0].createdBy_mail);
                            this.getView().getModel("AqidModel").setProperty("/ReasonForStatus", oData.results[0].ReasonForStatus);
                            let status = oData.results[0].Status;
                                status = status.toLowerCase();
                            let color = "";    
                            if(status === "completed"){
                                color = "lime"
                                this.getView().getModel("AqidModel").setProperty("/reasonSyncVisible", false);
                            }else if(status === "error"){
                                color = "red";
                                this.getView().getModel("AqidModel").setProperty("/reasonSyncVisible", true);
                            } else{
                                color = "orange";
                                this.getView().getModel("AqidModel").setProperty("/reasonSyncVisible", true);
                            }
                            this.getView().byId("lastSyncdata").setColor(color);
                            let createdAt = new Date(oData.results[0].createdAt.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
                            this.getView().getModel("AqidModel").setProperty("/lastSyncDate", createdAt);
                        }
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        this.raiseBackendException(oError);
                    }.bind(this)
                };
                oDataModel.read("/SyncAQIDStatus", mParameters);


                let mParameters1 = {
                    sorters: aSorters,
                    filters: [new Filter("Status",FilterOperator.EQ,"Completed")],
                    urlParameters: {
                        "$top": 1
                    },
                    success: function(oData,response){
                        if(oData.results[0].DateGND){
                            let lastSyncGND5 = oData.results[0].DateGND;
                                lastSyncGND5 = new Date(lastSyncGND5);
                                lastSyncGND5 = lastSyncGND5.toLocaleString("en-US", {
                                        timeZone: "America/Los_Angeles"
                                        });
                                lastSyncGND5 = new Date(lastSyncGND5);
                            this.getView().getModel("AqidModel").setProperty("/lastSyncGND5", lastSyncGND5);         
                            }   
                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        this.raiseBackendException(oError);
                    }.bind(this)
                }

                oDataModel.read("/SyncAQIDStatus",mParameters1);
            },

            onLastSyncPopover: function (oEvent) {
                let oResponsivePopoverOpener = this.getView().byId("lastSyncdata");
                let oResponsivePopover = this.getView().byId("lastSyncPopover");
                oResponsivePopover.openBy(oResponsivePopoverOpener);

            },

            onSFBInitialise: function (oEvent) {
                oEvent.getSource()._oSearchButton.setText("Search");
            },
            setJSONModelToView: function () {
                let e = new sap.ui.model.json.JSONModel;
                this.getView().setModel(e, "AqidModel");
                this.getView().getModel("AqidModel").setSizeLimit(10000);

            },
            getODataUrlAjaxSyncAqid: function () {
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/db-services/aqid-details/beginFetch";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/db-services/aqid-details/beginFetch";
                }
                return oDataUrl;
            },

            onSyncAqid: function (oEvent) {
                let that = this;
                let payloadData = {};
                let payloadDataA = JSON.stringify(payloadData);
                let oDataUrl = that.getODataUrlAjaxSyncAqid();
                this.getView().setBusy(true);

                let oDataModel = this.getOwnerComponent().getModel("MainModel");
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
                        that.getLastSyncData(oDataModel);
                        MessageBox.success("Sync Aqid Triggered Successfully");
                    },
                    error: function (oError) {
                        that.ajaxCallError(oError,that);
                    }
                });

            },

            ajaxCallError: function(oError,that){
                that.getView().setBusy(false);
                that.changedArray = [];
                that.raiseBackendException(oError);
            },


            onPressUpload: function (oEvent) {
                if (this.getView().byId("AqidMappingTable").getTable().getSelectedIndices().length === 0) {
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
                let selRowCnt = this.getView().byId("AqidMappingTable").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass update more than 5000 records.", {
                        title: "System Error",
                    });
                    return;
                }
                Fragment.load({ name: "coa.aqidmappingui.Fragments.MassUpdate", controller: this }).then(function name(oFragment) {
                    this._oDialogFileUpload = oFragment;
                    this.getView().addDependent(this._oDialogFileUpload);
                    this._oDialogFileUpload.open();
                }.bind(this));
            },
            onCloseDialog: function (oEvent) {
                this.massUpdateAction = "";
                if (oEvent) {
                    this.massUpdateAction = oEvent.getParameter("id");
                }
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
            onTableDataSave: function (oEvent, isMassUpdate) {
                let that = this;
                
                
                let oModel = this.getOwnerComponent().getModel("MainModel");
                if (!oModel.hasPendingChanges() && !isMassUpdate) {
                    sap.m.MessageToast.show("No Changes are made.Save not required");
                    return;
                }
                let i;

 
                let pendingChanges = this._oSmartTable.getModel().getPendingChanges();
                let pendingArray = Object.entries(pendingChanges);
                

                for (i = 0; i < pendingArray.length; i++) {
                    let sPathArray = pendingArray[i];
                    let changedRow = this._oSmartTable.getModel().getProperty("/" + sPathArray[0]);
                    this.changedArray.push(changedRow);
                    this.changedPath.push(sPathArray[0]);
                }


                this.getView().setBusy(true);

                let oDataUrl = this.getODataUrlAjaxCall();


                let la = {
                    "AqidData": this.changedArray
                };
                let payloadData = JSON.stringify(la);

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
                        oDataResp.tableSaveSuccess(data,isMassUpdate,that);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.getView().getModel().resetChanges();
                        that.getView().byId("AqidMappingTable").rebindTable();
                        that.raiseBackendException(oError);
                        that.changedArray = [];
                        that.changedPath = [];
                    }
                });
            },

            
            getODataUrlAjaxCall: function () {
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/db-services/aqid-details/aqid_mapping_action";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/db-services/aqid-details/aqid_mapping_action";
                }

                return oDataUrl;
            },
            onMassUpdateAccept: function (oEvent) {
                this.onCloseDialog()
            },
            updateUi: function () {
                this._oSmartTable.setBusy(true);
                this.onMassUpdate();
                this._oSmartTable.setBusy(false);
            },

            getODataUrlAjaxselectAll: function () {
                let oDataUrl;
                if (this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/db-services/aqid-details/selectAllMassUpdate";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/db-services/aqid-details/selectAllMassUpdate";
                }
                return oDataUrl;
            },

            onMassUpdate: function () {
                let that = this;
                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getTable().getSelectedIndices();
                let allRecordsLoaded = true;
                this.changedArray = [];
                this.changedPath = [];
                for (i = 0; i < selectedRows.length; i++) {
                    let index = selectedRows[i];
                    let rowContext = smartTable.getTable().getContextByIndex(index);
                    if (rowContext && !this.selectAll) {
                        let obj = {};
                         obj = rowContext.getProperty(rowContext.sPath);
                            obj.Cm_Recommendation = this.massUpdateValues[0];
                            obj.Short_Name = this.massUpdateValues[1];
                            obj.Comment = this.massUpdateValues[2];
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
                    this.onTableDataSave(null,true);
                } else {
                    let filters = this.getView().byId("AqidMappingTable").getTable().getBinding("rows").sFilterParams;
                    if (filters) {
                        filters = decodeURI(filters.split('$filter=')[1]);
                    }
                    let payloadData = {
                        "url": filters,
                        "Cm_Recommendation": this.massUpdateValues[0],
                        "Short_Name": this.massUpdateValues[1],
                        "Comment": this.massUpdateValues[2],
                    };
                    let payloadDataA = JSON.stringify(payloadData);
                    let oDataUrl = that.getODataUrlAjaxselectAll();
                    this.getView().setBusy(true);


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
                            that.refreshAndSetTabletoDisplay();
                            MessageBox.success("Data Saved Successfully");
                            
                        },
                        error: function (oError) {
                            that.ajaxCallError(oError,that);
                        }
                    });
                }
            },

            onDataReceived: function (oEvent) {
                let table = oEvent.getSource().getTable();
                let columns = table.getColumns();
                columns.forEach(function (oItem) {
                    oItem.setWidth("14rem");
                });
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
                for (let i = 0; i < this._oSmartTable.getTable().getSelectedIndices().length; i++) {
                    let selIndices = this._oSmartTable.getTable().getSelectedIndices()[i];
                    if(this._oSmartTable.getTable().getContextByIndex(selIndices)){

                    let names = ["Raw_Aqid", "Mapped_Aqid", "Program", "Station", "Site", "CM", "GH_Site"];


                    
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
                     sFilterInUrl = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, this.getOwnerComponent().getModel("MainModel").oMetadata, this.getOwnerComponent().getModel("MainModel").oMetadata._getEntityTypeByPath("/AQIDMapping"));
                } else{
                    sFilterInUrl = this.getView().byId("AqidMappingTable").getTable().getBinding("rows").sFilterParams;
                }
                return sFilterInUrl;
            },



            onBeforeExportAQID: function (oEvent) {
                let aFilters = [];

                if (this._oSmartTable.getTable().getSelectedIndices().length !== 0 && this._oSmartTable.getTable().getSelectedIndices().length !== oEvent.getSource().getTable().getBinding("rows").getLength()) {
                    let sFilterInUrl = this.fillFiltersforExport(aFilters);
                    sFilterInUrl = "&" + sFilterInUrl;
                    let serviceUri = this.getOwnerComponent().getModel("MainModel").sServiceUrl;
                    let sPath = serviceUri + "/AQIDMapping?$format=json" + sFilterInUrl;
                    oEvent.getParameter("exportSettings").dataSource.count = this._oSmartTable.getTable().getSelectedIndices().length;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = sPath;
                }

                if (oEvent.getParameter("exportSettings").dataSource.count > 200000) {
                    oEvent.getParameter("exportSettings").dataSource.count = 200000;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = oEvent.getParameter("exportSettings").dataSource.dataUrl + '&$top=200000&$skip=0';
                    sap.m.MessageToast.show("Record Count is greater than 200K.Only First 200K will be downloaded");
                }


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

            onAQIDSTInitialise: function (oEvent) {
                let table = oEvent.getSource().getTable();
                let columns = table.getColumns();
                columns.forEach(function (oItem) {
                    oItem.setWidth("14rem");
                });
                oEvent.getSource()._oEditButton.bindProperty("enabled", "authModel>/modifiy");
            },

            showChangeLog: function () {
                let oView = this.getView();

                if (!this._diaChangeLog) {
                    this._diaChangeLog = Fragment.load({ id: oView.getId(), name: "coa.aqidmappingui.Fragments.ChangeLog", controller: this }).then(function (oDialog) {
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
                
                // Replace removed duplicate fields to correct fields in this application
                oDataResp.passFilters(oBindingParams);

            },

            onSFBSearch: function (oEvent) {
                this.refreshAndSetTabletoDisplay();
            },

            onTableRefresh: function (oEvent) {
                let aFilters = this.getView().byId("smartFilterBar").getFilters();
                if(aFilters && aFilters.length !== 0){
                this.refreshAndSetTabletoDisplay();
                if (this.getView().byId("AqidMappingTable")) {
                    this.getView().byId("AqidMappingTable").applyVariant({});
                }
            }else{
                sap.m.MessageToast.show("Provide Mandatory Fields in selection");
            }
            },

            refreshAndSetTabletoDisplay: function () {
                this.selectedIndices = [];
                this.getView().getModel().resetChanges();
                if (this.getView().byId("AqidMappingTable").getModel("sm4rtM0d3l").getProperty("/editable")) {
                    this.getView().byId("AqidMappingTable")._oEditButton.firePress();
                    this.getView().byId("AqidMappingTable").getModel("sm4rtM0d3l").setProperty("/editable", false);
                }
                this.getView().byId("AqidMappingTable").rebindTable();
            },


            raiseBackendException: function (oError) {
                if (oError.status === 504 || oError.statusCode === 504 || oError.status === 502 || oError.statusCode === 502) {
                   this.raiseAjaxException(oError);

                } else if (oError.status === 400 || oError.status === 403 ) {
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
                MessageBox.error("Unexpected Error. Please Contact Technical Support",{
                    title: "Error"+ ' - ' + message,
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
                MessageBox.error("Unexpected Error. Please Contact Technical Support",{
                    title: "Error"+ ' - ' + message,
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

            formatDate: function (value) {
                if (value) {
                    let date = new Date(value);
                    let oOutFormat1 = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "MMM d y HH:mm:ss" });
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

                for (let acol of aColumns) {
                    acol.setWidth("15rem");
                    if (acol.data("p13nData").columnKey === "modifiedAt") {
                        acol.getTemplate().getBindingInfo("text").formatter = that.formatDate;
                    }
                }
            },
            beforeExportChangeLog: function (oEvent) {
                this.setDateTimeDuringExport(oEvent);
            },

            onEditToggle: function (oEvent) {
                let edit = oEvent.getSource().getModel("sm4rtM0d3l").getProperty("/editable");
                if (edit) {
                    this.getView().byId("AqidMappingTable").addStyleClass("zMultiSelect");
                } else {
                    this.getView().byId("AqidMappingTable").removeStyleClass("zMultiSelect");
                }

            },

            getUploadUrl: function () {
                let l_url;
                if (this.getOwnerComponent().getModel("device").getProperty('/origin') === "corp-apps") {
                    l_url = "/coa-api/v1/coa/db-services/aqid-details/Upload_AQIDMapping/csv";
                } else {
                    l_url = "/coa-api-ext/v1/ext/coa/db-services/aqid-details/Upload_AQIDMapping/csv";
                }
                return l_url;
            },

            handleUploadPress: function (oEvent) {
                oDataResp.handleUploadPress(oEvent, this);
            },

            handleUploadStatus: function (response) {
                oDataResp.handleFileUploadStatus(response, this);
            },

            setDataAfterFileUpload: function (err, resp) {
                if (!err) {
                    MessageBox.success("Data Saved successfully");

                } else {
                    Fragment.load({ name: "coa.aqidmappingui.Fragments.UploadLogs", controller: this }).then(function name(oFragment) {
                        this._RecordLogsPopover = oFragment;
                        this.getView().addDependent(this._RecordLogsPopover);
                        this._RecordLogsPopover.open();
                    }.bind(this));
                }
                if (!this.getOwnerComponent().getModel("device").getProperty("/isMockServer")) {
                    if (this.getView().byId("smartFilterBar").getFilters() && this.getView().byId("smartFilterBar").getFilters().length !== 0) {
                        this.refreshAndSetTabletoDisplay();
                    }

                }
            },
            onAfterErrorClose: function (oEvent) {
                this._RecordLogsPopover.destroy();
            },
            fnOutput_frag_CloseLog: function (oEvent) {
                this.getView().getModel("AqidModel").setProperty("/AqidUploadStatus", []);
                this._RecordLogsPopover.close();
            },

            tableSelChange: function (oEvent) {
                this.selectAll = oEvent.getParameter("selectAll");
            },

            applyErrorLog: function (oEvent) {

                oDataResp.applyErrorLog(oEvent,this);

            }

        });
    });
    