sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "../utils/oDataResp"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Dialog, Filter, FilterOperator, MessageBox, Fragment, oDataResp) {
        "use strict";

        return Controller.extend("com.apple.coa.coanpiprogramui.controller.Main", {
            onInit: function () {
                if (!this.getOwnerComponent().getModel("authModel").getProperty("/display")) {
                    this.getOwnerComponent().getRouter().getTargets().display("TargetNoAuth");
                    return;
                }
                this.getView().setModel(this.getOwnerComponent().getModel("MainModel"));
                this._oSmartTable = this.getView().byId("npiprogramsmarttable");

                this.appODataChangeLogModel = this.getOwnerComponent().getModel("changeLogModel");
                this.getView().setModel(this.appODataChangeLogModel, "changeLogModel");


                let appODataModel =  this.getOwnerComponent().getModel("MainModel")
                appODataModel.attachBatchRequestCompleted(function () {
                    if(this.firstLoad){
                    let oList = this.getView().byId("npiprogramsmarttable").getTable().getBinding("rows");
                    oList.create({}, true);
                    this.firstLoad = false;
                    }
                }.bind(this));


            },

            onDataReceived: function (oEvent) {
            // Deafult filter on init to get reference of rows
            const oBindingParams = oEvent.getParameter("bindingParams");
            if(!this._oSmartTable.getTable().getBinding("rows")){
            const defaultFilter = new sap.ui.model.Filter("Program", "EQ", null);
            oBindingParams.filters.push(defaultFilter);
            }
            
            if(this.sessionProgram && this.sessionProgram.length !== 0){
                this.passSessionProgramFilters(oEvent);
            }
                this.setColumnWidthForTable(oEvent);
            },

            passSessionProgramFilters: function(oEvent){
                const oBindingParams = oEvent.getParameter("bindingParams");
                this.sessionProgram.forEach((oItem) =>{
                    let defaultFilter = new sap.ui.model.Filter("Program", "EQ", oItem);
                    oBindingParams.filters.push(defaultFilter);
                });

                this.sessionProgram = [];
            },
            setColumnWidthForTable: function(oEvent){
                let that = this;
                let table = oEvent.getSource().getTable();
                let columns = table.getColumns();
                columns.forEach(function (oItem) {
                    oItem.setWidth("20rem");
                    if(oItem.data("p13nData").columnKey === "createdAt"){
                        oItem.getTemplate().getBindingInfo("value").formatter = that.formatDate;
                    }
                });
            },
            onCreate: function (oEvent) {
                let oList = this.getView().byId("npiprogramsmarttable").getTable().getBinding("rows");    // id of smarttable
                if(oList){
                    oList.create({}, true);
                } else{
                    this.firstLoad = true;
                    this._oSmartTable.rebindTable();
                }
            },
            isSelected: function () {
                let selIndices = this.getView().byId("npiprogramsmarttable").getTable().getSelectedIndices();
                return (selIndices.length !== 0);
            },

            onDelete: function (oEvent) {
                let selected = this.isSelected();
                if (!selected) {
                    sap.m.MessageToast.show("Please select the records for delete");
                    return;
                }

                if (!this.oDelConfirmDialog) {
                    this.oDelConfirmDialog = new Dialog({
                        type: sap.m.DialogType.Message,
                        title: "Confirm",
                        content: new sap.m.Text({ text: "Are you sure to delete the selected entries from table?" }),
                        beginButton: new sap.m.Button({
                            type: sap.m.ButtonType.Emphasized,
                            text: "Delete",
                            press: function () {
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

            deleteFromBackend: function () {
                let selIndices = this._oSmartTable.getTable().getSelectedIndices();
                let i, uiDelEntires = [];
                let oModel = this._oSmartTable.getTable().getModel();
                let delRecExc;

                for (i = 0; i < selIndices.length; i++) {
                    let index = selIndices[i];
                    let context = this._oSmartTable.getTable().getContextByIndex(index);
                    if(context){
                    let path = context.getPath();

                    uiDelEntires.push(path);
                    if (path.split("id-").length === 1) {
                        delRecExc = true
                        oModel.remove(path, {
                            groupId: "DeleteNPIProgram"
                        });
                    }
                } else{
                    MessageBox.information("Not all records are loaded in UI.Please scroll down slowly to load all the records");
                    return;
                }
                }




                this._oSmartTable.getModel().resetChanges(uiDelEntires, true, true);
                if (delRecExc) {
                    this.getView().setBusy(true);
                    oModel.submitChanges({
                        groupId: "DeleteNPIProgram",
                        success: function (data, resp) {
                            this.getView().setBusy(false);
                            MessageBox.success("Deleted Successfully!");
                        }.bind(this),
                        error: function (oError) {
                            this.getView().setBusy(false);
                            this.raiseBackendException(oError);
                        }.bind(this)
                    });
                }
            },
            validateBeforeSave: function(){
                let oModel = this.getView().getModel();
                let pendingArray = this.populatePendingChanges(oModel);
                this.sessionProgram = [];

                let i,isError=false;
                for (i = 0; i < pendingArray.length; i++) {
                    let sPathArray = pendingArray[i];
                    let changedRow = this._oSmartTable.getModel().getProperty("/" + sPathArray[0]);
                    if(!changedRow.Program){
                        isError = true;
                        break;
                    } else{
                        this.sessionProgram.push(changedRow.Program);
                    }
                }
                return isError;
            },

            populatePendingChanges: function (oModel) {
                let pendingChanges = oModel.getPendingChanges();
                if(pendingChanges){
                    return Object.entries(pendingChanges);
                 }
            },
            onTableDataSave: function (oEvent) {
                let oModel = this._oSmartTable.getModel();
                if (!oModel.hasPendingChanges()) {
                    sap.m.MessageToast.show("No Changes Made.Save Not Required");
                    return;
                }
                let validationError = this.validateBeforeSave();
                if(validationError){
                    MessageBox.error("Please Fill Mandatory Field Program");
                    return;
                }
                this.getView().setBusy(true);
                oModel.submitChanges({
                    groupId: "changes",
                    success: function (oRetrievedResult,response) {

                        this.getView().setBusy(false);
                        oDataResp.showSubmitMessage(oRetrievedResult,response,this);

                    }.bind(this),
                    error: function (oError) {
                        this.getView().setBusy(false);
                        this.raiseBackendException(oError);
                        this.sessionProgram = [];
                    }.bind(this)
                }, this);

            },
            raiseBackendException: function (oError) {
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
                sap.m.MessageBox.error(message);
            },
            refreshAndSetTabletoDisplay: function () {
                this.resetTableData();
                this.setTableDisplayMode();
                this.getView().byId("npiprogramsmarttable").rebindTable();
            },

            setTableDisplayMode:function(){
                if (this.getView().byId("npiprogramsmarttable").getModel("sm4rtM0d3l").getProperty("/editable")) {
                    this.getView().byId("npiprogramsmarttable")._oEditButton.firePress();
                    this.getView().byId("npiprogramsmarttable").getModel("sm4rtM0d3l").setProperty("/editable", false);
                }
            },

            resetTableData: function(){
                let uiDelEntires = [],i;
                let totalRows = this.getView().byId("npiprogramsmarttable").getTable()._getTotalRowCount()   // id of smarttable
                if(totalRows){
                for (i = 0; i < totalRows; i++) {
                    let context = this._oSmartTable.getTable().getContextByIndex(i);
                    if(context){
                    let path = context.getPath();
                    if (path.split("id-").length !== 1) {
                        uiDelEntires.push(path);
                    }
                } 
                }
            }
            this.getView().getModel().resetChanges(uiDelEntires,true,true);
            },

            onSFBSearch: function (oEvent) {
                this.refreshAndSetTabletoDisplay();
            },
            onTableRefresh: function (oEvent) {
                this.refreshAndSetTabletoDisplay();
            },
            fillFilterArray: function (names, selIndices, aFilters) {
                let j;

                for (j = 0; j < names.length; j++) {
                    let value = this._oSmartTable.getTable().getContextByIndex(selIndices).getProperty(names[j]);
                    aFilters.push(new Filter(names[j], FilterOperator.EQ, value));
                }

                return aFilters;
            },

            fillFiltersforExport: function (aFilters) {
                let allRecordsLoaded = true, sFilterInUrl, i;
                try {
                    this.getView().setBusy(true);
                    for (i = 0; i < this._oSmartTable.getTable().getSelectedIndices().length; i++) {
                        let selIndices = this._oSmartTable.getTable().getSelectedIndices()[i];
                        if (this._oSmartTable.getTable().getContextByIndex(selIndices)) {

                            let names = ["Program"];



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
                    sFilterInUrl = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, this.getOwnerComponent().getModel("MainModel").oMetadata, this.getOwnerComponent().getModel("MainModel").oMetadata._getEntityTypeByPath("/CarryoverNPIProgram"));
                } else {
                    sFilterInUrl = this._oSmartTable.getTable().getBinding("rows").sFilterParams;
                }
                return sFilterInUrl;
            },
            onBeforeExportNPI: function (oEvent) {
                let aFilters = [];

                if (this._oSmartTable.getTable().getSelectedIndices().length !== 0 && this._oSmartTable.getTable().getSelectedIndices().length !== oEvent.getSource().getTable().getBinding("rows").getLength()) {
                    let sFilterInUrl = this.fillFiltersforExport(aFilters);
                    sFilterInUrl = "&" + sFilterInUrl;
                    let serviceUri = this.getOwnerComponent().getModel("MainModel").sServiceUrl;
                    let sPath = serviceUri + "/CarryoverNPIProgram?$format=json" + sFilterInUrl;
                    oEvent.getParameter("exportSettings").dataSource.count = this._oSmartTable.getTable().getSelectedIndices().length;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = sPath;
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
            showChangeLog: function () {
                let oView = this.getView();

                if (!this._diaChangeLog) {
                    this._diaChangeLog = Fragment.load({ id: oView.getId(), name: "com.apple.coa.coanpiprogramui.Fragments.ChangeLog", controller: this }).then(function (oDialog) {
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
                    filters: [new Filter("Table", "EQ", "T_COA_NPI_PROGRAM")]
                }));
            },

            onProgramChange: function(oEvent){
                oEvent.getSource().setValue(oEvent.getSource().getValue().toUpperCase());
                oEvent.getSource().setProperty("editable", false);
            },

            onProgramDescChange: function(oEvent){
                oEvent.getSource().setProperty("editable", false);
            },
            onSFBInitialise: function (oEvent) {
                oEvent.getSource()._oSearchButton.setText("Search");
            },
            onNPITabinitialise: function(oEvent){
               this.setColumnWidthForTable(oEvent);
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
        });
    });
