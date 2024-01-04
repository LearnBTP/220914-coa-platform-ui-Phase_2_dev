sap.ui.define([], function () {
    "use strict";
    return {

             // Ajax call to get line id's based on ghsite and program
             callCAPForLineId: function(ghsite,program,index,runTimeId,that){
                that.getView().setBusy(true);
                let oDataUrl = that.getAjaxLineIdUrl();
                let payLoad ={
                    From_GHSite: [ghsite],
                    Program: [program]
                };
                let payloadDataA = JSON.stringify(payLoad);
                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadDataA,
                    headers: {
                        "appid": that.appid
                    },
                    success: function (data) {
                        that.getView().setBusy(false);
                        let lineIdArray = data.d.BeforeSimulateValidation.msg;
                        let lineIdCMB = runTimeId;
                        lineIdCMB.destroyItems();
                        if(lineIdArray && lineIdArray.length !== 0){
                            lineIdArray.forEach(function(oItem){
                            lineIdCMB.addItem(new sap.ui.core.Item({
                                key: oItem.LINEID,
                                text: oItem.LINEID
                            }));
                        })
                        }
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.raiseBackendException(oError);
                    }
                });

            },
            lineIdSelctionFinish: function(oEvent,that){
                let selectedKeys = oEvent.getSource().getSelectedKeys();
                let bindingPath = oEvent.getSource().getParent().getBindingContext("lineSimulationModel").getPath();
                that.getView().getModel("lineSimulationModel").setProperty(bindingPath+"/Line_ID",selectedKeys);
            },
            getLineId: function(oEvent,that){
                let path = oEvent.getSource().getBindingContext("lineSimulationModel").getPath();
                let index = parseInt(path.substring(path.lastIndexOf("/") + 1));
                let colCells;
                if(oEvent.getSource()._sPickerType === "Dropdown"){
                     colCells = oEvent.getSource().getParent().getParent().getAggregation("cells");    
                }else{
                     colCells = oEvent.getSource().getParent().getAggregation("cells");
                }
                let lineIdHBox = colCells.find(element => element.getId().includes("lineidhbox"));
                let hBoxItems = lineIdHBox.getAggregation("items")
                let runTimeId = hBoxItems.find(element => element.getId().includes("mcmblineid"));
                if (oEvent.getSource().getId().includes("cmbprogram") || oEvent.getSource().getId().includes("cmbfromghsite")) {
                    let row = that.getView().getModel("lineSimulationModel").getProperty(path);
                    if(row.From_GHSite && row.Program){
                    that.callCAPForLineId(row.From_GHSite,row.Program,index,runTimeId);
                    }
                }
            },
            
            showSubmitMessage: function(oRetrievedResult,response,that,simName,isSimulate,simNameExists,createData){
            let errorText;
            try {
                let i;
                for (i = 0; i < oRetrievedResult.__batchResponses.length; i++) {
                    if (oRetrievedResult.__batchResponses[i].response && oRetrievedResult.__batchResponses[i].response.statusCode) { 
                            errorText = JSON.parse(oRetrievedResult.__batchResponses[i].response.body).error.message.value;
                            let errorRow = JSON.parse(errorText);
                            let tabItems = that.getView().getModel("lineSimulationModel").getProperty("/simulationItem");
                            createData.forEach((element)=>{
                                element.mode = "I";
                                element.edit = true;
                                if(errorRow.From_GHSite === element.From_GHSite && errorRow.Program === element.Program && errorRow.To_GHSite === element.To_GHSite
                                    && errorRow.To_Program === element.To_Program && errorRow.To_Business_Grp === element.To_Business_Grp){
                                    element.ErrorMsg = errorRow.ErrorMsg;
                                }else{
                                    element.ErrorMsg = "";
                                }
                            });
                            that.getView().getModel("lineSimulationModel").setProperty("/simulationItem",tabItems);
                    } 
                }   
                if (errorText) {
                    sap.m.MessageBox.error("Error Occured.Please check Error column");
                    return;
                }else{
                    that.submitSimulationName(isSimulate,simName,simNameExists);

                }
            } catch (e) { 
                that.submitSimulationName(isSimulate,simName,simNameExists);
            }
        },
        setLineIdFieldVisibility: function(that){
            let createDataSimHeader = that.getView().getModel("lineSimulationModel").getProperty("/createArray");
            let simulationHeader = that.getView().getModel("lineSimulationModel").getProperty("/simulationItem");
            let i,j;
            for(i = 0; i < createDataSimHeader.length; i++){
                for(j = 0; j < simulationHeader.length; j++){
                    if(createDataSimHeader.From_GHSite === simulationHeader.From_GHSite && createDataSimHeader.Program === simulationHeader.Program){
                        simulationHeader[j].edit  = true;
                        break;
                    }
                }
            }
            that.getView().getModel("lineSimulationModel").refresh(true);
        },
        setLimitonDownload: function(oEvent,that){
            if (oEvent.getParameter("exportSettings").dataSource.count > 200000) {
                oEvent.getParameter("exportSettings").dataSource.count = 200000;
                oEvent.getParameter("exportSettings").dataSource.dataUrl = oEvent.getParameter("exportSettings").dataSource.dataUrl + '&$top=200000&$skip=0';
                sap.m.MessageToast.show("Record Count is greater than 200K.Only First 200K will be downloaded");
            }
            },

        setDateTimeDuringExport: function (oEvent) {
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
        resetSmartTableFilters: function(oEvent,that){
        if(that.getView().byId("rfidEquipTable").getTable().getBinding("rows")){
            that.getView().byId("rfidEquipTable").getTable().getBinding("rows").filter([]);
            }
            if(that.getView().byId("nonrfidEquipTable").getTable().getBinding("rows")){
            that.getView().byId("nonrfidEquipTable").getTable().getBinding("rows").filter([]);
            }
            if(that.getView().byId("carryoversimulationTable").getTable().getBinding("rows")){
            that.getView().byId("carryoversimulationTable").getTable().getBinding("rows").filter([]);
            }
        },
        validateBeforeSave: function(that){
            if(!that.getOwnerComponent().getModel("device").getProperty("/isMockServer")){
            let simulationItem = that.getView().getModel("lineSimulationModel").getProperty("/simulationItem");
            let oErrorFlag = false;
            let simulationModel = that.getView().getModel("lineSimulationModel");
            let j;
            for ( j = 0; j < simulationItem.length; j++) {
                if (simulationItem[j].From_GHSite === "" && simulationItem[j].Program === "" && simulationItem[j].Line_ID.length === 0) {
                    oErrorFlag = true;
                    simulationModel.setProperty("/simulationItem/" + j + "/GHSiteValueState", "Error");
                    simulationModel.setProperty("/simulationItem/" + j + "/LineIdValueState", "Error");
                    simulationModel.setProperty("/simulationItem/" + j + "/ProgramValueState", "Error");
                } else {
                    if (simulationItem[j].From_GHSite === "") {
                        oErrorFlag = true;
                        simulationModel.setProperty("/simulationItem/" + j + "/GHSiteValueState", "Error");
                    }
                    if (simulationItem[j].Program === "") {
                        oErrorFlag = true;
                        simulationModel.setProperty("/simulationItem/" + j + "/ProgramValueState", "Error");
                    }
                    if (simulationItem[j].Line_ID.length === 0) {
                        oErrorFlag = true;
                        simulationModel.setProperty("/simulationItem/" + j + "/LineIdValueState", "Error");
                    }
                }
            }
            return oErrorFlag;
        }else{
        return false;
        }
    },
    validateBeforeSimulate: function(that){
        let simulationItem = that.getView().getModel("lineSimulationModel").getProperty("/simulationItem");
        let sErrorCheck = false,j;
        for (j = 0; j < simulationItem.length; j++) {
            let isEdit = that.getView().getModel("lineSimulationModel").getProperty("/simulationItem/" + j + "/edit");
            if (isEdit) {
                sErrorCheck = true;
                break;
            }
        }
        return sErrorCheck;
    },
    handleBatchError: function(oError,that){
        that.getView().setBusy(false);
        that.getView().getModel("lineSimulationModel").setProperty("/createArray",[]);
        that.getView().getModel("lineSimulationModel").setProperty("/changedArray",[]);
        that.raiseBackendException(oError);
    },

    callCAPForAllLineIds: function(that){
        that.getView().setBusy(true);
                let oDataUrl = that.getAjaxLineIdUrl();
                let payLoad ={
                    From_GHSite: '',
                    Program: ''
                };
                let payloadDataA = JSON.stringify(payLoad);
                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadDataA,
                    headers: {
                        "appid": that.appid
                    },
                    success: function (data) {
                        that.getView().setBusy(false);
                        that.getView().getModel("lineSimulationModel").setProperty("/lineid_dd",data.d.BeforeSimulateValidation.msg);
                        that.allLineids = data.d.BeforeSimulateValidation.msg;
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        that.raiseBackendException(oError);
                    }
                });

    },

    filterLindIds: function(oEvent,that){
            let path;
            if(oEvent.srcControl){
                path = oEvent.srcControl.getParent().getBindingContext("lineSimulationModel").getPath();
            }else{
                path = oEvent.getSource().getBindingContext("lineSimulationModel").getPath();
            }
                let row = that.getView().getModel("lineSimulationModel").getProperty(path);
                let filterghsite = new sap.ui.model.Filter("GH_SITE","EQ",row.From_GHSite);
                let filterprogram = new sap.ui.model.Filter("CARRYOVEROLDPROGRAM", "EQ", row.Program);
                let aFilters = [filterghsite,filterprogram];
                if(row.From_GHSite && row.Program){
                if(oEvent.srcControl){
                    oEvent.srcControl.getParent().getBinding("items").filter(aFilters);
                }else{
                    let colCells = oEvent.getSource().getParent().getAggregation("cells");
                    let runTimeId = colCells.find(element => element.getId().includes("mcmblineid"));
                    runTimeId.getBinding("items").filter(aFilters);
                }
                }
        
    },
    onValueHelpClose: function(oSelectedItem,that){
        that.getView().byId("inpSimName").setValue(oSelectedItem.getTitle());
        that.getSimulationHeaderTable(oSelectedItem.getTitle());
        that.getView().byId("rfidEquipTable").rebindTable();
        that.setSimulationStatus();      
    },
    deleteSuccess: function(data,that){
        that.getView().setBusy(false);
        that.onClearSimulation();
        sap.m.MessageBox.success("Simulation Deleted Successfully");      
    },
    setHeaderTableVisibleMode: function(that){
        let headerTableData = that.getView().getModel("lineSimulationModel").getProperty("/simulationItem");
        headerTableData.forEach((element)=>{
            element.edit = false;
            element.ErrorMsg = "";
        })
        that.getView().getModel("lineSimulationModel").setProperty("/simulationItem",headerTableData);
        that.getView().getModel("lineSimulationModel").refresh(true);
    },
    resetFilterForLineId: function(that){
        let rows = that.getView().byId("simulationHTable").getItems();
        rows.forEach((oItem,index) => {
            let cells = oItem.getAggregation("cells");
            let lineidRef = cells.find(ele => ele.getId().includes("mcmblineid"));
            if(lineidRef){
            lineidRef.getBinding("items").filter([]);
            }
        });
    },

    populateCreateArray: function(that){
        let simulationHeader = that.getView().getModel("lineSimulationModel").getProperty("/simulationItem");
        let simName = that.getView().getModel("lineSimulationModel").getProperty("/Simulation_name");
        let createArray = [];
        simulationHeader.forEach(function(oItem){
            oItem.Simulation_name = simName;
            if(oItem.mode === "I"){
                createArray.push(oItem);
            }
        });
        return createArray;
    },
    getExistingRecord: function(createArray,changedRow){
    let i,recordFound=false;;
    for(i = 0; i < createArray.length; i++){
        if(createArray[i] && createArray[i].From_GHSite && createArray[i].Program && changedRow.From_GHSite === createArray[i].From_GHSite && changedRow.Program === createArray[i].Program){
           recordFound = true;
           break; 
        }
    }
    return recordFound;
    },

     setSelectedLineId: function(lineIds,selLineArray,selectedContext,that){
         let GH_Site = that.getView().getModel("lineSimulationModel").getProperty(`${selectedContext}/From_GHSite`);
         let Program = that.getView().getModel("lineSimulationModel").getProperty(`${selectedContext}/Program`);
         if (!Array.isArray(selLineArray)) {
             selLineArray = selLineArray.split(",");
         }
         let finalLineIdArray = this.getValidLineIdForDownload(lineIds,selLineArray,GH_Site,Program);
         return finalLineIdArray.toString();        
     },


     setSelectedLineIdSelectAll: function(lineIds,selLineArray,row,that){
         let GH_Site = row.From_GHSite;
         let Program = row.Program;
         if (!Array.isArray(selLineArray)) {
             selLineArray = selLineArray.split(",");
         }
         let finalLineIdArray = this.getValidLineIdForDownload(lineIds,selLineArray,GH_Site,Program);
         return finalLineIdArray.toString();        
     },

     getValidLineIdForDownload: function(lineIds,selLineArray,GH_Site,Program){
         let i = 0,j=0,k=0,currLineArray=[],finalLineIdArray=[];
         if(lineIds && lineIds.length !== 0){
         for(i = 0; i < lineIds.length; i++){
             if(lineIds[i].GH_SITE === GH_Site && lineIds[i].CARRYOVEROLDPROGRAM === Program){
                 currLineArray.push(lineIds[i]);
             }
         }
     }
         if(currLineArray.length !== 0){
         for(j = 0; j < selLineArray.length; j++){
             for(k = 0; k < currLineArray.length; k++){
                 if(selLineArray[j] === currLineArray[k].LINEID){
                     finalLineIdArray.push(currLineArray[k].LINEID);
                 }
             }
         }
     }
         return finalLineIdArray;
     }

    };
}, true);