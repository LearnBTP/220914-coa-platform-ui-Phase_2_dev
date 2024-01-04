sap.ui.define([], function () {
    "use strict";
    return {
        showSubmitMessage: function(oRetrievedResult,response,that){
            let errorText;
            let i,j;
            try {
                for (i = 0; i < oRetrievedResult.__batchResponses.length; i++) {
                    if (oRetrievedResult.__batchResponses[i].response && oRetrievedResult.__batchResponses[i].response.statusCode) { 
                            errorText = JSON.parse(oRetrievedResult.__batchResponses[i].response.body).error.message.value;
                            let errorRow = JSON.parse(errorText);
                            let oModel = that.getView().getModel();
                            let PendingChg = Object.keys(oModel.getPendingChanges());
                            
                            for(j = 0; j < PendingChg.length; j++){
                                let rowVal = oModel.getProperty("/" + PendingChg[j]);
                                if(errorRow.Program === rowVal.Program && errorRow.Error){
                                    oModel.setProperty("/" + PendingChg[j] + "/Error", errorRow.Error);
                                    break;
                                }
                            }
                    } 
                }   
                if (errorText) {
                    sap.m.MessageBox.error("Error Occured.Please check Error column");
                    that._oSmartTable.rebindTable();
                }else{
                    sap.m.MessageBox.success("Data Saved Successfully");
                    that._oSmartTable.rebindTable();
                    that._oSmartTable._oEditButton.firePress();
                    that._oSmartTable.getModel("sm4rtM0d3l").setProperty("/editable", false);

                }
            } catch (e) { 
                sap.m.MessageBox.success("Data Saved Successfully");
                that._oSmartTable.rebindTable();
                that._oSmartTable._oEditButton.firePress();
                that._oSmartTable.getModel("sm4rtM0d3l").setProperty("/editable", false);
            }
        }
    };
}, true);