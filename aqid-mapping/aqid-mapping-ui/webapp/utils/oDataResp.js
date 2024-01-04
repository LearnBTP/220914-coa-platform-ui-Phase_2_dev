sap.ui.define([    "sap/ui/model/Filter",
"sap/ui/model/FilterOperator"], function (Filter, FilterOperator) {
    "use strict";
    return {
        handleUploadPress: function (oEvent,that) {
            let filedata;
            let file = oEvent.getParameters().files[0];
            if (file.type !== "text/csv") {
                sap.m.MessageBox.error("Only CSV files are allowed.");
                return;
            }
                filedata = oEvent.getParameter("files")[0];
                if( oEvent.getParameter("files")[0].size > 3355121)
            {
                sap.m.MessageBox.error("File upload is allowed only for 10k records");
                return;
            }
                let appid = that.getOwnerComponent().getModel("device").getProperty('/appid');
                let l_url = that.getUploadUrl();
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
                    "error": function (oError) {
                        that.getView().setBusy(false);
                        that.raiseBackendException(oError);
                    }
                };
                $.ajax(settings).done(function (response, data, value1, value2, value3) {
                    that.getView().setBusy(false);
                    that.getView().byId("fileUploader").clear();
                    that.handleUploadStatus(response);
                });
        },
        handleFileUploadStatus: function (response, that) {
            let err = false, resp;
            if (response.d.msg) {
                resp = response.d.msg;
            } else if (response.d.d.msg) {
                resp = response.d.d.msg;
            }
            if (response && resp && Array.isArray(resp)) {
                for (let item of resp) {
                    if (item.Error && item.Error !== "") {
                        err = true;
                        break;
                    }
                }
                if (err) {
                    that.getView().getModel("AqidModel").setProperty("/AqidUploadStatus", resp);
                }

                that.setDataAfterFileUpload(err, resp);

            } else {
                sap.m.MessageBox.error(resp);
            }
        },

        raiseCustomErrorOnSave: function (data,isMassUpdate,that) {
            let errorStatus = this.fillErrorColumn(data, isMassUpdate,that);
            // Normal save without massupdate
            if(!isMassUpdate){
            if (errorStatus === "All") {                                                // All errrors
                sap.m.MessageBox.error("Error Occured.Please check error column");
            } else if (errorStatus === "Some") {                                        // Some errors
                sap.m.MessageBox.error("Partial Data Saved.Please check error column");
            }
            else {                                                                      // Success 
                that.refreshAndSetTabletoDisplay();
                sap.m.MessageBox.success("Records Updated Successfully");
            }
        }
        },
        fillErrorColumn: function (data, isMassUpdate, that) {
            if (data.d.msg) {
                let responseArray = data.d.msg;
                let i, j, errorCount = 0;
                if(isMassUpdate && responseArray[0].Error){                         // massupdate error in popup(single error)
                    sap.m.MessageBox.error(responseArray[0].Error);
                    return;
                } else if(isMassUpdate && !responseArray[0].Error){                 // massupdate success
                    that.refreshAndSetTabletoDisplay();
                    sap.m.MessageBox.success("Records Updated Successfully");
                } else {                                                            // normal save error update error column
                for (i = 0; i < responseArray.length; i++) {
                    for (j = 0; j < that.changedPath.length; j++) {
                        if (i === j) {
                            if(!responseArray[i].Error){
                                responseArray[i].Error = "";
                            }
                            that._oSmartTable.getModel().setProperty("/" + that.changedPath[j] + "/Error", responseArray[i].Error);
                        } 
                    }
                    if (responseArray[i].Error) {
                        errorCount = errorCount + 1;
                    }
                }
                let result = this.getErrorResult(errorCount,that);
                return result;
            }   
            }
        },
        getErrorResult: function (errorCount,that) {
            if (errorCount === that.changedPath.length) {
                return "All";
            } else if (errorCount === 0) {
                return "None";
            } else {
                return "Some";
            }
        },
        applyErrorLog: function(oEvent,that){
        let oTable;
            oTable = oEvent.getSource().getTable();
        let aColumns = oTable.getColumns();
        let i;
        for (i = 0; i < aColumns.length; i++) {
            let sPath = "AqidModel>" + aColumns[i].data("p13nData").columnKey;
            aColumns[i].getTemplate().bindText(sPath);
            aColumns[i].setWidth("10rem");
            if (aColumns[i].data("p13nData").columnKey === "Error") {
                aColumns[i].setWidth("15rem");
            }
        }
    },
    tableSaveSuccess: function(data,isMassUpdate,that){
        that.getView().setBusy(false);
        this.raiseCustomErrorOnSave(data,isMassUpdate,that);
        that.changedArray = [];
        that.changedPath = [];
    },
    passFilters: function(oBindingParams){
        oBindingParams.filters.push(new Filter({
            filters: [new Filter("Table", "EQ", "T_COA_AQID_MAPPING")]
        }));
        oBindingParams.filters[0].aFilters.forEach(function(oItem,index){
            if(oItem.oValue1 === "COMMENTS"){
                oItem.oValue1 = "COMMENT";
            } 
            else if(oItem.oValue1 === "EQUIPNAME"){
                oItem.oValue1 = "EQUIPMENT_NAME";
            }
        });
    }
    };
}, true);