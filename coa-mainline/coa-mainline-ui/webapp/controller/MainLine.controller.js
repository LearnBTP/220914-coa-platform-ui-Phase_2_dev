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
        return Controller.extend("coamainlineui.controller.MainLine", {
            onInit: function () {

                let oDataModel = this.getOwnerComponent().getModel("oDataModel");
                let oJsonMainLine = new JSONModel([]);
                this.getView().setModel(oDataModel);
                this.getView().setModel(oJsonMainLine, "coa");
                this.getView().getModel("coa").setProperty("/BtnEnable", false);
                this.getView().getModel("coa").setProperty("/RefreshEnable", false);
                let roleScopes = this.getOwnerComponent().getModel().getProperty('/AuthorizationScopes');
                this.changedArray = [];
                for (let role of roleScopes) {
                    if (role.includes('MainLineModify')) {
                        access.read = true;
                        access.edit = true;
                    }
                    if (role.includes('MainLineReadOnly')) {
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
            },
            handleUploadPress: function (oEvent) {
                oDataResp.handleUploadPress(oEvent, this);
            },
            onChange: function (oEvent) {
                let params = oEvent.getParameters();
                let NumberFld = ["Uph", "BoH", "Fatp_Sustaining_Qty", "Working_Hrs", "Efficiency_Field"]
                if (NumberFld.includes(params.id)) {
                    let regInt = /^-?\d*$/;
                    if (regInt.test(params.newValue)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValueStateText("Enter Valid Number");
                        oEvent.getSource().setValue('');
                    }
                }
            },

            handleFileUploadStatus: function (response, that) {
                oDataResp.handleFileUploadStatus(response, that);
            },
            onErrCloseDialog: function (oEvent) {
                this._oDialogErr.close();
            },
            onAfterErrorClose: function (oEvent) {
                this._oDialogErr.destroy();
            },
            onPressHistory: function (oEvent) {
                sap.ui.core.Fragment.load({
                    name: "coamainlineui.Fragments.History",
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
            onDelete: function (oEvent) {
                let selIndices = this.getView().byId("MainLineTab").getTable().getSelectedIndices();
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
                let selIndices = this.getView().byId("MainLineTab").getTable().getSelectedIndices();
                let tabData = this.getView().getModel("coa").getProperty("/MainLine");
                let table = this.getView().byId("MainLineTab").getTable();
                let oDataModel = this.getView().getModel();
                let delRecExc;
                let count = 0, idx;
                oDataModel.setDeferredGroups(["DeleteMainLine"]);
                oDataModel.setRefreshAfterChange(false);
                let appid = this.getOwnerComponent().getModel().getProperty('/Appid');
                oDataModel.setHeaders({ prefer: 'odata.continue-on-error', appid: appid });
                
                for (let selidx of selIndices) {
                    let oRowObj = table.getContextByIndex(selidx);
                    let oRowData = oRowObj.getObject();
                    idx = Number(oRowObj.sPath.split("/")[2]);
                    if (oRowData && oRowData.flgChg !== undefined && oRowData.flgChg === 'C') {
                        tabData[idx].delete = true;
                        count++;
                    } else {
                        let sPath = "/CarryoverMainline(CM='" + oRowData.CM + "',Site='" + oRowData.Site +
                            "',Program='" + oRowData.Program + "')";
                            sPath = sPath.replace(/Uph='(.*?)'/g, "Uph=$1");
                        delRecExc = true;
                        count++;
                        tabData[idx].delete = true;
                        let chgid = "removemainLine" + count;
                        oDataModel.remove(sPath, {
                            changeSetId: chgid,
                            groupId: "DeleteMainLine"
                        });
                    }
                }
                if (delRecExc) {
                    this.getView().setBusy(true);
                    let that = this;
                    oDataModel.submitChanges({
                        groupId: "DeleteMainLine",
                        success: function (data, resp) {
                            that.getView().setBusy(false);
                                that.handleSaveSuccess(data,resp,true); 
                        },
                        error: function (err) {
                            that.getView().setBusy(false);
                            that.odataCommonErrorDisplay(err);
                        }
                    });
                }
               
            },


            odataCommonErrorDisplay: function (oEvent) {
                try {
                    let response = oEvent.getParameters().response
                    MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                        title: "System Error",
                        details: `${response.responseText} ${response.message}`
                    });
                }
                catch (e) {
                    this.onRaiseMessage("Communication Error", "ERROR");
                }
            },
            // Mass Upload Methods- Start
            onMassUpdate: function (oEvent) {
                let selIndices = this.getView().byId("MainLineTab").getTable().getSelectedIndices();
                if (selIndices.length === 0) {
                    MessageToast.show("Please select the records for mass update");
                    return;
                }
                if (selIndices.length > '5000') {
                    MessageBox.error("You cannot mass update more than 5000 records.", {
                        title: "System Error",
                    });
                    return;
                }
                sap.ui.core.Fragment.load({
                    name: "coamainlineui.Fragments.MassUpload",
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
                this.onDialofClose();
            },
            onAfterDilogClose: function (oEvent) {
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

                let smartTable = this.getView().byId("MainLineTab").getTable();
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getSelectedIndices();
                let tabOdata = this.getView().getModel("coa").getProperty("/MainLine");
                let chg;
                    for (i = 0; i < selectedRows.length; i++) {
                        let index = selectedRows[i];
                        let rowContext = smartTable.getContextByIndex(index);
                        if (rowContext) {
                            let path = rowContext.sPath.split("/")[2];
                            chg = this.updateChgRowTabData(tabOdata, path);
                        }
                        if (chg === false) {
                            break;
                        }
                    }

                // send the changed data to the ajax call for the mass update
                
                    if (chg === true) {
                        this.postMassUpdate();
                    } else {
                        MessageToast.show("No Changes made");
                    }
            },
           
            postMassUpdate: function () {
                let that = this;

                let dataArr = [];
                this.changedArray.forEach(function (oItem) {
                    let obj = {};

                    obj.BoH = oItem.BoH;
                    obj.CM = oItem.CM;
                    obj.Comment = oItem.Comment;
                    obj.Efficiency_Field = oItem.Efficiency_Field;
                    obj.Error = oItem.Error;
                    obj.Fatp_Sustaining_Qty = oItem.Fatp_Sustaining_Qty;
                    obj.GH_Site = oItem.GH_Site;
                    obj.Program = oItem.Program;
                    obj.SAP_CM_Site = oItem.SAP_CM_Site;
                    obj.Site = oItem.Site;
                    obj.Uph = oItem.Uph;
                    obj.Working_Hrs = oItem.Working_Hrs;
                    obj.createdAt = oItem.createdAt;
                    obj.createdBy = oItem.createdBy;
                    obj.modifiedAt = oItem.modifiedAt;
                    obj.modifiedBy = oItem.modifiedBy;
                    dataArr.push(obj);
                });
                let preData = {
                    "Mainlinedata": dataArr
                };
                let payloadData = JSON.stringify(preData);
                let oDataUrl;

                if (that.getOwnerComponent().getModel().getProperty('/Origin') === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/lineplan-services/lineplan/mainline_action";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/lineplan-services/lineplan/mainline_action";
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

            updateChgRowTabData: function (tabOdata, path) {
                path = parseInt(path);

                let obj = JSON.parse(JSON.stringify(tabOdata[path]));
                let chg = false;
                for (let j = 0; j < this.massUpdateValues.length; j++) {
                    let value = this.massUpdateValues[j].trim();
                    if (value && this.inputFields[j].getId() === "IUph") {
                        chg = true;
                        obj.Uph = parseInt(value);
                    }
                    else if (value && this.inputFields[j].getId() === "IBoH") {
                        chg = true;
                        obj.BoH = parseInt(value);
                    }
                    else if (value && this.inputFields[j].getId() === "ISustnQty") {
                        chg = true;
                        obj.Fatp_Sustaining_Qty = parseInt(value);
                    }
                    else if (value && this.inputFields[j].getId() === "IWHrs") {
                        chg = true;
                        obj.Working_Hrs = parseInt(value);
                    }
                    else if (value && this.inputFields[j].getId() === "Efficiency") {
                        chg = true;
                        obj.Efficiency_Field = parseInt(value);
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

            setCellValueState: function (row, fldName, Color) {
                let cols = row.getCells();
                for (let col of cols) {
                    if (col.getMetadata().getPublicMethods().includes("getEdit") === false) {
                        continue;
                    }
                    let path = col.getEdit().getBindingPath("value");
                    if (fldName !== "" && path === fldName) {
                        col.getEdit().setValueState(Color);
                        col.getEdit().setValueStateText("");
                        break;
                    } else if (fldName === "ALLCELLS") {
                        col.getEdit().setValueState(Color);
                        col.getEdit().setValueStateText("");
                    }
                }
            },

            onDialofClose: function (oEvent) {

                this._oDialogMassUpload.close();
            },
            onMLMUClose: function (oEvent) {
                this._oDialogMassUpload.close();
            },
            onAfterMassUpdateClose: function (oEvent) {
                this._oDialogMassUpload.destroy();
            },
            // Mass Upload Methods- End
            applyTableLogFilter: function (oEvent) {
                oDataResp.applyTableLogFilter(oEvent,this);
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

                let oDataModel = this.getView().getModel();
                if (access.read === true || access.edit === true) {
                    this.getView().setBusy(true);
                    //Remove Filter, Sorters
                    if (this.getView().byId('MainLineTab')) {
                        this.getView().byId('MainLineTab').applyVariant({});
                    }
                    oDataModel.read("/CarryoverMainline", {
                        context: null,
                        filters: aFilter,
                        sorters: null,
                        success: function (oData) {
                            this.getView().setBusy(false);
                            this.getView().getModel("coa").setProperty("/MainLine", oData.results);
                            this.setTableToDisplay();
                            this.getView().getModel("coa").setProperty("/RefreshEnable", false);
                            if (oData.results.length >= 1) {
                                this.getView().getModel("coa").setProperty("/RefreshEnable", true);
                            }
                        }.bind(this),
                        error: function (oError) {
                            this.getView().setBusy(false);
                            this.odataCommonErrorDisplay(oError);
                        }.bind(this)
                    });
                } else {
                    MessageToast.show("No Authorization!");
                }

            },
            //Smart Filter Bar Events: End//
            // Smart Table Methods- Start
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
            onSmartTableInit: function (oEvent) {
                let oTable;
                if (oEvent) {
                    oTable = oEvent.getSource().getTable();
                } else {
                    oTable = this.getView().byId("MainLineTab").getTable();
                }
                let aColumns = oTable.getColumns();
                let Keys = ["Program", "GH_Site"];

                let NonEdit = ["CM", "Site", "createdAt", "createdBy", "modifiedBy", "modifiedAt", "Error","modifiedBy_Name","modifiedBy_mail","createdBy_Name","createdBy_mail","Edit"];
                for (let acol of aColumns) {
                    let sPath = "coa>" + acol.data("p13nData").columnKey;
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
            },
            onFldLiveChange: function (oEvent) {
                let value = oEvent.getSource().getValue();
                let newVal = oEvent.mParameters.newValue;
                old_value = oEvent.getSource().getLastValue();
                let field = oEvent.getSource().getBindingInfo("value")["binding"].getPath();
                let UpperCase = ["Program"];
                let NumberFld = ["Uph", "BoH", "Fatp_Sustaining_Qty", "Working_Hrs", "Efficiency_Field"]
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
                let tabData = this.getView().getModel("coa").getProperty("/MainLine");
                let oDataModel = this.getOwnerComponent().getModel("oDataModel");
                this.getView().setModel(oDataModel);
                oDataModel.setDeferredGroups(["MainLine"]);
                oDataModel.setRefreshAfterChange(false);
                let that = this;
                let appid = this.getOwnerComponent().getModel().getProperty('/Appid');
                oDataModel.setHeaders({ prefer: 'odata.continue-on-error', appid: appid });

                let cnt = 0;
                for (let row of tabData) {
                    cnt++;
                    if (row.flgChg !== undefined && row.flgChg === 'U') {
                        callOdata = true;
                        let sPath = "/CarryoverMainline(CM='" + row.CM + "',Site='" + row.Site +
                            "',Program='" + row.Program + "')";
                        putData = this.prepareMainLineData(row, row.flgChg);
                        let chgid = "updateMainLine" + cnt;
                        oDataModel.update(sPath, putData, {
                            changeSetId: chgid,
                            groupId: "MainLine"
                        });
                    }
                    else if (row.flgChg !== undefined && row.flgChg === "C") {
                        callOdata = true;
                        let changeSet = "createMainline" && cnt;
                        putData = this.prepareMainLineData(row, row.flgChg);
                        oDataModel.create("/CarryoverMainline", putData, {
                            changeSetId: changeSet,
                            groupId: "MainLine"
                        });
                    }
                }
                if (callOdata === true) {
                    this.getView().setBusy(true);
                    oDataModel.submitChanges({
                        groupId: "MainLine",
                        success: function (oData, resp) {
                            that.handleSaveSuccess(oData, resp,false);
                        }.bind(this),
                        error: function (oError) {
                            that.getView().setBusy(false);
                            that.odataCommonErrorDisplay(oError);
                        }
                    });
                } else {
                    MessageToast.show("No changes done");
                }
            },
            handleSaveSuccess: function (oData, resp,deleteFag) {
                this.getView().setBusy(false);
                let errFlag = false, succFlg = false;
                let returnVar;
                if (resp.data && resp.data.__batchResponses) {
                    let tabData = this.getView().getModel("coa").getProperty("/MainLine");
                    for (let batchResLine of resp.data.__batchResponses) {
                        if (batchResLine.response && batchResLine.response.statusCode) {
                            returnVar = this.updateBatchCreateResponse(errFlag, succFlg, batchResLine.response, tabData,deleteFag);
                            errFlag = returnVar[0];
                            succFlg = returnVar[1];
                            tabData = returnVar[2];
                        } else if (batchResLine.__changeResponses) {
                            returnVar = this.updateBatchChangeResponse(batchResLine.__changeResponses, tabData);
                            if (!succFlg) {
                                succFlg = returnVar[0];
                            }
                            tabData = returnVar[1];
                        }
                    }
                    this.getView().getModel("coa").setProperty("/MainLine", tabData);
                    this.getView().byId("MainLineTab").getModel("coa").refresh(true);
                    oDataResp.handleSaveResponse(succFlg,errFlag,this);
                }
                
                if(deleteFag){
                    oDataResp.raiseDeleteStatus(errFlag,succFlg,this);

                }else {
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
                    this.onSearch();
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
            updateBatchCreateResponse: function (errFlag, succFlg, response, tabData,deleteFag) {
                let strMessage, respData, row;
                if (response.statusCode >= 400 && response.statusCode <= 499) {
                    try {
                        errFlag = true;
                        strMessage = JSON.parse(response.body).error.message.value;
                        respData = JSON.parse(strMessage);
                        if(deleteFag){
                            row = tabData.find(el => el.CM === respData.CM &&  el.Site === respData.Site && el.Program === respData.Program
                                );

                        }else if (respData.hasOwnProperty("GH_Site")){
                            row = tabData.find(el => el.GH_Site === respData.GH_Site &&
                            el.Program === respData.Program && el.flgChg === 'C');

                        }
                        else if(respData.hasOwnProperty("Site")){
                            row = tabData.find(el => el.CM === respData.CM  &&  el.Site === respData.Site  && el.Program === respData.Program
                                && el.flgChg === 'U');
                        } 
                        if (row !== undefined) {
                            row.Error = respData.Error;                    
                         
                        }
                    }
                    catch (err) {
                        this.onRaiseMessage("Unexpected System Error. Please Contact Technical Support");
                    }
                }
                else if (response.statusCode >= 200 && response.statusCode <= 299) {
                    succFlg = true;
                }
                return [errFlag, succFlg, tabData];
            },
            updateBatchChangeResponse: function (response, tabData) {
                let respData, row, succFlg = false;
                let fRowIdx = this.getView().byId("MainLineTab").getTable().getFirstVisibleRow();
                for (let resItm of response) {
                    if (resItm.statusCode[0] === '2') {
                        succFlg = true;
                        if (resItm.data) {
                            respData = resItm.data;
                            let idx = tabData.findIndex(el => el.CM === respData.CM && el.Site === respData.Site && el.Program === respData.Program)
                            row = tabData[idx];
                            idx = idx - fRowIdx;
                            if (row !== undefined) {
                                row.modifiedAt = respData.modifiedAt;
                                row.createdAt = respData.createdAt;
                                row.modifiedBy = respData.modifiedBy;
                                row.createdBy = respData.createdBy;
                                row.flgChg = '';
                                row.Error = '';
                                row.chgFields = [];
                            }
                        }
                    }
                }
                return [succFlg, tabData];
            },
            setTableToDisplay: function () {
                let tabData = this.getView().getModel("coa").getProperty("/MainLine");
                for (let item of tabData) {
                    item.KEdit = false;
                    item.NKEdit = false;
                    item.flgChg = "";
                    item.chgFields = [];
                }
                this.getView().getModel("coa").setProperty("/MainLine", tabData);
                this.getView().byId("MainLineTab").getModel("coa").refresh(true);
                this.getView().byId("MainLineTab").rebindTable();
                this.getView().byId("MainLineTab").getTable().clearSelection();
                if (this.getView().byId("MainLineTab").getEditable() === true) {
                    this.getView().byId("MainLineTab")._oEditButton.firePress();
                    this.getView().byId("MainLineTab").getModel("sm4rtM0d3l").setProperty("/editable", false);
                }
                let oTable = this.getView().byId("MainLineTab").getTable();
                let rows = oTable.getRows();

                for (let row of rows) {
                    this.setCellValueState(row, oTable, "ALLCELLS", "None");
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
                let NumberFld = ["Uph", "BoH", "Fatp_Sustaining_Qty", "Working_Hrs", "Efficiency_Field"]
                let regInt = /^-?\d*$/;
                if (newVal && newVal !== '' && UpperCase.includes(field)) {
                    row[field] = newVal.toUpperCase();
                } else if (NumberFld.includes(field)) {
                    if (regInt.test(newVal) === false || newVal === '') {
                        row[field] = old_value;
                    }
                }
                old_value = '';
                oEvent.getParameter("changeEvent").getSource().setValueState(sap.ui.core.ValueState.Information);
                oEvent.getParameter("changeEvent").getSource().setValueStateText("");
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
                let row = oEvent.getParameter("changeEvent").getSource().getBindingInfo("value")["binding"].getContext().getObject();
                let field = oEvent.getParameter("changeEvent").getSource().getBindingInfo("value")["binding"].getPath();
                let newVal = oEvent.getParameter("changeEvent").getParameter("newValue");

                this.setDataAsPerType(row, field, newVal, oEvent);
            },
            onEditToggle: function (oEvent) {
                let tabData = this.getView().getModel("coa").getProperty("/MainLine");
                if (tabData !== undefined) {
                    for (let tabItm of tabData) {
                        tabItm.NKEdit = (oEvent.getParameter("editable") && tabItm.Edit === 7);
                        if (tabItm.flgChg === 'C') {
                            tabItm.KEdit = oEvent.getParameter("editable");
                        }
                    }
                    this.getView().getModel("coa").setProperty("/MainLine", tabData);
                    this.getView().byId("MainLineTab").getModel("coa").refresh(true);
                }
                this.getView().getModel("coa").setProperty("/BtnEnable", oEvent.getParameter("editable"));
            },
            onAddRec: function (oEvent) {
                let tabData = this.getView().getModel("coa").getProperty("/MainLine");
                if (tabData === undefined) {
                    tabData = [];
                }
                let newRec = this.prepareMainLineData({}, "C");
                newRec.NKEdit = true;
                newRec.KEdit = true;
                newRec.flgChg = 'C';
                tabData.unshift(newRec);

                this.getView().getModel("coa").setProperty("/MainLine", tabData);
                this.getView().byId("MainLineTab").getModel("coa").refresh(true);
                this.getView().byId("MainLineTab").rebindTable();
                MessageToast.show("New Line created at top Please enter values");

            },
            onCopyRec: function (oEvent) {
                let tabData = this.getView().getModel("coa").getProperty("/MainLine");
                let selIndices = this.getView().byId("MainLineTab").getTable().getSelectedIndices();
                if (selIndices && selIndices.length === 0) {
                    MessageToast.show("Please select atleast one record to copy");
                    return;
                }
                let copyData = [], CopyIndex = [], copiedTabData;
                for (let selIdx of selIndices) {
                    let row = this.getView().byId("MainLineTab").getTable().getContextByIndex(selIdx).getObject();
                    let newRec = this.prepareMainLineData(row, "C");
                    newRec.NKEdit = true;
                    newRec.KEdit = true;
                    newRec.flgChg = 'C';
                    copyData.push(newRec);
                    CopyIndex.push(selIdx);
                }
                if(copyData.length !==0){
                     copiedTabData = this.copyAndRepTbleData(tabData,CopyIndex,copyData);
                 }

                this.getView().getModel("coa").setProperty("/MainLine", copiedTabData);
                this.getView().byId("MainLineTab").getModel("coa").refresh(true);
                this.getView().byId("MainLineTab").rebindTable();
                MessageToast.show("Line copied, Please provide unique key combination");

            },

            copyAndRepTbleData : function(OriginalArr, copyIndices, copiedValues) {
                let resultArray = [],i;
              
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
            prepareMainLineData: function (row, mode) {
                let item = {};
                if (mode === 'U' && row.chgFields) {
                    for (let rowItm of row.chgFields) {
                        item[rowItm] = row[rowItm];
                    }
                } else if (mode === 'C') {
                    // BoH
                    item = this.defineNewRowProperty(row, 'BoH', 0, item);
                    //CM site is not required to send to the backend

                    // Comment
                    item = this.defineNewRowProperty(row, 'Comment', "", item);
                    // Efficiency field
                    item = this.defineNewRowProperty(row, 'Efficiency_Field', 0, item);
                    // Fatp_Sustaining_Qty
                    item = this.defineNewRowProperty(row, 'Fatp_Sustaining_Qty', 0, item);
                    // Program
                    item = this.defineNewRowProperty(row, 'Program', "", item);
                    // Site is not required to send to the backend

                    // Uph
                    item = this.defineNewRowProperty(row, 'Uph', 0, item);
                    // Working Hrs
                    item = this.defineNewRowProperty(row, 'Working_Hrs', 0, item);

                    // GH Site

                    item = this.defineNewRowProperty(row, 'GH_Site', "", item);

                }
                return item;
            },
            onBeforeExportMainLine: function (oEvent) {
                let filteredData = [];
                if (this.getView().byId("MainLineTab").getTable().getSelectedIndices().length !== 0) {
                    let i, j;
                    for (i = 0; i < this.getView().byId("MainLineTab").getTable().getSelectedIndices().length; i++) {
                        let selIndices = this.getView().byId("MainLineTab").getTable().getSelectedIndices()[i];
                        let obj = this.getView().byId("MainLineTab").getTable().getContextByIndex(selIndices).getObject();
                        let exportData = oEvent.getParameter("exportSettings").dataSource.data;
                        for (j = 0; j < exportData.length; j++) {
                            if (obj.CM === exportData[j].CM && obj.Site === exportData[j].Site && obj.Program === exportData[j].Program) {
                                filteredData.push(exportData[j]);
                            }
                        }
                    }
                    oEvent.getParameter("exportSettings").dataSource.data = filteredData;
                }
            
                let columns = oEvent.getParameter("exportSettings").workbook.columns
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
                        label: "Uph",
                        property: "Uph"
                    },
                    {
                        label: "BoH",
                        property: "BoH"
                    },
                    {
                        label: "Fatp_Sustaining_Qty",
                        property: "Fatp_Sustaining_Qty"
                    },
                    {
                        label: "Working_Hrs",
                        property: "Working_Hrs"
                    },
                    {
                        label: "Efficiency_Field",
                        property: "Efficiency_Field"
                    },
                    {
                        label: "Comment",
                        property: "Comment"
                    }
                ];
            },

            onTemplateDownload: function(oEvent){
                try {
                    let oSettings = {
                        workbook: {
                            columns: this.createColumns()
                        },
                        dataSource: [""],
                        fileName: "MainLine.xlsx",
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
