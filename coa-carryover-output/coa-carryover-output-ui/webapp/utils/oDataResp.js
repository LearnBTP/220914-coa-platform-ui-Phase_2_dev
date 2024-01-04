sap.ui.define([], function () {
    "use strict";
    return {
        handleUploadPress: function (oEvent, that) {
            let file = oEvent.getParameters().files[0];
            if (file.type !== "text/csv") {
                sap.m.MessageBox.error("Only CSV files are allowed.");
                return;
            }
           
            let filedata = oEvent.getParameter("files")[0];
            if( oEvent.getParameter("files")[0].size > 3298089)
            {
                sap.m.MessageBox.error("File upload is allowed only for 10k records",{
                    title: "Error"
                });
                return;
            }
           
           
        
           
            let l_url;
            let mAuthorizedModel = that.getOwnerComponent().getModel("mAuthorizedModel");
            let appid = mAuthorizedModel.getProperty('/ModelappId');
            if (mAuthorizedModel.getProperty('/Origin') === "corp-apps") {
                l_url = "/coa-api/v1/coa/coo-output-services/output/Upload_Output/csv";

            } else {
                l_url = "/coa-api-ext/v1/ext/coa/coo-output-services/output/Upload_Output/csv";
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
                    that.handleBatchOdataCallError(err);
                },
            };
            $.ajax(settings).done(function (response, data) {
                that.getView().setBusy(false);
                that.getView().byId("fileUploader").clear();
                that.handleFileUploadStatus(response, that, false);
            });
        },
        handleFileUploadStatus: function (response, that, testCase) {
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
                    let localModel = that.getView().getModel("OutputErrorModel");
                    localModel.setProperty("/CarryoverOutput", resp);
                }
                that.setDataAfterFileUpload(err, resp, testCase,that);
            }
            else {
                sap.m.MessageBox.information(resp);
                that.getView().byId("OTBRefresh").firePress();

            }
        },

        checkTbleSaveRecord: function (resp, that, changedPath) {
            let oModel = that.getOwnerComponent().getModel("MainModel");
            let PendingChg = Object.keys(oModel.getPendingChanges());
            let i;
            for (i = 0; i < PendingChg.length; i++) {
                let rowVal = oModel.getProperty("/" + PendingChg[i]);
                let resRow = resp.find(el => el.From_GHSite === rowVal.From_GHSite &&
                    el.From_Product === rowVal.From_Product &&
                    el.AQID === rowVal.AQID &&
                    el.To_GHSite === rowVal.To_GHSite &&
                    el.To_Product === rowVal.To_Product);
                if (resRow && resRow.BeError) {
                    oModel.setProperty("/" + PendingChg[i] + "/BeError", resRow.BeError);
                }
            }
            if (PendingChg.length === resp.length) {
                sap.m.MessageBox.error("Error Occured.Please check error column", {
                    title: "Validation Error"
                });
            } else {
                sap.m.MessageBox.error("Partial Data Saved.Please check error coluumn", {
                    title: "Validation Error"
                });
            }
            that.changedArray = [];
        },
        errorTabInit: function (oEvent) {
            let oTable = oEvent.getSource().getTable();
            let aColumns = oTable.getColumns();
            let i;
            for (i = 0; i < aColumns.length; i++) {
                let sPath = "OutputErrorModel>" + aColumns[i].data("p13nData").columnKey;
                aColumns[i].getTemplate().bindText(sPath);
                aColumns[i].setWidth("6rem");
                if (aColumns[i].data("p13nData").columnKey === "BeError") {
                    aColumns[i].setWidth("15rem");
                }
            }
        },

        onSelAllMassApprRej : function (action,that) {
            that._oSmartTable.setBusy(true);
            let mAuthorizedModel = that.getOwnerComponent().getModel("mAuthorizedModel");
            let appid = mAuthorizedModel.getProperty('/ModelappId');
            let filters = that.getView().byId("idCarryOverSmartTble").getTable().getBinding("rows").sFilterParams;
            if (filters) {
                filters = decodeURI(filters.split('$filter=')[1]);
            }
            let OutputData = {};

            OutputData.URL = filters;
           
            if (action==="Approved") {
                OutputData.Action = "Approved";
            }
            else if (action==="Rejected") {
                OutputData.Action = "Rejected";
            }
            else if (action==="Delete") {
                OutputData.Action = "Delete";
            }

            OutputData = JSON.stringify(OutputData);
            let oDataUrl = that.getAjaxCallURL();
            $.ajax({
                url: oDataUrl,
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: OutputData,
                headers: {
                    "appid": appid
                },
                success: function (response) {
                    that._oSmartTable.setBusy(false);
                    that.handleFileUploadStatus(response, that, false);
                },

                error: function (oError) {
                    that._oSmartTable.setBusy(false);
                    that.changedArray = [];
                    let message, messageInfo;
                    if (oError.responseText !== undefined && JSON.parse(oError.responseText).error.message.value) {
                        messageInfo = JSON.parse(oError.responseText);
                        message = messageInfo.error.message.value;
                    }
                    else {
                        sap.m.MessageBox.error("Communication Error");
                    }
                    that.onRaiseMessageUpload(message)



                }
            });

        },

         // checkPendingChanges before approve
         onBeforeApprove : function(that) {

            if (that._oSmartTable.getTable().getSelectedIndices().length === 0) {
                sap.m.MessageToast.show("Select at least one record");
                return;
            }
            if (that._oSmartTable.getTable().getSelectedIndices().length > '5000') {
                sap.m.MessageBox.error("You cannot Approve more than 5000 records at a time.", {
                    title: "System Error",
                });
                return;
            }

            if (that._oSmartTable.getModel().hasPendingChanges()) {
                sap.m.MessageBox.warning(
                    "There are unsaved changes in the Table.Data will be lost.Do you want to proceed?", {
                    actions: [ sap.m.MessageBox.Action.OK,  sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction:  sap.m.MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            that.onCOSmartTbleApprove();
                        } else {
                            sap.m.MessageToast.show("Click on Save Button and proceed to Approve");
                        }
                    }.bind(this)
                });
            } else {

                that.onCOSmartTbleApprove();
            }




        },

        // checkPendingChanges before Reject
        onBeforeReject : function(that) {

            if (that._oSmartTable.getTable().getSelectedIndices().length === 0) {
                sap.m.MessageToast.show("Select at least one record");
                return;
            }
           
            if (that._oSmartTable.getTable().getSelectedIndices().length > '5000') {
                sap.m.MessageBox.error("You cannot Reject more than 5000 records at a time.", {
                    title: "System Error",
                });
                return;
            }
            if (that._oSmartTable.getModel().hasPendingChanges()) {
                sap.m.MessageBox.warning(
                    "There are unsaved changes in the Table.Data will be lost.Do you want to proceed?", {
                    actions: [ sap.m.MessageBox.Action.OK,  sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction:  sap.m.MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === "OK") {
                            that.onCOSmartTblReject();
                        } else {
                            sap.m.MessageToast.show("Click on Save Button and proceed to Reject");
                        }
                    }.bind(this)
                });
            } else {

                that.onCOSmartTblReject();
            }




        },


        MergeDownloadData : function(chkArr,Primarykeys) {
            const mergeObj = {};
            chkArr.forEach(obj => {
                const keys = Primarykeys.map(key => obj[key]).join('_');
                if(mergeObj[keys]){
                   mergeObj[keys].Quantity+=  parseInt(obj.Quantity);

                }else {
                    mergeObj[keys] = {...obj};

                }
            });
     
            return Object.values(mergeObj);

         },

        checkDeleteData : function(that){

            that.changedArray = [];
           

            let oModel = that.getOwnerComponent().getModel("MainModel");
            let tableRows = that._oSmartTable.getTable().getSelectedIndices();
            let allRecordsApprove = true;

            for (let i of tableRows) {
                let index = i;
                let rowContext = that._oSmartTable.getTable().getContextByIndex(index);
                if (rowContext) {
                    that.validateCoType(oModel,rowContext,that);
          
                    
                }
                else {
                    allRecordsApprove = false;
                    that.onSelAllMassApprRej("Delete");
                    break;
                }
            }
            if (allRecordsApprove) {
                that.onSave('Delete', false);
            }

    
        },


       

        validateCoType: function (oModel,rowContext,that) {
            
         oModel.setProperty(rowContext.sPath + "/" + "Comment", "deleterecord");
         let selrow = oModel.getProperty(rowContext.getPath());
         that.changedArray.push(selrow);    

 },


             /**
       * Method: setDataAfterFileUpload
       * Description: This method is used to open the fragment when user upload the excel file
       * 
       * **/
             setDataAfterFileUpload: function (err, resp, testCase,that) {

                if (!err) {
                    sap.m.MessageToast.show("Data Saved successfully refresh the table");
                    if (testCase !== true) {
                        that.onCOTbleSearch();
                    }
                } else {
                    sap.ui.core.Fragment.load({ name: "coa.coacarryoveroutputui.Fragments.Dialog.Output_LogsDialog", controller: that }).then(function name(oFragment) {
                        that._RecordLogsPopover = oFragment;
                        that.getView().addDependent(that._RecordLogsPopover);
                        that._RecordLogsPopover.open();
                    }.bind(that));
                    if (testCase !== true) {
                        that.onCOTbleSearch();
                    }
                }
            },
        



    };
}, true);