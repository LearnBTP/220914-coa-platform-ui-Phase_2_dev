sap.ui.define(["sap/m/MessageBox"], function (MessageBox) {
    "use strict";
    return {
        // File Upload
        handleUploadPress: function (oEvent, that) {
            let file = oEvent.getParameters().files[0];
            let filedata = oEvent.getParameter("files")[0];
            let l_url;
            if (file.type !== "text/csv") {
                sap.m.MessageBox.error("Only CSV files are allowed.");
                return;
            }
            if( oEvent.getParameter("files")[0].size > 2000000 )
            {
                sap.m.MessageBox.error("File upload is allowed only for 10k records");
                return;

            }
            let oDataResp = this;
            let appid = that.getOwnerComponent().getModel("device").getProperty('/appid');

            if (that.getOwnerComponent().getModel("device").getProperty('/origin') === "corp-apps") {
                l_url = "/coa-api/v1/coa/rfid-unscannable-service/Upload_Unscannable/csv";
            } else {
                l_url = "/coa-api-ext/v1/ext/coa/rfid-unscannable-service/Upload_Unscannable/csv";
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
                "error": function (oError) {
                    that.getView().setBusy(false);
                    that.raiseBackendException(oError);
                },
            };
            $.ajax(settings).done(function (response, data) {
                that.getView().setBusy(false);
                that.getView().byId("fileUploader").clear();
                oDataResp.handleFileUploadStatus(response, that);
            });
        },
        // File upload errror records
        handleFileUploadStatus: function (response, that) {
            try{
            let err = false, resp;
            if (response.d.msg) {
                resp = response.d.msg;
            } else if (response.d.d.msg) {
                resp = response.d.d.msg;
            }
            if (response && resp && Array.isArray(resp)) {
                for (let item of resp) {
                    if (item.ERROR && item.ERROR !== "") {
                        err = true;
                        break;
                    }
                }
                if (err) {
                    that.getView().getModel("UnscannableModel").setProperty("/UnscannableUploadStatus", resp);
                }

                this.setDataAfterFileUpload(err, resp,that);

            } 
            else {
                let succPosition = resp.search("Successfully"); 
                if(succPosition !== -1){
                sap.m.MessageBox.success(resp);
                if (!that.isMockServer && that.getView().byId("smartFilterBar").getFilters() && that.getView().byId("smartFilterBar").getFilters().length !== 0) {
                that.refreshAndSetTabletoDisplay();
                }
                }else{
                sap.m.MessageBox.error(resp);
                }
            }
        }catch(e){
            that.raiseBackendException(response);
        }
        },
        setDataAfterFileUpload: function (err, resp,that) {
            if (!err) {
                MessageBox.success("Data Saved successfully");

            } else {
                that.openErrorFragment(err,resp,that);
            }
            if (!that.isMockServer) {
                if (that.getView().byId("smartFilterBar").getFilters() && that.getView().byId("smartFilterBar").getFilters().length !== 0) {
                    that.refreshAndSetTabletoDisplay();
                }

            }
        },

        applyErrorLog: function(oEvent,that){
            let oTable;
                oTable = oEvent.getSource().getTable();
            let aColumns = oTable.getColumns();
            let i;
            for (i = 0; i < aColumns.length; i++) {
                let sPath = "UnscannableModel>" + aColumns[i].data("p13nData").columnKey;
                aColumns[i].getTemplate().bindText(sPath);
                aColumns[i].setWidth("10rem");
                if (aColumns[i].data("p13nData").columnKey === "ERROR") {
                    aColumns[i].setWidth("15rem");
                }
            }
        },

        setErrorColumnDelete: function(responseArray,changedPath,that){
            let oModel = that.getView().getModel();
            let i;
            for (i = 0; i < changedPath.length; i++) {
                let rowVal = oModel.getProperty(changedPath[i]);
                let resRow = responseArray.find(el => el.GH_SITE === rowVal.GH_SITE &&
                    el.TO_GHSITE === rowVal.TO_GHSITE &&
                    el.TO_CM === rowVal.TO_CM &&
                    el.TO_PROGRAM === rowVal.TO_PROGRAM &&
                    el.AQID  === rowVal.AQID && 
                    el.CM === rowVal.CM &&
                    el.SITE === rowVal.SITE &&
                    el.SEQUENCE_NO === rowVal.SEQUENCE_NO);
                if (resRow && resRow.ERROR) {
                    oModel.setProperty( changedPath[i] + "/ERROR", resRow.ERROR);
                }
            }
        },

        setErrorColumn: function(responseArray,changedArray,that){
            let oModel = that.getView().getModel();
            let PendingChg = Object.keys(oModel.getPendingChanges());
            let i;
            for (i = 0; i < PendingChg.length; i++) {
                let rowVal = oModel.getProperty("/" + PendingChg[i]);
                let resRow = responseArray.find(el => el.GH_SITE === rowVal.GH_SITE &&
                    el.CM === rowVal.CM &&
                    el.SITE === rowVal.SITE &&
                    el.PROGRAM === rowVal.PROGRAM &&
                    el.AQID  === rowVal.AQID && 
                    el.SEQUENCE_NO === rowVal.SEQUENCE_NO);
                if (resRow && resRow.ERROR) {
                    oModel.setProperty("/" + PendingChg[i] + "/ERROR", resRow.ERROR);
                }
            }
        },

        commonSaveSuccessFunction: function(data,changedPath, isMassUpdateorStatusChg,that){
            that.getView().setBusy(false);
            let responseArray = data.d.msg;
            let errorRecords = 0;
            if(typeof(responseArray) === 'string'){
                responseArray = [];
            }
            if(isMassUpdateorStatusChg){
                that.handleUploadStatus(data);
            } else{
                if(responseArray && responseArray.length !==0 && typeof(responseArray) !== 'string'){
                    errorRecords = this.checkError(responseArray,errorRecords);
                    this.setErrorColumn(responseArray,changedPath,that);
            }
            if(errorRecords !== 0){
            if(errorRecords === responseArray.length){
                MessageBox.error("Error While Saving Data. Check Error Column for more details");
            } else if(errorRecords !== responseArray.length){
                MessageBox.error("Partial Data Saved.Check Error Column for more details");
            } 
            }else{
                MessageBox.success(data.d.msg);
                that._oSmartTable.rebindTable();
                that._oSmartTable.getModel().resetChanges();
                that.getView().byId("rfidunscannabletable")._oEditButton.firePress();
                that.getView().byId("rfidunscannabletable").getModel("sm4rtM0d3l").setProperty("/editable", false);
            }
        }
        },

        splitDeleteSuccess: function(data,action,changedPath,that){
            that.getView().setBusy(false);
            that._oSmartTable.rebindTable();
            let responseArray = data.d.msg;
            let errorRecords = 0;
            if(action === "DELETE"){
                that.getView().setBusy(false);
                if(responseArray && responseArray.length !==0 && typeof(responseArray) !== 'string'){
                    errorRecords = this.checkError(responseArray,errorRecords);
                    this.setErrorColumnDelete(responseArray,changedPath,that);
            }
            if(typeof(responseArray) === 'string'){
                responseArray = [];
            }
            if(errorRecords !== 0){
            if(errorRecords === responseArray.length){
                MessageBox.error("Error While Saving Data. Check Error Column for more details");
            } else if(errorRecords !== responseArray.length){
                MessageBox.error("Partial Data Deleted.Check Error Column for more details");
            } 
            }else{
                MessageBox.success("Deleted Successfully");
                that._oSmartTable.rebindTable();
                that._oSmartTable.getModel().resetChanges();
                that.getView().byId("rfidunscannabletable")._oEditButton.firePress();
                that.getView().byId("rfidunscannabletable").getModel("sm4rtM0d3l").setProperty("/editable", false);
            }
            
            }else{
            MessageBox.success("Split Successfully")
            that.split = true;
            }
        },

        onChangeTQSmartble: function (oEvent) {
            let params = oEvent.getParameters();
            let old_value = oEvent.getSource().getLastValue();
            let regInt = /^[+]?\d*$/;
            let chacolumn  = oEvent.getSource();
                if (regInt.test(params.newValue)) {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                    oEvent.getSource().setValueStateText("");
                }
                else {
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                    oEvent.getSource().setValue(old_value);
                    oEvent.getSource().setValueStateText("Only absolute number is accepted");
                }
                function message() {
                    chacolumn.setValueState(sap.ui.core.ValueState.None);
                    chacolumn.setValueStateText("");
                    }
                    setTimeout(message,3000);   
        },

        getGhSiteDD: function(oEvent,isFragmentOpen, Field,that){
            that.getView().setBusy(true);
            if(isFragmentOpen){
            oEvent.getSource().setBusy(true);
            let objE = oEvent.getSource();
            }

            
                
            that.oDataModel.read("/F4help", {

            urlParameters:{
                "$orderby":`${Field} asc`,
                "$select": `${Field}`
            },

            success: function (oData) {
                that.getView().setBusy(false);
                this.bindResulttoModel(oData,Field,that);
                if(isFragmentOpen){
                objE.setBusy(false);
                }


                
            }.bind(this),
            error: function (oError) {
              that.getView().setBusy(false);
                that.raiseBackendException(oError);
                if(isFragmentOpen){
                obiE.setBusy(false);
                }
            }.bind(this)
                  });
},
        bindResulttoModel: function(oData,Field,that){
            // let that = this;
            switch (Field) {
                case 'GH_SITE_ORG':
                    that.getView().getModel("UnscannableModel").setProperty("/GH_Site",oData.results);
                    break;
                case 'GH_SITE_MD' :    
                    that.getView().getModel("UnscannableModel").setProperty("/GH_Site_md",oData.results);
                    break;
                case 'PROGRAM_MD':    
                    that.getView().getModel("UnscannableModel").setProperty("/Program_md",oData.results);
                    break;
                default:
                    break;
            }
},
syncGenerateSuccess: function(data,that){
    that.getView().setBusy(false);
    that.onSyncGHSDialogClse();
    if(data){
    if(typeof(data.d.Generate_Unscannable.msg) === 'string'){
    MessageBox.success(data.d.Generate_Unscannable.msg);
    }else{
    MessageBox.error(`${data.d.Generate_Unscannable.msg[0].ERROR}`);
    }}
},

setLimitonDownload: function(oEvent,that){
if (oEvent.getParameter("exportSettings").dataSource.count > 200000) {
    oEvent.getParameter("exportSettings").dataSource.count = 200000;
    oEvent.getParameter("exportSettings").dataSource.dataUrl = oEvent.getParameter("exportSettings").dataSource.dataUrl + '&$top=200000&$skip=0';
    sap.m.MessageToast.show("Record Count is greater than 200K.Only First 200K will be downloaded");
}
},

checkError: function(responseArray,errorRecords){
    responseArray.forEach(function(oItem,index){
        if(oItem.ERROR){
            errorRecords++;
        }
    });
    return errorRecords;
},

validateBeforeSave: function(changedArray,changedPath,that){
    let isValid = true;
    changedArray.forEach((oItem,index) => {
        if(oItem.TRANSFER_FLAG && oItem.TRANSFER_FLAG !== "Y" && oItem.TRANSFER_FLAG !== "N"){
            that.getView().getModel().setProperty("/" +changedPath[index]+ "/ERROR", "Transfer Flag Accepts Either Y or N");
            isValid = false;
        } 
        else if(oItem.FLEX_KITS && oItem.FLEX_KITS !== "Y"){
            that.getView().getModel().setProperty("/" +changedPath[index]+ "/ERROR", "Flex Kits must be Y or blank");
            isValid = false;
        } else{
            that.getView().getModel().setProperty("/" +changedPath[index]+ "/ERROR", "");
        }
    });
    return isValid;
},
checkTbleDataChanged : function(that) {
                
    let valueChnged;
    let oModel = that.getView().getModel();
    let changedData  = jQuery.isEmptyObject(oModel.getPendingChanges());

   if(!changedData){
    valueChnged =  true
   } 
   else {
    valueChnged = false;

   }
   return valueChnged;
 },
 removeErrorPendingChangesQ: function(that){
    let oModel = that.getView().getModel();
    let pendingChanges = oModel.getPendingChanges();
    let entries = Object.entries(pendingChanges);
    if(entries && entries.length !==0){
    let i,j;
    let pendingArray = JSON.parse(JSON.stringify(entries));
    for(i = 0;i< entries.length; i++){
        let entries1 = entries[i];
        for(j = 0; j< entries1.length; j++){
            if(entries1[j].hasOwnProperty("Error") && Object.entries(entries1[j]).length === 2){
                pendingArray.splice(j - 1,1);
            } 
        }
    }
    if (pendingChanges && pendingChanges.length !== 0){
        return true;
    }else{
        return false;
    }
}else{
    return false;
}
        
},

    };
}, true);