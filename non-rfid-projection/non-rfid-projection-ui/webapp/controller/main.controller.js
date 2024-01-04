sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../utils/oDataResp"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, MessageToast, MessageBox, Filter, FilterOperator, oDataResp) {
        "use strict";

        return Controller.extend("com.apple.coa.nonrfidprojectionui.controller.main", {
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

                this.getView().setModel(oDataModel);

                this._oSmartTable = this.getView().byId("idnonrfidSmartTble");
                this._oSmartFilterBar = this.getView().byId("idNonRfidFilBar");
                this.changedArray = [];
                //setting local JSON to the view
                this.setJSONModelToView();
            },

            onSFBInitialise: function (oEvent) {
                oEvent.getSource()._oSearchButton.setText("Search");
            },

            /**
            * Method: onCOTbleSearch
            * Description: This method is called when user press on search and refresh button
            **/

            onCOTbleSearch: function (oEvent) {
                let aFilters = this.getView().byId("idNonRfidFilBar").getFilters();
                if(aFilters && aFilters.length !== 0){
                    let oDataModel = this.getOwnerComponent().getModel("MainModel");

                    oDataModel.resetChanges();
                    this.getView().byId("idnonrfidSmartTble").rebindTable();
                    this.getView().byId("idnonrfidSmartTble").setEditable(false);
                    if (this.getOwnerComponent().getModel("device").getProperty("/isMockServer")) {
                        this.getView().byId("idnonrfidSmartTble").setEditable(true);
                        this.refreshAndSetTabletoDisplay();
    
                    }


                }else{
                    sap.m.MessageToast.show("Provide Mandatory Fields in selection");
                }
            },

            TableRowSelectionChange: function (oevt) {
                let selectAll = oevt.getParameters().selectAll;
                let ttModel = this.getOwnerComponent().getModel("mAuthorizedModel");

                if (selectAll === true) {
                    ttModel.setProperty('/TableSlctAll', true);
                }
                else {
                    ttModel.setProperty('/TableSlctAll', false);

                }

            },


            onOpenUploadDialog: function (oEvent, that) {

                if (this.getView().byId("idnonrfidSmartTble").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select at least one record");
                    return;
                }
                Fragment.load({
                    name: "com.apple.coa.nonrfidprojectionui.Fragments.MassUpload",
                    controller: this
                }).then(function name(oFragment) {
                    this._oUploadCoreDialog = oFragment;
                    this.getView().addDependent(this._oUploadCoreDialog);
                    this._oUploadCoreDialog.open();
                }.bind(this));

            },

            /**
            * Method: onMassUpdate
            * Description: This method is called to update the table data on click of update button on fragment
            **/

            onMassUpdate: function (massUpdateValues) {

                let smartTable = this._oSmartTable;
                let i;
                let selectedRows = [];
                selectedRows = smartTable.getTable().getSelectedIndices();
                let allRecordsLoaded = true, chgFlg;
                let chgArray = [];

                if (!massUpdateValues[0] && !massUpdateValues[1] && !massUpdateValues[2] && !massUpdateValues[3]) {
                    sap.m.MessageToast.show("No Changes Made");
                    return;
                }

                let selRowCnt = this.getView().byId("idnonrfidSmartTble").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass reset more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }

                if (smartTable.getTable()._getTotalRowCount() !== selectedRows.length) {

                    for (i = 0; i < selectedRows.length; i++) {
                        let index = selectedRows[i];
                        let rowContext = smartTable.getTable().getContextByIndex(index);

                        if (rowContext) {

                            chgArray =  oDataResp.onMassUpdateCheck(chgArray,rowContext,massUpdateValues);

                            
                            

                        }
                        else {
                            allRecordsLoaded = false;
                            break;
                        }
                    }

                    this.changedArray = chgArray;


                    this.onMasUpdateChkSelAll(allRecordsLoaded, chgFlg);

                } else {
                    allRecordsLoaded = false;                           // select all massupdate case
                    this.onMasUpdateChkSelAll(allRecordsLoaded, chgFlg);
                }

            },


             /**
            * Method: onMassUpdate
            * Description: This method is called to reset the QPL 
            **/

             onQplReset: function () {

                if (this.getView().byId("idnonrfidSmartTble").getTable().getSelectedIndices().length === 0) {
                    sap.m.MessageToast.show("Select Atleast one record");
                    return;
                }
                let selRowCnt = this.getView().byId("idnonrfidSmartTble").getTable().getSelectedIndices().length;
                if (selRowCnt > '5000') {
                    MessageBox.error("You cannot mass reset more than 5000 records.", {
                        title: "System Error"
                    });
                    return;
                }

                let oModel = this.getOwnerComponent().getModel("MainModel");
                let tableRows = this._oSmartTable.getTable().getSelectedIndices();
                let allRecordsLoaded = true;

                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let chckSlcAll = mAuthorizedModel.getProperty('/TableSlctAll');
                if (chckSlcAll === true) {
                    this.MassQPLReset();

                }
                else {

                    for (let i of tableRows) {
                        let index = i,
                            rowContext = this._oSmartTable.getTable().getContextByIndex(index);

                        if (rowContext) {
                            let resetRow = {};
                            resetRow = rowContext.getProperty(rowContext.sPath);

                            this.setModelProperty(oModel, rowContext, resetRow);
                        }


                    }

                    this.onSave(null, false,true);

                }
   
               
            },

            setModelProperty: function (oModel, rowContext, resetRow) {
                if (resetRow.ErrorMsg || resetRow.ErrorMsg === null || resetRow.ErrorMsg === "") {
                    this._oSmartTable.getModel().setProperty(rowContext.sPath + "/ErrorMsg", "ResetQpl");


                }

            },

            MassQPLReset: function () {


                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let that = this;
                let ModelappId = this.getOwnerComponent().getModel("MainModel").getHeaders().appid;
                mAuthorizedModel.setProperty('/ModelappId', ModelappId);
                let appid = this.getOwnerComponent().getModel("MainModel").getHeaders().appid;
                let filters = this.getView().byId("idnonrfidSmartTble").getTable().getBinding("rows").sFilterParams;
                if (filters) {
                    filters = decodeURI(filters.split('$filter=')[1]);
                }
                let OutputData = {};
                OutputData.url = filters;
                OutputData.action = "qpl_reset";
            
                
                OutputData = JSON.stringify(OutputData);
                let oDataURl = this.getAjaxMassQPLResetURL();
                this.getView().setBusy(true);

                $.ajax({
                    url: oDataURl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: OutputData,
                    headers: {
                        "appid": appid
                    },
                    success: function (response) {
                            sap.m.MessageToast.show("Data Saved Successfully");
                            that.getView().setBusy(false);
                            that.onAjaxCallTbleRefresh(that);

                    },

                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.onAjaxCallTbleRefresh(that);
                        oDataResp.checkQplError(oError,that);

                    }
                });

            },

            onAjaxCallTbleRefresh : function(that) {
                that.getView().getModel().resetChanges();
            that.getView().byId("idnonrfidSmartTble").rebindTable();


            },


           
            onMasUpdateChkSelAll: function (allRecordsLoaded, chgFlg) {
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let chckSlcAll = mAuthorizedModel.getProperty('/TableSlctAll');
                if (allRecordsLoaded === false && chckSlcAll === false) {
                    MessageBox.information("Not all Records are loaded on UI.Scroll down slowly to load all the records");
                    return;
                }

                // send the changed data to the ajax call for the mass update block of data
                else if (allRecordsLoaded === true) {
                    this.onSave(null, true);
                }

                else if (chckSlcAll || allRecordsLoaded === false) {
                    this.MassUpdateSelectAll();

                }

            },

            MassUpdateSelectAll: function () {


                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let that = this;
                let ModelappId = this.getOwnerComponent().getModel("MainModel").getHeaders().appid;
                mAuthorizedModel.setProperty('/ModelappId', ModelappId);
                let appid = this.getOwnerComponent().getModel("MainModel").getHeaders().appid;
                let filters = this.getView().byId("idnonrfidSmartTble").getTable().getBinding("rows").sFilterParams;
                if (filters) {
                    filters = decodeURI(filters.split('$filter=')[1]);
                }
                let OutputData = {}, chg = false;

                OutputData.url = filters;
                if (this.massUpdateValues[0].trim() !== '') {
                    chg = true;
                    OutputData.RFID_SCOPE = this.massUpdateValues[0].trim();
                }
                 if (this.massUpdateValues[1] !== '') {
                    chg = true;
                    OutputData.CARRY_OVER = parseInt(this.massUpdateValues[1].trim());

                }
                 if (this.massUpdateValues[2] !== '') {
                    chg = true;
                    OutputData.QPL = parseInt(this.massUpdateValues[2].trim());
                }
                if(this.massUpdateValues[3] !== ''){
                    chg = true;
                    OutputData.DEPT = this.massUpdateValues[3].trim();
                 }

                 if (chg === false) {
                    sap.m.MessageToast.show("No Changes made");
                    return;
                }



                OutputData = JSON.stringify(OutputData);

                let oDataURl = this.getAjaxMassURL();
                this.getView().setBusy(true);

                $.ajax({
                    url: oDataURl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: OutputData,
                    headers: {
                        "appid": appid
                    },
                    success: function (response) {
                        that.getView().setBusy(false);
                        that.getView().getModel().resetChanges();
                        that.getView().byId("idnonrfidSmartTble").rebindTable();
                        if (response === undefined) {
                            sap.m.MessageToast.show("Data Saved Successfully");

                        }
                        else {
                            that.handleFileUploadStatus(response, that, false,true);
                        }


                    },

                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.changedArray = [];
                        let message, messageInfo;
                       
                            try {
                                message = oError.message;
                                if (message === undefined && oError.responseText !== undefined) {
                                messageInfo = JSON.parse(oError.responseText);
                                message = messageInfo.error.message.value;
                            }
                        }

                            catch (e) {
                                message = oError.responseText;
                            }
                        
                        
                        that.onRaiseMessageUpload(message,"ERROR");



                    }
                });

            },

            onRaiseMessageUpload: function (message,icon) {
                MessageBox.show(message, {
                    icon: icon,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",

                    actions: ["OK"]
                });
            },



            updateUi: function (massUpdateValues) {
                this._oSmartTable.setBusy(true);
                this.onMassUpdate(massUpdateValues);
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
                    this.updateUi(this.massUpdateValues);
                }
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

            // To Close the Dialog 
            /**
             * Method: onUploadDialogClse
             * Description: This method is called to close the Fragment Dialog, on click of cancel button
             **/

            onUploadDialogClse: function () {
                this._oUploadCoreDialog.close();
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
                    // 
                    this.changedArray.push(changedRow);

                    this.changedPath.push(sPathArray[0]);
                }
            },

            /**
                * Method: onSave
                * Description: This method is called on click of save button and on mass update and qpl reset
                **/

            onSave: function (status, massUpdate,qplreset) {

                let oModel = this.getOwnerComponent().getModel("MainModel");


                if (jQuery.isEmptyObject(oModel.getPendingChanges()) && (massUpdate === false)) {
                    sap.m.MessageToast.show("No Changes done");
                    return;
                }

                if (!massUpdate ) {
                    this.changedArray = [];
                    let pendingArray = this.removeErrorPendingChanges(oModel);
                    this.fillChangedRowWithTrim(pendingArray);

                }



                let dataArr = [];

                this.changedArray.forEach(function (oItem) {
                    let obj = {};
                    obj.CM = oItem.CM
                    obj.SITE = oItem.SITE;
                    obj.PROGRAM = oItem.PROGRAM;
                    obj.AQID = oItem.AQID;
                    obj.MFR = oItem.MFR;
                    obj.EQUIPMENT_NAME = oItem.EQUIPMENT_NAME;
                    obj.GH_SITE = oItem.GH_SITE;
                    obj.PO_TYPE = oItem.PO_TYPE;
                    obj.STATION = oItem.STATION;
                    obj.GROUP_PRIORITY = oItem.GROUP_PRIORITY;
                    obj.EQUIPMENT_TYPE = oItem.EQUIPMENT_TYPE;
                    obj.DEPT = oItem.DEPT;
                    obj.SCOPE = oItem.SCOPE;
                    obj.LINE = oItem.LINE;
                    obj.UPH = oItem.UPH;
                    obj.CONSUMABLES = oItem.CONSUMABLES;
                    obj.RFID_SCOPE = oItem.RFID_SCOPE;
                    obj.GH_SPL = oItem.GH_SPL;
                    obj.MP_INTENT_QTY = oItem.MP_INTENT_QTY;
                    obj.QPL = oItem.QPL;
                    let QPL = oItem.QPL;
                    if(QPL === ""){
                        obj.QPL = null;

                    }
                    obj.RELEASE_QTY = oItem.RELEASE_QTY;
                    let CARRY_OVER = oItem.CARRY_OVER;
                    obj.CARRY_OVER = parseInt(CARRY_OVER);
                    obj.GROUP = oItem.GROUP;
                    obj.ALT_STATION = oItem.ALT_STATION;
                    obj.PARENT_ITEM = oItem.PARENT_ITEM;
                    obj.LEVEL = oItem.LEVEL;
                    obj.SPARE_QTY = oItem.SPARE_QTY;
                    obj.SPARE_RATE = oItem.SPARE_RATE;
                    obj.BOH = oItem.BOH;

                    dataArr.push(obj);
                });


                let preData = {
                    "NonRFIDData": dataArr,

                };

                let payloadData = JSON.stringify(preData);
                let l_url;
                if(qplreset){
                     l_url = this.getAjaxCallURLQPLreset();


                }else{
                     l_url = this.getAjaxCallURL();

                }

                let appid = this.getOwnerComponent().getModel("MainModel").getHeaders().appid;

                this.getView().setBusy(true);
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

                        that.getView().setBusy(false);
                        that.changedArray = [];
                        that.refreshAndSetTabletoDisplay();
                        let resp;
                       if (response.d.msg) {
                              resp = response.d.msg;
                          }
                        sap.m.MessageToast.show(resp);


                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.changedArray = [];
                        that.getView().getModel().resetChanges();
                        that.getView().byId("idnonrfidSmartTble").rebindTable();
                        if(qplreset== true){
                            oDataResp.checkQplError(oError,that,qplreset);

                        } else if(massUpdate){
                            oDataResp.handleFileUploadError(oError,that,massUpdate);
                        }
                        else {
                            that.handleBatchOdataCallError(oError);

                        }
                      
                    }
                });


            },

            refreshAndSetTabletoDisplay: function () {
                this.selectedIndices = [];
                this.getView().getModel().resetChanges();
                if (this.getView().byId("idnonrfidSmartTble").getModel("sm4rtM0d3l").getProperty("/editable")) {
                    this.getView().byId("idnonrfidSmartTble")._oEditButton.firePress();
                    this.getView().byId("idnonrfidSmartTble").getModel("sm4rtM0d3l").setProperty("/editable", false);
                }
                this.getView().byId("idnonrfidSmartTble").rebindTable();
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




            onFldLiveChange: function (oEvent) {
                let value = oEvent.getSource().getValue();
                let params = oEvent.getParameters();
                let rfIdScope = ["idrfidscope"];
                let idcarryover = ["idInputcarrypver"];
                let idqpl = ["idInputQPL"];
                let regVal = /^(Y|N|^(?=\s*$))$/;
                if (idcarryover.includes(params.id) || idqpl.includes(params.id)) {
                    let regInt = /^[+]?\d*$/;

                    if (regInt.test(value)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Information);
                        oEvent.getSource().setValueStateText("");
                    }
                     else {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                    oEvent.getSource().setValue("");
                    oEvent.getSource().setValueStateText("Only absolute number is accepted");
                }


                } else if (rfIdScope.includes(params.id)) {
                    if (regVal.test(value)) {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Information);
                        oEvent.getSource().setValueStateText("");
                    }
                    else {
                        oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                        oEvent.getSource().setValueStateText("Enter Y or N only");
                        oEvent.getSource().setValue('');
                    }

                }
            },


            getAjaxCallURL: function () {
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let oDataUrl;
                if (mAuthorizedModel.getProperty('/Origin') === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/nonrfid-projection-service/NonRFID_Projection_Action";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/nonrfid-projection-service/NonRFID_Projection_Action";
                }
                return oDataUrl;

            },

            getAjaxCallURLQPLreset: function () {
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let oDataUrl;
                if (mAuthorizedModel.getProperty('/Origin') === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/nonrfid-projection-service/ResetQPL";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/nonrfid-projection-service/ResetQPL";
                }
                return oDataUrl;

            },

            getAjaxMassURL: function () {
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let oDataUrl;
                if (mAuthorizedModel.getProperty('/Origin') === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/nonrfid-projection-service/selectAllMassUpdate";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/nonrfid-projection-service/selectAllMassUpdate";
                }
                return oDataUrl;

            },

            getAjaxMassQPLResetURL: function () {
                let mAuthorizedModel = this.getOwnerComponent().getModel("mAuthorizedModel");
                let oDataUrl;
                if (mAuthorizedModel.getProperty('/Origin') === "corp-apps") {
                    oDataUrl = "/coa-api/v1/coa/nonrfid-projection-service/selectAllResetQPL";
                } else {
                    oDataUrl = "/coa-api-ext/v1/ext/coa/nonrfid-projection-service/selectAllResetQPL";
                }
                return oDataUrl;

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
                let allRecordsLoaded = true, sFilterInUrl;
                try {
                    this.getView().setBusy(true);
                    let i;
                    for (i = 0; i < this._oSmartTable.getTable().getSelectedIndices().length; i++) {
                        let selIndices = this._oSmartTable.getTable().getSelectedIndices()[i];
                        if (this._oSmartTable.getTable().getContextByIndex(selIndices)) {

                            let names = ["CM", "SITE", "PROGRAM", "STATION", "AQID", "UPH", "LINE", "LEVEL", "GROUP_PRIORITY", "MFR"];



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
                    sFilterInUrl = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, this.getOwnerComponent().getModel("MainModel").oMetadata, this.getOwnerComponent().getModel("MainModel").oMetadata._getEntityTypeByPath("/NonRFIDProjectionDetails"));
                } else {
                    sFilterInUrl = this.getView().byId("idnonrfidSmartTble").getTable().getBinding("rows").sFilterParams;
                }
                return sFilterInUrl;
            },

            onBeforeExportNonRfid: function (oEvent) {
                let aFilters = [];

                if (this._oSmartTable.getTable().getSelectedIndices().length !== 0 && this._oSmartTable.getTable().getSelectedIndices().length !== oEvent.getSource().getTable().getBinding("rows").getLength()) {
                    let sFilterInUrl = this.fillFiltersforExport(aFilters);
                    sFilterInUrl = "&" + sFilterInUrl;
                    let serviceUri = this.getOwnerComponent().getModel("MainModel").sServiceUrl;
                    let sPath = serviceUri + "/NonRFIDProjectionDetails?$format=json" + sFilterInUrl;
                    oEvent.getParameter("exportSettings").dataSource.count = this._oSmartTable.getTable().getSelectedIndices().length;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = sPath;
                }

                oDataResp.setLimitOnExport(oEvent,this);


                this.setDateTimeDuringExport(oEvent);
            },

            setDateTimeDuringExport: function (oEvent) {
                oDataResp.setDateTimeDuringExport(oEvent, this);
            },

            validateJSON: function (str) {
                let chckJson = true;
    
                try{
                   JSON.parse(str);
                }catch (e){
                    chckJson =  false;
                }
              
               return chckJson;
             
            },


            /**
      * Method: 
      * 
      * Description: This method is used to open the fragment when user upload the excel file
      * 
      * **/
            setDataAfterFileUpload: function (err, resp, testCase,isMassUpdate) {

                if (!err) {
                    sap.m.MessageBox.success(resp);
                    oDataResp.refreshAfterFileUpload(err,resp,testCase,isMassUpdate,this);
                    
                } else {
                    if(resp[0]){
                    oDataResp.refreshAfterFileUpload(err,resp,testCase,isMassUpdate,this)
                    if(!isMassUpdate && !resp[0].hasOwnProperty("QPL")){
                        Fragment.load({ name: "com.apple.coa.nonrfidprojectionui.Fragments.NonRFID_UploadLog", controller: this }).then(function name(oFragment) {
                            this._uploadRecordLogsPopover = oFragment;
                            this.getView().addDependent(this._uploadRecordLogsPopover);
                            this._uploadRecordLogsPopover.open();
                        }.bind(this));
                    }else{
                    Fragment.load({ name: "com.apple.coa.nonrfidprojectionui.Fragments.NonRFID_LogsDialog", controller: this }).then(function name(oFragment) {
                        this._RecordLogsPopover = oFragment;
                        this.getView().addDependent(this._RecordLogsPopover);
                        this._RecordLogsPopover.open();
                    }.bind(this));
              }
                  
                }
                }
            },


            /**
         * Method: handleUploadPress
         * Description: This method is used for file upload response check 
         **/

            handleUploadPress: function (oEvent) {
                oDataResp.handleUploadPress(oEvent, this);
            },


            //    handleFileUploadStatus
            handleFileUploadStatus: function (response,oController,testCase,isMassUpdate) {
                oDataResp.handleFileUploadStatus(response, this, false,isMassUpdate);
            },

            //    handleFileUploadError
            handleFileUploadError: function (response,that,isMassUpdate) {
                oDataResp.handleFileUploadError(response, this,isMassUpdate);
            },

            //    onChancarOverSmrtble
            onChancarOverSmrtble: function (oEvent) {
                oDataResp.onChancarOverSmrtble(oEvent, this);
            },







            /**
* Method: fnOutput_frag_CloseLog
* Description: This method is used to close the popover 
* 
* **/
            fnOutput_frag_CloseLog: function () {
                this.getView().getModel("NonRfidErrorModel").setProperty("/NonRFIdErrData", []);

                this._RecordLogsPopover.close();

            },

            fnOutput_frag_CloseLogupload: function(){
                this.getView().getModel("NonRfidErrorModel").setProperty("/NonRFIdErrData", []);

                this._uploadRecordLogsPopover.close();
            },

            onAfterErrorClose: function (oEvent) {
                this._RecordLogsPopover.destroy();
            },
            onAfterErrorCloseupload: function(oEvent){
                this._uploadRecordLogsPopover.destroy();
            },


            setJSONModelToView: function () {
                let localModel = new sap.ui.model.json.JSONModel;
                this.getView().setModel(localModel, "NonRfidErrorModel");
                this.getView().getModel("NonRfidErrorModel").setSizeLimit(10000);

            },

            onPressHistory: function () {
                let oView = this.getView();

                if (!this._diaChangeLog) {
                    this._diaChangeLog = Fragment.load({
                        id: oView.getId(),
                        name: "com.apple.coa.nonrfidprojectionui.Fragments.ChangeLog",
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
                    filters: [new Filter("Table", "EQ", "T_COA_NONRFID_PROJECTION")]
                }));
            },
            applyErrorLog: function (oEvent) {

                oDataResp.applyErrorLog(oEvent, this);

            },
            createColumns: function () {
                return [
                    {
                        label: "GH Site",
                        property: "GH_SITE"
                    },
                    {
                        label: "CM Program (3DV)",
                        property: "PROGRAM"
                    },
                    {
                        label: "AQID (non-RFID)",
                        property: "AQID"
                    },
                    {
                        label: "RFID Scope",
                        property: "RFID_SCOPE"
                    },
                    {
                        label: "Carry Over Qty",
                        property: "CARRY_OVER"
                    }
                ];
            },

            createColumnsQPL: function(){
                return [
                    {
                        label: "GH Site",
                        property: "GH_SITE"
                    },
                    {
                        label: "CM Program (3DV)",
                        property: "PROGRAM"
                    },
                    {
                        label: "UPH",
                        property: "UPH"
                    },
                    {
                        label: "Line Type",
                        property: "LINE"
                    },
                    {
                        label: "AQID (non-RFID)",
                        property: "AQID"
                    },
                    {
                        label: "Short AQID",
                        property: "SHORT_NAME"
                    },
                    {
                        label: "Parent Item",
                        property: "PARENT_ITEM"
                    },
                    {
                        label: "Scope",
                        property: "SCOPE"
                    },
                    {
                        label: "Alternate Station",
                        property: "ALT_STATION"
                    },
                    {
                        label: "Projected Station",
                        property: "STATION"
                    },
                    {
                        label: "Group Priority",
                        property: "GROUP_PRIORITY"
                    },
                    {
                        label: "Equipment Type",
                        property: "EQUIPMENT_TYPE"
                    },
                    {
                        label: "RFID Scope",
                        property: "RFID_SCOPE"
                    },
                    {
                        label: "QPL",
                        property: "QPL"
                    },
                    {
                        label: "SPL",
                        property: "SPL"
                    },
                    {
                        label: "MP Intent Qty",
                        property: "MP_INTENT_QTY"
                    },
                    {
                        label: "Spare Rate",
                        property: "SPARE_RATE"
                    },
                    {
                        label: "Spare Qty",
                        property: "SPARE_QTY"
                    },
                    {
                        label: "Consumables",
                        property: "CONSUMABLES"
                    },
                    {
                        label: "PO Type",
                        property: "PO_TYPE"
                    },
                    {
                        label: "Equipment Name",
                        property: "EQUIPMENT_NAME"
                    },
                    {
                        label: "MFR",
                        property: "MFR"
                    },
                    {
                        label: "Display Name",
                        property: "DISPLAY_NAME"
                    },
                    {
                        label: "Department",
                        property: "DEPT"
                    },
                    {
                        label: "Category",
                        property: "CATEGORY"
                    }

                ];
            },

            onTemplateDownload: function(oEvent){
                let key = oEvent.getSource().getProperty("key");

                let date = new Date();
                let pstTime = new Date(date.toLocaleString("en-US", {
                    timeZone: "America/Los_Angeles"
                }));
                let oOutFormat1 = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "yyyy-MM-ddTHHmmss"
                });
                pstTime = oOutFormat1.format(pstTime,false);
                let selectAll = this.getOwnerComponent().getModel("mAuthorizedModel").getProperty("/TableSlctAll");
                // select all records
                if(selectAll){
                    oDataResp.selectAllTemplateDownload(pstTime,this,key);
                } else if(this._oSmartTable.getTable().getSelectedIndices().length === 0){  // No records selected.
                    oDataResp.selectAllTemplateDownload(pstTime,this,key)
                }else{                                                                      // block of records download 
                    let downloadData = oDataResp.prepareDownloadData(this,key);
                    let selRows = downloadData[0];
                    let allRecordsLoaded = downloadData[1];
                    if(allRecordsLoaded){
                        oDataResp.blockTemplateDownload(selRows,pstTime,this,true,key);
                    }else{
                        oDataResp.selectAllTemplateDownload(pstTime,this,key)
                    }
                }
        },
        onSmartTableInit: function(oEvent){
            let table = oEvent.getSource().getTable();
            let columns = table.getColumns();
            let i;
            for (i = 0; i < columns.length; i++) {
                if (columns[i].data("p13nData").columnKey === "DEPT") {
                    columns[i].setWidth("12rem");
                }

            }

        }
            
        });
    });
