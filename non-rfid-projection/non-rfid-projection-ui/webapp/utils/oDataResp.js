sap.ui.define([], function () {
    "use strict";
    return {
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
            let appid = that.getOwnerComponent().getModel("MainModel").getHeaders().appid;
            if (mAuthorizedModel.getProperty('/Origin') === "corp-apps") {
                l_url = "/coa-api/v1/coa/nonrfid-projection-service/Upload_NonRFID_Projection/csv";

            }
            else {
                l_url = "/coa-api-ext/v1/ext/coa/nonrfid-projection-service/Upload_NonRFID_Projection/csv";
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

                    that.handleFileUploadError(err, that,false);
                },
            };
            $.ajax(settings).done(function (response, data) {
                that.getView().setBusy(false);
                that.getView().byId("fileUploader").clear();
                that.handleFileUploadStatus(response, that, false,false);
            });
        },

        handleFileUploadError: function (response, that,isMassUpdate) {

            let err = false, resp, valResp,valRespChk ;
            if (response.responseJSON !== undefined) {
                if (response.responseJSON.msg) {

                    valRespChk = that.validateJSON(response.responseJSON.msg);
                    valResp = valRespChk;

                    if (valResp){
                        if(isMassUpdate){
                            resp = JSON.parse(JSON.parse(response.responseJSON.msg));
                        }else{
                            resp = JSON.parse(response.responseJSON.msg);
                        }
                        if (response && resp && Array.isArray(resp)) {
                            for (let item of resp) {
                                if (item.ErrorMsg && item.ErrorMsg !== "") {
                                    err = true;
                                }
                            }
                            if (err) {
                                let localModel = that.getView().getModel("NonRfidErrorModel");
                                localModel.setProperty("/NonRFIdErrData", resp);
                            }
                            that.setDataAfterFileUpload(err, resp, false,isMassUpdate);
                        }else{
                            sap.m.MessageBox.error(resp);
                            return;
                        }

                    }
                    if(!valResp){
                        resp = response.responseJSON.msg;
                        sap.m.MessageBox.error(resp);

                    }


                }
                else if (response.responseJSON.message){
                    resp = response.responseJSON.message;
                    code =  response.responseJSON.code;
                    if (code === "Bad Request"){
                     sap.m.MessageBox.error(resp);
                    }


                }



            }
            else {
                resp = response.responseText;
                sap.m.MessageBox.error(resp);
            }



        },

        checkQplError : function (oError,that,qplreset) {

            if (oError.responseJSON && oError.responseJSON.msg.includes("Nothing to Update")){
                sap.m.MessageToast.show("Nothing to Update");
                return;

            }
            else {
                this.handleFileUploadError(oError,that,qplreset);

            }


        },


        onMassUpdateCheck: function (chgArray, rowContext, massUpdateValues) {

            let chgRow = {};
            chgRow = JSON.parse(JSON.stringify(rowContext.getProperty(rowContext.sPath)));
            if (massUpdateValues[0] !== "") {
                chgRow.RFID_SCOPE = massUpdateValues[0];
            }
             if (massUpdateValues[1] !== "") {
                chgRow.CARRY_OVER = massUpdateValues[1];

            }
             if (massUpdateValues[2] !== "") {
                chgRow.QPL = massUpdateValues[2];
            }

            if(massUpdateValues[3] !== ""){
                chgRow.DEPT = massUpdateValues[3];
            }

            chgArray.push(chgRow);

            return chgArray;



        },




        handleFileUploadStatus: function (response, that, testCase,isMassUpdate) {
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
                    let localModel = that.getView().getModel("NonRfidErrorModel");
                    localModel.setProperty("/NonRFIdErrData", resp);
                }
                that.setDataAfterFileUpload(err, resp, testCase,isMassUpdate);
            }
            else {
                that.setDataAfterFileUpload(false, resp, false,isMassUpdate);

               // sap.m.MessageBox.information(resp);
             //   that.getView().byId("OTBRefresh").firePress();
                //   that.onCOTbleSearch();

            }
        },
        applyErrorLog: function (oEvent, that) {
            let oTable;
            oTable = oEvent.getSource().getTable();
            let aColumns = oTable.getColumns();
            let i;
            for (i = 0; i < aColumns.length; i++) {
                let sPath = "NonRfidErrorModel>" + aColumns[i].data("p13nData").columnKey;
                aColumns[i].getTemplate().bindText(sPath);
                aColumns[i].setWidth("10rem");
                if (aColumns[i].data("p13nData").columnKey === "ErrorMsg") {
                    aColumns[i].setWidth("25rem");
                }
            }
        },

        onChancarOverSmrtble: function (oEvent, that) {
            let params = oEvent.getParameters();
            let old_value = oEvent.getSource().getLastValue();
            let regInt = /^[+]?\d*$/;
            let chacolumn = oEvent.getSource();
            let regStr = /^(Y|N|^(?=\s*$))$/;

            if (oEvent.getSource().sId.includes("idcarryoveripput") || oEvent.getSource().sId.includes("idqplipput") || oEvent.getSource().sId.includes("idInputcarrypver") || oEvent.getSource().sId.includes("idInputQPL")) {
                if (regInt.test(params.newValue)) {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                    oEvent.getSource().setValueStateText("");
                }
                else {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                    oEvent.getSource().setValue(old_value);
                    oEvent.getSource().setValueStateText("Only absolute number is accepted");
                }

            }
            if (oEvent.getSource().sId.includes("idrfidscopeinpt")) {
                if (regStr.test(params.newValue)) {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                    oEvent.getSource().setValueStateText("");
                }
                else {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                    oEvent.getSource().setValue(old_value);
                    oEvent.getSource().setValueStateText("Enter Y or N only");
                }

            }




            function message() {
                chacolumn.setValueState(sap.ui.core.ValueState.None);
                chacolumn.setValueStateText("");
            }
            setTimeout(message, 3000);

        },

        setDateTimeDuringExport: function (oEvent, that) {
            let i;
            let columns = oEvent.getParameter("exportSettings").workbook.columns
            for (i = 0; i < columns.length; i++) {
                if (columns[i].property === "createdAt" || columns[i].property === "modifiedAt") {
                    columns[i].type = "DateTime";
                    columns[i].utc = false;
                    columns[i].timezone = "PST";
                }
            }
        },

        setLimitOnExport: function(oEvent,that){
        if (oEvent.getParameter("exportSettings").dataSource.count > 50000) {
            oEvent.getParameter("exportSettings").dataSource.count = 50000;
            oEvent.getParameter("exportSettings").dataSource.dataUrl = oEvent.getParameter("exportSettings").dataSource.dataUrl + '&$top=50000&$skip=0';
            sap.m.MessageToast.show("Record Count is greater than 50K.Only First 50K will be downloaded");
        }
        },
        prepareDownloadData: function(that){
            let selIndices = that._oSmartTable.getTable().getSelectedIndices();
            let allRecordsLoaded = true,sSelBindingPath=[],selRows=[];
            
            for (let i of selIndices) {
                if (that._oSmartTable.getTable().getContextByIndex(i)) {
                    let rowContext = that._oSmartTable.getTable().getContextByIndex(i);
                    let sPath = rowContext.sPath;
                    sSelBindingPath.push(sPath);
                    let obj = that._oSmartTable.getModel().getProperty(sPath);
                    selRows.push(obj);
                    
                } else{
                    allRecordsLoaded = false;
                    break;
                }
            }
            return [selRows,allRecordsLoaded];

        },

        blockTemplateDownload: function(selRows,pstTime,that,showProgress,key){
            let filename;
            let downloadRows,columns;
            if(key === "noqpl"){
               filename = 'Non RFID Projection Template-RFID Carryover ' + pstTime + '.xlsx';
                    downloadRows = this.removeDuplicatesTemplate(selRows);
                    columns = that.createColumns(); 
            }else{
                filename = 'Non RFID Projection - QPL Dept ' + pstTime + '.xlsx';
                    downloadRows = selRows; 
                    columns = that.createColumnsQPL();
            }   
            try {
                let oSettings = {
                    workbook: {
                        columns: columns
                    },
                    dataSource: downloadRows,
                    fileName: filename,
                    worker: false,
                    count: selRows.length,
                    showProgress: showProgress
                };
                
                jQuery.sap.require("sap.ui.export.Spreadsheet");
                let oSheet = new sap.ui.export.Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            } catch (e) {
                console.log(e);
            }
        },
        removeDuplicatesTemplate: function(selRows){
            const uniqueRows = [];

            selRows.map(x => uniqueRows.filter(a => a.GH_SITE == x.GH_SITE && a.PROGRAM == x.PROGRAM && a.AQID == x.AQID).length > 0 ? null : uniqueRows.push(x));

            return uniqueRows;
        },
        selectAllTemplateDownload: function(pstTime,that,key){
            let dataURL,downloadDataSource,slectData,columns;
            let filterData = that.getView().byId("idNonRfidFilBar").getFilterData();
            let filterFields = Object.keys(filterData);
                filterFields = filterFields.toString();
                let filename;
              
            let ModelappId = that.getOwnerComponent().getModel("MainModel").getHeaders().appid;
            if(key === "noqpl"){
                 slectData = "&$select=GH_SITE,PROGRAM,AQID";
                 columns = that.createColumns();
                 filename = 'Non RFID Projection Template-RFID Carryover ' + pstTime + '.xlsx';
            }else{
                 slectData = "&$select=GH_SITE,PROGRAM,UPH,LINE,AQID,SHORT_NAME,PARENT_ITEM,SCOPE,ALT_STATION,STATION,GROUP_PRIORITY,EQUIPMENT_TYPE,RFID_SCOPE,QPL,SPL,MP_INTENT_QTY,SPARE_RATE,SPARE_QTY,CONSUMABLES,PO_TYPE,,EQUIPMENT_NAME,MFR,DISPLAY_NAME,DEPT,CATEGORY";
                 columns = that.createColumnsQPL();
                 filename = 'Non RFID Projection - QPL Dept ' + pstTime + '.xlsx';
            } 
            let tableRows = that._oSmartTable.getTable().getSelectedIndices().length
            if(!that._oSmartTable.getTable().getBinding("rows")){
                this.blockTemplateDownload([""],pstTime,that,false,key);
            }else{
                let sFilterInUrl = that._oSmartTable.getTable().getBinding("rows").sFilterParams;
                let serviceUri = that.getOwnerComponent().getModel("MainModel").sServiceUrl;
            if(key === "noqpl"){
                dataURL = serviceUri + "/Projection_Export?" + sFilterInUrl + slectData + '&$inlinecount=allpages';
            }else{
                dataURL = serviceUri + "/NonRFIDProjectionDetails?" + sFilterInUrl + slectData;
            }
            if((that._oSmartTable.getTable().getSelectedIndices().length > 50000) || (tableRows === 0 && that._oSmartTable._getRowCount() > 50000)){
                dataURL = dataURL + '&$top=50000&$skip=0';
                tableRows = 50000;
                sap.m.MessageToast.show("Record Count is greater than 50K.Only First 50K will be downloaded");
            } else if(tableRows === 0 && that._oSmartTable._getRowCount() <= 50000){
                tableRows =  that._oSmartTable._getRowCount();
            }

        downloadDataSource = {
            type: "odata",
            dataUrl: dataURL,
            serviceUrl: serviceUri,
            count: tableRows,
            sizeLimit:3000,
            useBatch: true,
            headers: {
                "Accept": "application/json",
                "appid": ModelappId,
                "Accept-Language": "en-GB",
                "sap-contextid-accept": "header",
                "sap-cancel-on-close": "true",
                "DataServiceVersion": "2.0",
                "MaxDataServiceVersion": "2.0",
                "X-Requested-With": "XMLHttpRequest"

            },
        }
        try {
            let oSettings = {
                workbook: {
                    columns: columns
                },
                dataSource: downloadDataSource,
                fileName: filename,
                count: tableRows,
                showProgress: true,
                worker: false
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
    },
    refreshAfterFileUpload: function(err,resp,testCase,isMassUpdate,that){
        if (testCase !== true && that.getView().byId("idNonRfidFilBar").getFilters() && that.getView().byId("idNonRfidFilBar").getFilters().length !== 0) {
            that.onCOTbleSearch();
        }
    },
    };
}, true);