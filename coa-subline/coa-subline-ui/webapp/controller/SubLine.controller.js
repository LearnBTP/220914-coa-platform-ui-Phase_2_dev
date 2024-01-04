sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "../utils/formatter",
    "../utils/oDataResp"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageToast, MessageBox, Dialog, Formatter, oDataResp) {
        "use strict";
        let access = { read: false, edit: false };
        let old_value = '';
        return Controller.extend("coasublineui.controller.SubLine", {
            onInit: function () {

                let oDataModel = this.getOwnerComponent().getModel("oDataModel");
                let oJsonSubLine = new JSONModel([]);
                this.getView().setModel(oDataModel);
                this.getView().setModel(oJsonSubLine, "coa");
                this.getView().getModel("coa").setProperty("/BtnEnable", false);
                this.getView().getModel("coa").setProperty("/RefreshEnable", false);
                let roleScopes = this.getOwnerComponent().getModel().getProperty('/AuthorizationScopes');
                this.changedArray = [];
                for (let role of roleScopes) {
                    if (role.includes('SubLineModify')) {
                        access.read = true;
                        access.edit = true;
                    }
                    if (role.includes('SubLineReadOnly')) {
                        access.read = true;
                    }
                }
                if (access.edit === false && access.read === false) {
                    this.getOwnerComponent().getRouter().getTargets().display("TargetNoAuth");
                }
                if (access.edit) {
                    this.getView().getModel("coa").setProperty("/EditRole", true);
                } else {
                    this.getView().getModel("coa").setProperty("/EditRole", false);
                }
                let oSmartFilterBar = this.getView().byId("smartFilterBar");
                oSmartFilterBar.addEventDelegate({
                    "onAfterRendering": function (oEvent) {
                        let oButton = oEvent.srcControl._oSearchButton;
                        oButton.setText("Search");
                    }
                });

                // calling the custom table column data 
                oDataResp.getSublineName("Sub_Line_Name_org", this);

            },

            bindResulttoModel: function (oData) {
                this.getView().getModel("coa").setProperty("/Sub_Line_Name_org", oData.results);

            },

            onDelete: function (oEvent) {
                let selIndices = this.getView().byId("SubLineTab").getTable().getSelectedIndices();
                if (selIndices.length === 0) {
                    MessageToast.show("Please select the records for delete");
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
                let selIndices = this.getView().byId("SubLineTab").getTable().getSelectedIndices();
                let tabData = this.getView().getModel("coa").getProperty("/SubLine");
                let table = this.getView().byId("SubLineTab").getTable();
                let oDataModel = this.getOwnerComponent().getModel("oDataModel");
                this.getView().setModel(oDataModel);
                let appid = this.getOwnerComponent().getModel().getProperty('/Appid');
                oDataModel.setHeaders({ prefer: 'odata.continue-on-error', appid: appid });
                let delRecExc;
                let count = 0, idx;
                oDataModel.setDeferredGroups(["DeleteSubLine"]);
                for (let selIdx of selIndices) {
                    let oRowObj = table.getContextByIndex(selIdx);
                    let oRowData = oRowObj.getObject();
                    idx = Number(oRowObj.sPath.split("/")[2]);
                    if (oRowData.flgChg && oRowData.flgChg === 'C') {
                        tabData[idx].delete = true;
                        count++;
                    } else {
                        let encodeSublineName = oRowData.Sub_Line_Name.replace(/'/g, "''");
                        encodeSublineName = encodeURIComponent(encodeSublineName);
                        let sPath = "/CarryoverSubline(CM='" + oRowData.CM + "',Site='" + oRowData.Site +
                            "',Program='" + oRowData.Program + "',Sub_Line_Name='" + encodeSublineName + "',Uph='" + oRowData.Uph +
                            "')";
                        sPath = sPath.replace(/Uph='(.*?)'/g, "Uph=$1");
                        count++;
                        delRecExc = true;
                        tabData[idx].delete = true;
                        let chgid = "removeSubLine" + count;

                        oDataModel.remove(sPath, {
                            changeSetId: chgid,
                            groupId: "DeleteSubLine"
                        });
                    }
                }

                if (delRecExc) {
                    this.getView().setBusy(true);
                    let that = this;
                    oDataModel.submitChanges({
                        groupId: "DeleteSubLine",
                        success: function (data, resp) {
                            that.getView().setBusy(false);
                            that.handleSaveSuccess(data, resp, true);
                        },
                        error: function (err) {
                            that.getView().setBusy(false);
                            that.odataCommonErrorDisplay(err);
                        }
                    });
                }

            },
            odataCommonErrorDisplay: function (err) {
                try {
                    this.onRaiseMessage("Unexpected Error In Saving Record - " + err.statusCode().status + "-" + err.responseText);
                }
                catch (e) {
                    this.onRaiseMessage("Communication Error", "ERROR");
                }
            },
            onPressHistory: function (oEvent) {
                sap.ui.core.Fragment.load({
                    name: "coasublineui.Fragments.History",
                    controller: this
                }).then(function name(oFragment) {
                    this._oDialogHistory = oFragment;
                    let oDataLog = this.getOwnerComponent().getModel("LogOdataModel");
                    this._oDialogHistory.setModel(oDataLog);
                    this.getView().addDependent(this._oDialogHistory);
                    this._oDialogHistory.open();
                }.bind(this));
            },
            onCloseDialog: function (oEvent) {
                this._oDialogHistory.close();
            },
            onAfterHistoryClose: function (oEvent) {
                this._oDialogHistory.destroy();
            },
            applyTableLogFilter: function (oEvent) {
                let oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("Table", "EQ", "T_COA_SUBLINE")
                    ]
                }));

                // Replace removed duplicate fields to correct fields in this application
                oBindingParams.filters[0].aFilters.forEach(function (oItem, index) {
                    if (oItem.oValue1 === "COMMENTS") {
                        oItem.oValue1 = "COMMENT";
                    }
                });
            },
            handleUploadPress: function (oEvent) {
                oDataResp.handleUploadPress(oEvent, this);
            },
            handleFileUploadStatus: function (response, that) {
                oDataResp.handleFileUploadStatus(response, that);
            },
            // Mass Upload Methods- Start
            onMassUpdate: function (oEvent) {
                let selIndices = this.getView().byId("SubLineTab").getTable().getSelectedIndices();
                if (selIndices.length === 0) {
                    MessageToast.show("Please select the records for mass update");
                    return;
                }
                if (selIndices.length > '5000') {
                    MessageBox.error("You cannot mass update more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }
                sap.ui.core.Fragment.load({
                    name: "coasublineui.Fragments.MassUpload",
                    controller: this
                }).then(function name(oFragment) {
                    this._oDialogMassUpload = oFragment;
                    this.getView().addDependent(this._oDialogMassUpload);
                    this._oDialogMassUpload.open();
                }.bind(this));
            },

            onMassUpdateAccept: function (oEvent) {
                this.massUpdateAction = "";
                if (oEvent) {
                    this.massUpdateAction = oEvent.getParameter("id");
                }
                this._oDialogMassUpload.close();
            },


            onMLMUClose: function (oEvent) {
                this._oDialogMassUpload.close();
            },
            onErrCloseDialog: function (oEvent) {
                this._oDialogErr.close();
            },
            onAfterMassUpdateClose: function (oEvent) {
                if (this.massUpdateAction === "BMUSubmit") {
                    this.inputFields = sap.ui.getCore().byId("smartMUForm").getGroups()[0].getAggregation("formElements");
                    this.massUpdateValues = [];
                    this.inputFields.forEach(function (oItem) {
                        this.massUpdateValues.push(oItem.getFields()[0].getValue().toString().trim());
                    }.bind(this));
                }
                this._oDialogMassUpload.destroy();
                if (this.massUpdateAction === "BMUSubmit") {
                    this.updateUi();
                }
            },
            updateUi: function () {
                this.onMassUpdateTbleCnge();
            },

            onMassUpdateTbleCnge: function () {


                let smartTable = this.getView().byId("SubLineTab").getTable();
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getSelectedIndices();
                let tabOdata, chg = false;

                for (i = 0; i < selectedRows.length; i++) {
                    tabOdata = this.getView().getModel("coa").getProperty("/SubLine");
                    let index = selectedRows[i];
                    let rowContext = smartTable.getContextByIndex(index);

                    if (rowContext) {
                        let path = rowContext.sPath.split("/")[2];
                        chg = this.updateChgRowTabData(tabOdata, path);
                    }
                }

                // send the changed data to the ajax call for the mass update
                if (chg === true) {
                    this.postMassUpdate();
                } else {
                    MessageToast.show("No Changes made");
                }
            },

            updateChgRowTabData: function (tabOdata, path) {
                path = parseInt(path);

                let obj = JSON.parse(JSON.stringify(tabOdata[path]));
                let chg = false;
                for (let j = 0; j < this.massUpdateValues.length; j++) {
                    let value = this.massUpdateValues[j].trim();
                    if (value && this.inputFields[j].getId() === "IBoH") {
                        chg = true;
                        obj.boH_Qty = parseInt(value);
                    }
                    else if (value && this.inputFields[j].getId() === "IRemote") {
                        chg = true;
                        obj.Remote_Site_Cap_Demand = parseInt(value);
                    }
                    else if (value && this.inputFields[j].getId() === "IWHrs") {
                        chg = true;
                        obj.Working_Hrs = parseInt(value);
                    }
                    else if (value && this.inputFields[j].getId() === "IYield") {
                        chg = true;
                        obj.Yield = parseFloat(value);
                    }
                    else if (value && this.inputFields[j].getId() === "IComment") {
                        chg = true;
                        obj.Comment = value;
                    }

                }
                if (chg === true) {
                    this.changedArray.push(obj);
                }

                return chg;
            },

            postMassUpdate: function () {
                let that = this;
                let dataArr = [];
                this.changedArray.forEach(function (oItem) {
                    let obj = {};
                    obj.createdAt = oItem.createdAt;
                    obj.createdBy = oItem.createdBy;
                    obj.modifiedAt = oItem.modifiedAt;
                    obj.modifiedBy = oItem.modifiedBy;
                    obj.CM = oItem.CM;
                    obj.Site = oItem.Site;
                    obj.Program = oItem.Program;
                    obj.Sub_Line_Name = oItem.Sub_Line_Name;
                    obj.Yield = oItem.Yield;
                    obj.Uph = oItem.Uph;
                    obj.boH_Qty = oItem.boH_Qty;
                    obj.Working_Hrs = oItem.Working_Hrs;
                    obj.Remote_Site_Cap_Demand = oItem.Remote_Site_Cap_Demand;
                    obj.Comment = oItem.Comment;
                    obj.SAP_CM_Site = oItem.SAP_CM_Site;
                    obj.GH_Site = oItem.GH_Site;
                    obj.Error = oItem.Error;
                    dataArr.push(obj);
                });
                let preData = {
                    "Sublinedata": dataArr
                };
                let payloadData = JSON.stringify(preData);
                let oDataUrl;

                if (that.getOwnerComponent().getModel().getProperty('/Origin') === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/lineplan-services/lineplan/subline_action";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/lineplan-services/lineplan/subline_action";
                }
                this.getView().setBusy(true);
                $.ajax({

                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadData,
                    headers: {
                        "appid": that.getOwnerComponent().getModel().getProperty('/Appid')
                    },
                    success: function (data) {
                        that.getView().setBusy(false);
                        that.handleFileUploadStatus(data, that);
                        that.changedArray = [];
                    },
                    error: function (oError) {
                        that.changedArray = [];
                        that.getView().setBusy(false);
                        that.odataCommonErrorDisplay(oError);
                    }
                });
            },

            //Smart Filter Events: Start//
            onRefresh: function (oEvent) {
                let aFilter = this.getView().byId("smartFilterBar").getFilters();
                if (aFilter.length === 0) {
                    MessageToast.show("Please provide CM in filter");
                    return;
                }
                this.onSearch(oEvent);
            },
            onSearch: function (oEvent) {
                let aFilter = this.getView().byId("smartFilterBar").getFilters();
                let oDataModel = this.getOwnerComponent().getModel("oDataModel");
                if (access.read === true || access.edit === true) {
                    this.getView().setBusy(true);
                    //Remove Filter, Sorters
                    if (this.getView().byId('SubLineTab')) {
                        this.getView().byId('SubLineTab').applyVariant({});
                    }
                    oDataModel.read("/CarryoverSubline", {
                        context: null,
                        filters: aFilter,
                        sorters: null,
                        success: function (oData) {
                            this.getView().setBusy(false);
                            this.getView().getModel("coa").setProperty("/SubLine", oData.results);
                            this.setTableToDisplay();
                            this.getView().getModel("coa").setProperty("/RefreshEnable", false);
                            if (oData.results.length >= 1) {
                                this.getView().getModel("coa").setProperty("/RefreshEnable", true);
                            }

                        }.bind(this),
                        error: function (oError) {
                            this.getView().setBusy(false);
                            if (oError.responseText) {
                                MessageToast.show(oError.responseText && "-Get Call Failed");
                            }
                        }.bind(this)
                    });
                } else {
                    MessageToast.show("No Authorization!");
                }
            },
            //Smart Filter Bar Events: End//
            // Smart Table Methods- Start
            onSmartTableInit: function (oEvent) {
                let oTable;
                if (oEvent) {
                    oTable = oEvent.getSource().getTable();
                } else {
                    oTable = this.getView().byId("SubLineTab").getTable();
                }
                let aColumns = oTable.getColumns();

                let Keys = ["Sub_Line_Name", "Program", "GH_Site", "Uph"];
                let NonEdit = ["CM", "Site", "createdAt", "createdBy", "modifiedBy", "modifiedAt", "Error", "modifiedBy_Name", "modifiedBy_mail", "createdBy_Name", "createdBy_mail", "Edit"];
                for (let acol of aColumns) {
                    let sPath = "coa>" + acol.data("p13nData").columnKey;

                    if (sPath !== "coa>Sub_Line_Name") {
                        acol.getTemplate().getDisplay().bindText(sPath);
                        acol.getTemplate().getEdit().bindValue(sPath);
                        if (Keys.includes(acol.data("p13nData").columnKey)) {
                            acol.getTemplate().getBindingInfo("editable").parts[0].path = "KEdit";
                            acol.getTemplate().getBindingInfo("editable").parts[0].model = "coa";
                            acol.getTemplate().getEdit().attachLiveChange(this.onFldLiveChange, this);
                            acol.getTemplate().getEdit().setValueHelpOnly(false);
                            acol.getTemplate().getEdit().setShowValueHelp(false);
                            acol.getTemplate().getEdit().setShowSuggestion(false);
                            acol.getTemplate().getEdit().setShowTableSuggestionValueHelp(false);


                        } else if (NonEdit.includes(acol.data("p13nData").columnKey)) {
                            acol.getTemplate().getEdit().setEditable(false);
                            if (acol.data("p13nData").columnKey === "modifiedAt") {
                                acol.getTemplate().getDisplay().bindProperty("text", { parts: ['coa>modifiedAt'], formatter: Formatter.formatDate });
                                acol.getTemplate().getEdit().bindProperty("value", { parts: ['coa>modifiedAt'], formatter: Formatter.formatDate });
                            }
                            else if (acol.data("p13nData").columnKey === "createdAt") {
                                acol.getTemplate().getDisplay().bindProperty("text", { parts: ['coa>createdAt'], formatter: Formatter.formatDate });
                                acol.getTemplate().getEdit().bindProperty("value", { parts: ['coa>createdAt'], formatter: Formatter.formatDate });
                            }
                        } else {
                            acol.getTemplate().getBindingInfo("editable").parts[0].path = "NKEdit";
                            acol.getTemplate().getBindingInfo("editable").parts[0].model = "coa";
                            acol.getTemplate().getEdit().bindProperty("valueState", { parts: ['coa>chgFields'], formatter: Formatter.valueStateApply });
                            acol.getTemplate().getEdit().attachLiveChange(this.onFldLiveChange, this);
                        }

                    }

                }
            },
            historyTabInit: function (oEvent) {
                let oTable = oEvent.getSource().getTable();
                let aColumns = oTable.getColumns();

                for (let acol of aColumns) {
                    acol.setWidth("15rem");
                    if (acol.data("p13nData").columnKey === "modifiedAt") {
                        acol.getTemplate().getBindingInfo("text").formatter = Formatter.formatDate;
                    }
                }
            },
            onChange: function (oEvent) {
                let params = oEvent.getParameters();
                let NumberFld = ["Uph", "boH_Qty", "Remote_Site_Cap_Demand", "Working_Hrs", "Yield"];
                if (NumberFld.includes(params.id)) {
                    let regInt = /^-?\d*$/;
                    if (regInt.test(params.newValue)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Information);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValueStateText("Enter Valid Number");
                        oEvent.getSource().setValue('');
                    }

                }
            },
            onFldLiveChange: function (oEvent) {
                let value = oEvent.getSource().getValue();
                let newVal = oEvent.mParameters.newValue;
                old_value = oEvent.getSource().getLastValue();
                let field = oEvent.getSource().getBindingInfo("value")["binding"].getPath();
                let UpperCase = ["Program"];
                let NumberFld = ["Uph", "boH_Qty", "Remote_Site_Cap_Demand", "Working_Hrs", "Yield"];
                if (NumberFld.includes(field)) {
                    let regInt = /^-?\d*$/;
                    if (regInt.test(value)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Information);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValueStateText("Enter Valid Number");
                    }
                } else if (UpperCase.includes(field)) {
                    if (value && value !== '' && newVal) {
                        oEvent.getSource().setValue(newVal.toUpperCase());
                    }
                }

            },
            onTableDataSave: function (oEvent) {
                let callOdata, putData;
                let tabData = this.getView().getModel("coa").getProperty("/SubLine");
                let oDataModel = this.getOwnerComponent().getModel("oDataModel");
                oDataModel.setDeferredGroups(["SubLine"]);
                oDataModel.setRefreshAfterChange(false);
                let appid = this.getOwnerComponent().getModel().getProperty('/Appid');
                oDataModel.setHeaders({ prefer: 'odata.continue-on-error', appid: appid });
                let cnt = 0;
                for (let row of tabData) {
                    cnt++;
                    if (row.flgChg !== undefined && row.flgChg === 'U') {
                        callOdata = true;
                        let path = "/CarryoverSubline(CM='" + row.CM + "',Site='" + row.Site +
                            "',Program='" + row.Program + "',Sub_Line_Name='" + row.Sub_Line_Name + "',Uph='" + row.Uph +
                            "')";
                        path = path.replace(/Uph='(.*?)'/g, "Uph=$1");
                        let chgid = "updateSubLine" + cnt;

                        putData = this.prepareSubLineData(row, row.flgChg);
                        oDataModel.update(path, putData, {
                            changeSetId: chgid,
                            groupId: "SubLine"
                        });
                    }
                    else if (row.flgChg !== undefined && row.flgChg === "C") {
                        callOdata = true;
                        let changeSet = "createSubline" && cnt;
                        putData = this.prepareSubLineData(row, row.flgChg);
                        oDataModel.create("/CarryoverSubline", putData, {
                            changeSetId: changeSet,
                            groupId: "SubLine"
                        });
                    }
                }
                if (callOdata === true) {
                    this.getView().setBusy(true);
                    oDataModel.submitChanges({
                        groupId: "SubLine",
                        success: function (oData, resp) {
                            this.handleSaveSuccess(oData, resp, false);
                        }.bind(this),
                        error: function (err) {
                            this.getView().setBusy(false);
                            this.odataCommonErrorDisplay(err);
                        }.bind(this)
                    });
                } else {
                    MessageToast.show("No changes done");
                }
            },
            handleSaveSuccess: function (oData, resp, deleteFag) {
                this.getView().setBusy(false);
                let errFlag = false, succFlg = false, returnVar;
                if (resp.data && resp.data.__batchResponses) {
                    let tabData = this.getView().getModel("coa").getProperty("/SubLine");
                    for (let resItm of resp.data.__batchResponses) {
                        if (resItm.response && resItm.response.statusCode) {
                            returnVar = oDataResp.updateBatchCreateResponse(errFlag, succFlg, resItm.response, tabData, deleteFag, this);
                            errFlag = returnVar[0];
                            succFlg = returnVar[1];
                            tabData = returnVar[2];
                        } else if (resItm.__changeResponses) {
                            returnVar = oDataResp.updateBatchChangeResponse(resItm.__changeResponses, tabData, this);
                            if (!succFlg) {
                                succFlg = returnVar[0];
                            }
                            tabData = returnVar[1];
                        }
                    }
                    this.getView().getModel("coa").setProperty("/SubLine", tabData);
                    this.getView().byId("SubLineTab").getModel("coa").refresh(true);
                    oDataResp.handleSaveResponse(succFlg, errFlag, this);
                }
                if (deleteFag) {
                    oDataResp.raiseDeleteStatus(errFlag, succFlg, this);

                } else {
                    this.raiseSaveStatus(errFlag, succFlg);

                }


            },
            raiseSaveStatus: function (errFlag, succFlg) {
                let lv_message = "";
                if (errFlag === true && succFlg === true) {
                    lv_message = "Partial Data Saved, Please check error column for more details";
                } else if (errFlag === false && succFlg === true) {
                    MessageBox.success("Data Saved Successfully");
                    this.setTableToDisplay();
                } else if (errFlag === true && succFlg === false) {
                    lv_message = "Partial Data Saved, Please check error column for more details";
                }
                if (lv_message !== "") {
                    MessageBox.show(lv_message, {
                        icon: "INFORMATION",
                        actions: ["OK"]
                    });
                }
            },

            setTableToDisplay: function (chgData) {
                let tabData = this.getView().getModel("coa").getProperty("/SubLine");
                for (let item of tabData) {
                    item.KEdit = false;
                    item.NKEdit = false;
                    item.flgChg = "";
                    item.chgFields = [];
                }
                this.getView().getModel("coa").setProperty("/SubLine", tabData);
                this.getView().byId("SubLineTab").getModel("coa").refresh(true);
                this.getView().byId("SubLineTab").rebindTable();
                this.getView().byId("SubLineTab").getTable().clearSelection();
                if (this.getView().byId("SubLineTab").getEditable() === true) {
                    this.getView().byId("SubLineTab")._oEditButton.firePress();
                    this.getView().byId("SubLineTab").getModel("sm4rtM0d3l").setProperty("/editable", false);
                }
                let oTable = this.getView().byId("SubLineTab").getTable();
                let rows = oTable.getRows();

                for (let row of rows) {
                    oDataResp.setCellValueState(row, oTable, "ALLCELLS", "None");
                }
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
            setDataAsPerType: function (row, field, newVal, oEvent) {
                let UpperCase = ["Program"];
                let NumberFld = ["Uph", "boH_Qty", "Remote_Site_Cap_Demand", "Working_Hrs", "Yield"]
                let regInt = /^-?\d*$/;
                if (newVal && newVal !== '' && UpperCase.includes(field)) {
                    row[field] = newVal.toUpperCase();
                } else if (NumberFld.includes(field)) {
                    if (
                        (regInt.test(newVal) === false) || newVal === '') {
                        row[field] = old_value;
                    }
                }
                old_value = '';
                if (!oEvent.getSource().sId.includes("sublinenmeComboBox")) {
                    oEvent.getParameter("changeEvent").getSource().setValueState(sap.ui.core.ValueState.Information);
                    oEvent.getParameter("changeEvent").getSource().setValueStateText("");

                }

                if (row.flgChg !== undefined && row.flgChg === "") {
                    row.flgChg = "U";
                }
                if (row.chgFields === undefined) {
                    row.chgFields = [];
                }
                if (!row.chgFields.includes(field)) {
                    row.chgFields.push(field);
                }
            },
            OnFieldChange: function (oEvent) {
                let row, field, newVal;
                if (oEvent.getSource().sId.includes("sublinenmeComboBox")) {
                    row = oEvent.getSource().getBindingContext("coa").getObject();
                    field = "Sub_Line_Name";
                    newVal = oEvent.mParameters.newValue;
                }
                else {
                    row = oEvent.getParameter("changeEvent").getSource().getBindingInfo("value")["binding"].getContext().getObject();
                    field = oEvent.getParameter("changeEvent").getSource().getBindingInfo("value")["binding"].getPath();
                    newVal = oEvent.getParameter("changeEvent").getParameter("newValue");
                }

                this.setDataAsPerType(row, field, newVal, oEvent);

            },
            onEditToggle: function (oEvent) {
                let tabData = this.getView().getModel("coa").getProperty("/SubLine");
                if (tabData !== undefined) {
                    for (let item of tabData) {
                        item.NKEdit = (oEvent.getParameter("editable") && item.Edit === 7);
                        if (item.flgChg === 'C') {
                            item.KEdit = oEvent.getParameter("editable");
                        }
                    }
                    this.getView().getModel("coa").setProperty("/SubLine", tabData);
                    this.getView().byId("SubLineTab").getModel("coa").refresh(true);
                }
                this.getView().getModel("coa").setProperty("/BtnEnable", oEvent.getParameter("editable"));
            },
            onAddRec: function (oEvent) {
                let tabData = this.getView().getModel("coa").getProperty("/SubLine");
                if (tabData === undefined) {
                    tabData = [];
                }
                let newRec = this.prepareSubLineData({}, "C");
                newRec.NKEdit = true;
                newRec.KEdit = true;
                newRec.flgChg = 'C';
                newRec.Edit = 7;
                tabData.unshift(newRec);

                this.getView().getModel("coa").setProperty("/SubLine", tabData);
                this.getView().byId("SubLineTab").getModel("coa").refresh(true);
                this.getView().byId("SubLineTab").rebindTable();
                MessageToast.show("New Line created at top, Please enter values");
            },
            onCopyRec: function (oEvent) {
                let tabData = this.getView().getModel("coa").getProperty("/SubLine");
                let selIndices = this.getView().byId("SubLineTab").getTable().getSelectedIndices();
                if (selIndices && selIndices.length <= 0) {
                    MessageToast.show("Please select atleast one record to copy");
                    return;
                }
                let copyData = [], CopyIndex = [], copiedTabData;
                for (let selIdx of selIndices) {
                    let row = this.getView().byId("SubLineTab").getTable().getContextByIndex(selIdx).getObject();
                    let newRec = this.prepareSubLineData(row, "C");
                    newRec.NKEdit = true;
                    newRec.KEdit = true;
                    newRec.flgChg = 'C';
                    newRec.Edit = 7;
                    copyData.push(newRec);
                    CopyIndex.push(selIdx);

                }
                if (copyData.length !== 0) {
                    copiedTabData = this.copyAndRepTbleData(tabData, CopyIndex, copyData);
                }

                this.getView().getModel("coa").setProperty("/SubLine", copiedTabData);
                this.getView().byId("SubLineTab").getModel("coa").refresh(true);
                this.getView().byId("SubLineTab").rebindTable();
                MessageToast.show("Line copied, Please provide unique key combination");
            },


            copyAndRepTbleData: function (OriginalArr, copyIndices, copiedValues) {
                let resultArray = [], i;

                for (i = 0; i < OriginalArr.length; i++) {
                    resultArray.push(OriginalArr[i]);
                    if (copyIndices.includes(i)) {
                        resultArray.push(copiedValues.shift());
                    }
                }

                return resultArray;
            },

            defineNewRowProperty: function (row, field, value, item) {
                if (row[field] === undefined) {
                    item[field] = value;
                } else {
                    item[field] = row[field];
                }
                return item;
            },
            prepareSubLineData: function (row, mode) {
                let item = {};
                if (mode === 'U' && row.chgFields) {
                    for (let flds of row.chgFields) {
                        item[flds] = row[flds];
                    }
                } else if (mode === 'C') {
                    // BoH Qty
                    item = this.defineNewRowProperty(row, 'boH_Qty', 0, item);
                    //CM is not required to send to the backend, based on GH site , backend will generate it

                    // Program
                    item = this.defineNewRowProperty(row, 'Program', "", item);
                    // Site is not required to send to the backend, based on GH site , backend will generate it

                    // Comment
                    item = this.defineNewRowProperty(row, 'Comment', "", item);
                    // Uph
                    item = this.defineNewRowProperty(row, 'Uph', 0, item);
                    // Yield
                    item = this.defineNewRowProperty(row, 'Yield', 0, item);

                    // Working Hrs
                    item = this.defineNewRowProperty(row, 'Working_Hrs', 0, item);
                    // Sub_Line_Name
                    item = this.defineNewRowProperty(row, 'Sub_Line_Name', "", item);
                    // Remote_Site_Cap_Demand
                    item = this.defineNewRowProperty(row, 'Remote_Site_Cap_Demand', 0, item);


                    // GH Site

                    item = this.defineNewRowProperty(row, 'GH_Site', "", item);

                }
                return item;
            },

            onBeforeExportSubLine: function (oEvent) {
                let filteredData = [];
                if (this.getView().byId("SubLineTab").getTable().getSelectedIndices().length !== 0) {

                    let i, j;
                    for (i = 0; i < this.getView().byId("SubLineTab").getTable().getSelectedIndices().length; i++) {
                        let selIndices = this.getView().byId("SubLineTab").getTable().getSelectedIndices()[i];
                        let obj = this.getView().byId("SubLineTab").getTable().getContextByIndex(selIndices).getObject();
                        let exportData = oEvent.getParameter("exportSettings").dataSource.data;
                        for (j = 0; j < exportData.length; j++) {
                            if (obj.CM === exportData[j].CM && obj.Site === exportData[j].Site && obj.Program === exportData[j].Program && obj.Sub_Line_Name == exportData[j].Sub_Line_Name && obj.Uph == exportData[j].Uph) {
                                filteredData.push(exportData[j]);
                            }
                        }
                    }
                    oEvent.getParameter("exportSettings").dataSource.data = filteredData;
                }
                let columns = oEvent.getParameter("exportSettings").workbook.columns;
                this.changeExportDate(columns);

                // passing filters to export in the downloaded file
                if (oEvent.mParameters.userExportSettings.includeFilterSettings) {
                    oDataResp.getExportFilters(oEvent,this);


                }


            },

            // export excel date check

            changeExportDate : function (columns) {
                let n;
                for (n = 0; n < columns.length; n++) {
                    if (columns[n].property === "createdAt" || columns[n].property === "modifiedAt") {
                        columns[n].type = "DateTime";
                        columns[n].utc = false;
                    }
                }
                

            },
            errorTabInit: function (oEvent) {
                let oTable = oEvent.getSource().getTable();
                let aColumns = oTable.getColumns();
                let i;
                for (i = 0; i < aColumns.length; i++) {
                    let sPath = "coaErr>" + aColumns[i].data("p13nData").columnKey;
                    aColumns[i].getTemplate().bindText(sPath);
                }
            },

            createColumns: function () {
                return [
                    {
                        label: "GH_Site",
                        property: "GH_Site"
                    },
                    {
                        label: "Program",
                        property: "Program"
                    },
                    {
                        label: "Sub_Line_Name",
                        property: "Sub_Line_Name"
                    },
                    {
                        label: "Uph",
                        property: "Uph"
                    },
                    {
                        label: "boH_Qty",
                        property: "boH_Qty"
                    },
                    {
                        label: "Working_Hrs",
                        property: "Working_Hrs"
                    },
                    {
                        label: "Remote_Site_Cap_Demand",
                        property: "Remote_Site_Cap_Demand"
                    },
                    {
                        label: "Yield",
                        property: "Yield"
                    },
                    {
                        label: "Comment",
                        property: "Comment"
                    }
                ];
            },

            onTemplateDownload: function (oEvent) {
                try {

                    let oSettings = {
                        workbook: {
                            columns: this.createColumns()
                        },
                        dataSource: [""],
                        fileName: "SubLine.xlsx",
                        count: 0,
                        showProgress: false
                    };
                    jQuery.sap.require("sap.ui.export.Spreadsheet");
                    let oSheet = new sap.ui.export.Spreadsheet(oSettings);
                    oSheet.build().finally(function () {
                        oSheet.destroy();
                    });
                } catch (e) {
                    console.log(e);
                }
            }
            // Smart Table Methods- End
        });
    });
