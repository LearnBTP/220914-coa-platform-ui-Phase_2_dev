sap.ui.define([], function () {
    "use strict";
    return {
        
        raiseCustomErrorOnSave: function(oError,that){
            if(oError.responseJSON){
                let errorStatus = this.fillErrorColumn(oError,that);
                if(errorStatus === "All"){
                    sap.m.MessageBox.error("Error Occured. Please check error column");
                } else if(errorStatus === "Some"){
                    sap.m.MessageBox.error("Partial Data Saved. Please check error column");
                }
                } else{
                    that.raiseBackendException(oError);
                } 
            },   
            fillErrorColumn: function(oError,that){
                let responseArray = JSON.parse(oError.responseJSON.error.message.value);
                let i,j,errorCount=0;
                for(i = 0; i < responseArray.length; i++){
                for(j = 0; j < that.changedPath.length; j++){
                if(i === j){
                that._oSmartTable.getModel().setProperty("/" + that.changedPath[j] +"/ErrorMsg", responseArray[i].ErrorMsg);   
                }
                }    
                if(responseArray[i].ErrorMsg){
                    errorCount = errorCount + 1;
                }                
                }

                if(errorCount === that.changedPath.length){
                    return "All";
                }else{
                    return "Some";
                }
            },
            SaveSuccess: function(isCancel,that){
                that.getView().setBusy(false);
                that.commonSaveSuccess(isCancel,that);
                that.changedArray = [];
                that.changedPath = [];
            },
            massStatusSuccess: function(data, that){
            that.getView().setBusy(false);
            sap.m.MessageBox.success("Data Saved Successfully");
            that.changedArray = [];
            that.changedPath = [];
            that.refreshAndSetTabletoDisplay();
            },
            massStatusError: function(oError,that){
            that.getView().setBusy(false);
            that.changedArray = [];
            that.changedPath = [];
            that.handleUploadStatus(oError); 
            },

            filterErrorRecordsBindTable: function(responseArray,that){
            responseArray.forEach(function(oItem){
                if(!oItem.ErrorMsg){
                    oItem.ErrorMsg = "";
                }
            });
            responseArray = responseArray.filter(data => data.ErrorMsg !== "");

            that.getView().getModel("RfidModel").setProperty("/RfidLogs",[]);
            that.getView().getModel("RfidModel").setProperty("/RfidLogs", responseArray);

        },
        massUpdateSuccess: function(data,that){
        if(!that.getOwnerComponent().getModel("device").getProperty("/isMockServer")){
            that.refreshAndSetTabletoDisplay();
        }
        that.changedArray = [];
        that.changedPath = [];
        that.getView().setBusy(false);
        sap.m.MessageBox.success("Data Saved Successfully");
    },
    setLimitonDownload: function(oEvent,that){
        if (oEvent.getParameter("exportSettings").dataSource.count > 200000) {
            oEvent.getParameter("exportSettings").dataSource.count = 200000;
            oEvent.getParameter("exportSettings").dataSource.dataUrl = oEvent.getParameter("exportSettings").dataSource.dataUrl + '&$top=200000&$skip=0';
            sap.m.MessageToast.show("Record Count is greater than 200K.Only First 200K will be downloaded");
        }
        },

        massStatusChange: function(status,that){
            let oDataResp = this;
            that.getView().setBusy(true);
            let filters = that.getView().byId("rfidonhandtable").getTable().getBinding("rows").sFilterParams;
                        if(filters){
                        filters = decodeURI(filters.split('$filter=')[1]);
                        }
            let payloadData = {
                        "url": filters,
                        "To_GH_Site": "",
                        "To_Program": "",
                        "To_Business_Grp": "",
                        "Comment": "",
                        "Approval_Status": status
                    };
            let payloadDataA = JSON.stringify(payloadData);
            let oDataUrl = that.getSelectAllAjaxUrl();

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
                            oDataResp.massStatusSuccess(data,that);
                        },
                        error: function (oError) {
                           oDataResp.massStatusError(oError,that);
                        }
                    });

        },
        replaceChangeLogFields: function(oBindingParams){
        // Replace removed duplicate fields to correct fields in this application
        oBindingParams.filters[0].aFilters.forEach(function(oItem,index){
            if(oItem.oValue1 === "LINEID"){
                oItem.oValue1 = "LINE_ID";
            } 
            else if(oItem.oValue1 === "LINETYPE"){
                oItem.oValue1 = "LINE_TYPE";
            }
        });
    },
    setFormatterModifiedAt: function(aColumns,oTable,that){
        for (let acol of aColumns) {
            acol.setWidth("15rem");
            if (acol.data("p13nData").columnKey === "modifiedAt") {
                acol.getTemplate().getBindingInfo("text").formatter = that.formatDate;
            }
        }
    },
    updateSelectAllFlag: function(that){
        let smartTable = that._oSmartTable;
        if(smartTable.getTable()._getTotalRowCount() === smartTable.getTable().getSelectedIndices().length){
            that.selectAll = true;
        }
    },
    };
}, true);