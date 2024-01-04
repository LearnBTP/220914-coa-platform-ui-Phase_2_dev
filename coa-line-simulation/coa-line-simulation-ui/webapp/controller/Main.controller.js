sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",  
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../utils/Formatter",
    "../utils/oDataResp",
    'sap/ui/export/Spreadsheet' 
    
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, Filter, FilterOperator, Formatter, oDataResp,Spreadsheet) {
        "use strict";

        return Controller.extend("com.apple.coa.coalinesimulationui.controller.Main", {
            formatter: Formatter,
            onInit: function () {

                if (!this.getOwnerComponent().getModel("authModel").getProperty("/display")) {
                    this.getOwnerComponent().getRouter().getTargets().display("TargetNoAuth");
                    return;
                }

                this.getView().setModel(this.getOwnerComponent().getModel("MainModel"));
                this.setJSONModelToView();
                this.setTableVisibility(true,false,false);

                this.oDataModel = this.getOwnerComponent().getModel("MainModel");

                this.getView().byId("btnRFIDEquip").addStyleClass('zLineTileSelected');
                this.getView().byId("btnNonRFIDEquip").addStyleClass('zLineTileDefault');
                this.getView().byId("btnCarryOverSim").addStyleClass('zLineTileDefault');


                this.appid = this.getOwnerComponent().getModel("device").getProperty("/appid");

                if(this.getOwnerComponent().getModel("device").getProperty("/isMockServer")){
                    this.getSimulationHeaderTable("Simulation_3");
                }
                oDataResp.callCAPForAllLineIds(this);

                this.getView().byId("mcmblineid").addEventDelegate({
                    "onclick": function (oEvent) {
                        oDataResp.filterLindIds(oEvent,this);
                    }.bind(this)
                });
                this.getView().getModel("lineSimulationModel").setProperty("/addEnable",false);                
            },

            onNewSimulation: function(oEvent){
                this.onClearSimulation();
                this.getView().getModel("lineSimulationModel").setProperty("/newSimulation",true);
                this.newSimulation = true;
                this.resetSmartTableData();
                this.onCreateSimLine();
                this.getView().getModel("lineSimulationModel").setProperty("/addEnable",true);

            },
            getCurrentTab: function(oEvent){
                let buttonText = oEvent.getSource().getProperty('header')
                    buttonText = buttonText.toLowerCase()
                switch (buttonText) {
                    case "rfid equipment":
                        this.setTableVisibility(true,false,false);
                        break;
                    case "non rfid equipment":    
                        this.setTableVisibility(false,true,false);
                        break;
                    case "carry over simulation":
                        this.setTableVisibility(false,false,true);
                        break;
                }
               
            },
            setTableVisibility: function(rfid, nonrfid, cosimulation){
            this.getView().getModel("lineSimulationModel").setProperty("/rfidTable",rfid);
            this.getView().getModel("lineSimulationModel").setProperty("/nonRFIDTable",nonrfid);
            this.getView().getModel("lineSimulationModel").setProperty("/coSimulation",cosimulation);
            },

            setJSONModelToView: function () {
                let e = new sap.ui.model.json.JSONModel;
                this.getView().setModel(e, "lineSimulationModel");
                this.getView().getModel("lineSimulationModel").setSizeLimit(100000);

            },
            onRFIDEquipment: function (oEvent) {
                this.getView().byId("btnRFIDEquip").removeStyleClass('zLineTileDefault');
                this.getView().byId("btnRFIDEquip").addStyleClass('zLineTileSelected');
                this.getView().byId("btnNonRFIDEquip").removeStyleClass('zLineTileSelected');
                this.getView().byId("btnNonRFIDEquip").addStyleClass('zLineTileDefault');
                this.getView().byId("btnCarryOverSim").removeStyleClass('zLineTileSelected');
                this.getView().byId("btnCarryOverSim").addStyleClass('zLineTileDefault');
                this.getCurrentTab(oEvent);
                this.getView().byId("rfidEquipTable").rebindTable();
                
            },
            onNonRFIDEquipment: function (oEvent) {
                this.getView().byId("btnRFIDEquip").removeStyleClass('zLineTileSelected');
                this.getView().byId("btnRFIDEquip").addStyleClass('zLineTileDefault');
                this.getView().byId("btnNonRFIDEquip").removeStyleClass('zLineTileDefault');
                this.getView().byId("btnNonRFIDEquip").addStyleClass('zLineTileSelected');
                this.getView().byId("btnCarryOverSim").removeStyleClass('zLineTileSelected');
                this.getView().byId("btnCarryOverSim").addStyleClass('zLineTileDefault');
                this.getCurrentTab(oEvent);
                this.getView().byId("nonrfidEquipTable").rebindTable();
            },
            onCarryOverSimulation: function (oEvent) {
                this.getView().byId("btnRFIDEquip").removeStyleClass('zLineTileSelected');
                this.getView().byId("btnRFIDEquip").addStyleClass('zLineTileDefault');
                this.getView().byId("btnNonRFIDEquip").removeStyleClass('zLineTileSelected');
                this.getView().byId("btnNonRFIDEquip").addStyleClass('zLineTileDefault');
                this.getView().byId("btnCarryOverSim").removeStyleClass('zLineTileDefault');
                this.getView().byId("btnCarryOverSim").addStyleClass('zLineTileSelected');
                this.getCurrentTab(oEvent);
                this.getView().byId("carryoversimulationTable").rebindTable();
            },
            onGetSimulation: function(oEvent){
                let simName = this.getView().getModel("lineSimulationModel").getProperty("/Simulation_name");
                let isMockServer = this.getOwnerComponent().getModel("device").getProperty("/isMockServer");
                this.getView().getModel("lineSimulationModel").setProperty("/addEnable",true);
                if(!isMockServer && !simName){
                    sap.m.MessageBox.error("Enter Simulation Name");
                    return;
                }
                oDataResp.resetSmartTableFilters(oEvent,this);
                this.getView().byId("btnRFIDEquip").firePress();
                this.getSimulationHeaderTable(simName);
                this.setSimulationStatus();
                this.getView().getModel("lineSimulationModel").setProperty("/newSimulation",false);
                this.newSimulation = false;
            },
            setSimulationStatus: function(){
                let simName = this.getView().getModel("lineSimulationModel").getProperty("/Simulation_name");
                let fSimName = new sap.ui.model.Filter("Simulation_name","EQ",simName);
                let mParameters = {
                    filters: [fSimName],
                    success: function(oData,response){
                        if(oData && oData.results && oData.results.length !== 0){
                        this.getView().getModel("lineSimulationModel").setProperty("/simulationStatus",oData.results[0].Status);
                        }
                    }.bind(this),
                    error: function(oError){
                        this.getView().setBusy(false);
                        this.raiseBackendException(oError);
                    }.bind(this)
                }
                this.oDataModel.read("/SimulationData",mParameters);
            },
            getSimulationHeaderTable: function(simName){
                this.getView().byId("simulationHTable").setBusy(true);
                let simulationFilter = new Filter("Simulation_name",FilterOperator.EQ,simName)
                let aFilters = [simulationFilter]
                let mParameters = {
                    filters: aFilters,
                    success: function(oData, response){
                        this.getView().byId("simulationHTable").setBusy(false);
                        oData.results.forEach(function(oItem,index){
                            oItem.edit = false;
                            oItem.mode = "U";
                        });
                        this.getView().getModel("lineSimulationModel").setProperty("/simulationItem",oData.results);
                        this.getView().getModel("lineSimulationModel").refresh(true);
                        oDataResp.resetFilterForLineId(this);
                    }.bind(this),
                    error: function(oError){
                        this.getView().byId("simulationHTable").setBusy(false);
                        this.raiseBackendException(oError);
                    }.bind(this)
                };
                this.oDataModel.read("/ViewSimulation",mParameters); 
            },

            onSimValHelpRequest: function(oEvent){
            this.dialogSim = sap.ui.xmlfragment("com.apple.coa.coalinesimulationui.Dialogs.simNameHelp", this);
            this.getView().byId("page").addDependent(this.dialogSim);
            this.dialogSim.open();
            },

            onValueHelpClose: function(oEvent){
                let oSelectedItem = oEvent.getParameter("selectedItem");
                oDataResp.onValueHelpClose(oSelectedItem,this);
                this.dialogSim.destroy(true);    
                this.newSimulation = false;
                this.getView().getModel("lineSimulationModel").setProperty("/newSimulation",false);

                this.getView().getModel("lineSimulationModel").setProperty("/addEnable",true);
            },
            onValueHelpCancel: function(oEvent){
                this.dialogSim.destroy(true);
            },

            onValueHelpSearch: function(oEvent){
                let sValue = oEvent.getParameter("value");
                let oFilter = new Filter("Simulation_name", FilterOperator.Contains, sValue);
    
                oEvent.getSource().getBinding("items").filter([oFilter]);
            },

            applyFilterCOSimulation: function(oEvent){
                this.applySimulationNameFilter(oEvent);
            },
            applyFilterNonRFIDEquipment: function(oEvent){
                this.applySimulationNameFilter(oEvent);
            },
            applyFilterRFIDEquipment: function(oEvent){
                this.applySimulationNameFilter(oEvent);
            },
            applySimulationNameFilter: function(oEvent){
                let simulationName = this.getView().getModel("lineSimulationModel").getProperty("/Simulation_name");
                let oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new Filter({
                    filters: [new Filter("Simulation_name", "EQ", simulationName)]
                }));
            },
            onSaveSimulation: function(oEvent,isSimulate){
                let simName = this.getView().getModel("lineSimulationModel").getProperty("/Simulation_name");
                let simNameExists;
                if(!simName){
                    sap.m.MessageBox.error("Please Enter Simulation Name to save");
                    return;
                }
                let isError = oDataResp.validateBeforeSave(this);
                if(isError){
                    sap.m.MessageBox.error("Please fill the manditory fields");
                    return;
                }
                this.getView().setBusy(true);
                let fSimName = new sap.ui.model.Filter("Simulation_name","EQ",simName);
                let mParameters1 = {
                    filters: [fSimName],
                    success: function(oData,results){
                        if(oData.results && oData.results.length !== 0){
                            simNameExists = true;
                        }else{ 
                            simNameExists = false;
                        }

                        if(this.newSimulation && simNameExists){
                            sap.m.MessageBox.error("Simulation Name already Exists.Choose Other name or Edit exiting simulation");
                            this.getView().setBusy(false);
                            return;
                        }

                        let aDeferredGroups = this.oDataModel.getDeferredGroups();
                        aDeferredGroups = aDeferredGroups.concat(["simHeader"]);
                        this.oDataModel.setDeferredGroups(aDeferredGroups);
        
                      
        
                        
        
                        // Simulation table data 
                        let updateData= (this.getView().getModel("lineSimulationModel").getProperty("/changedArray")) ? this.getView().getModel("lineSimulationModel").getProperty("/changedArray") : [];

                        let createData = oDataResp.populateCreateArray(this);
                        if(createData && createData.length !== 0){
                        this.saveData(createData, updateData, simName,simNameExists);
                        this.submitBatch(createData,updateData,simName,isSimulate,simNameExists);
                        }else{
                            sap.m.MessageBox.error("Enter Simulation Data to Save");
                            this.getView().setBusy(false);
                            return;
                        }
                    }.bind(this),
                    error: function(oError){
                        this.getView().setBusy(false);
                        this.raiseBackendException(oError);
                    }.bind(this)
                }

                this.oDataModel.read("/SimulationData",mParameters1)
            
            },

            submitBatch: function(createData,updateData,simName,isSimulate,simNameExists){
                this.getView().setBusy(true);
                // submit the changes
                this.oDataModel.submitChanges({
                    groupId: "simHeader",
                    success: function(oRetrievedResult,response){
                        this.getView().setBusy(false);
                        oDataResp.showSubmitMessage(oRetrievedResult,response,this,simName,isSimulate,simNameExists,createData);
                    }.bind(this),
                    error: function(oError){
                        oDataResp.handleBatchError(oError,this);
                    }.bind(this)
                });
            },

            saveData: function (createData, updateData, simName,simNameExists) {
                // create data which was added
                if (createData && createData.length !== 0) {
                    createData.forEach(function (oItem, index) {
                        delete oItem.edit;
                        delete oItem.mode;
                        if (!Array.isArray(oItem.Line_ID)) {
                            oItem.Line_ID = oItem.Line_ID.split(",");
                        }
                        oItem.Simulation_name = simName;
                        if (oItem.Line_ID && oItem.Line_ID.length !== 0) {
                            let i;
                            for (i = 0; i < oItem.Line_ID.length; i++) {
                                let backendObj = JSON.parse(JSON.stringify(oItem));
                                backendObj.Line_ID = oItem.Line_ID[i];
                                this.oDataModel.create("/SimulationHeader", backendObj, {
                                    changeSetId: "createSimHeaderData",
                                    groupId: "simHeader"
                                })
                            }
                        } else {
                            this.oDataModel.create("/SimulationHeader", oItem, {
                                changeSetId: "createSimHeaderData",
                                groupId: "simHeader"
                            })
                        }
                    }.bind(this));
                }

            },

            submitSimulationName: function(isSimulate,simName,simNameExists){
                this.getView().setBusy(true);
                let aDeferredGroups = this.oDataModel.getDeferredGroups();
                aDeferredGroups = aDeferredGroups.concat(["simHeaderName"]);
                this.oDataModel.setDeferredGroups(aDeferredGroups);
                // if simulation name exists don't create, else create
                
                let simData = {
                    "Simulation_name": simName,
                    "Status": "Not Started"
                };
                let mParameters ={
                    changeSetId: "createSimName",
                    groupId: "simHeaderName"
                    
                };

                if(!simNameExists){
                    this.oDataModel.create("/SimulationData",simData,mParameters);
                }
                // submit the changes
                this.oDataModel.submitChanges({
                    groupId: "simHeaderName",
                    success: function(oRetrievedResult,response){
                        this.getView().setBusy(false);
                        this.handleBatchSuccessSimName(oRetrievedResult,response,isSimulate,simName);
                    }.bind(this),
                    error: function(oError){
                        oDataResp.handleBatchError(oError,this);
                    }.bind(this)
                });
            },

            handleBatchSuccessSimName: function(oRetrievedResult,response,isSimulate,simName){
                let errorText;
                try {
                    let i;
                    for (i = 0; i < oRetrievedResult.__batchResponses.length; i++) {
                        if (oRetrievedResult.__batchResponses[i].response && oRetrievedResult.__batchResponses[i].response.statusCode) { 
                                errorText = JSON.parse(oRetrievedResult.__batchResponses[i].response.body).error.message.value;
                                break;
                        } 
                    }
                    if (errorText) {
                        sap.m.MessageBox.error(errorText);
                        return;
                    }else{
                        this.getView().getModel("lineSimulationModel").setProperty("/createArray",[]);
                        this.getView().getModel("lineSimulationModel").setProperty("/changedArray",[]);
                        this.showSuccessorCallSimulate(isSimulate,simName);
    
                    }
                } catch (e) { 
                    this.getView().getModel("lineSimulationModel").setProperty("/createArray",[]);
                    this.getView().getModel("lineSimulationModel").setProperty("/changedArray",[]);
                    this.showSuccessorCallSimulate(isSimulate,simName);
                }
            },
            showSuccessorCallSimulate: function(isSimulate,simName){
            if(isSimulate){
                this.callBackendSimulate();
            } else{
            sap.m.MessageBox.success("Data Saved Successfully");
            this.setSimulationStatus();
            this.getView().getModel("lineSimulationModel").setProperty("/createArray",[]);
            this.getView().getModel("lineSimulationModel").setProperty("/changedArray",[]);
            oDataResp.setHeaderTableVisibleMode(this);
            this.getView().getModel("lineSimulationModel").setProperty("/lineid_dd",this.allLineids);
            this.getView().getModel("lineSimulationModel").refresh(true);

            }
        },

            onCloneSimulation: function(oEvent){
                let simName = this.getView().getModel("lineSimulationModel").getProperty("/Simulation_name");
                if(!simName){
                    sap.m.MessageToast.show("Select a Simulation to Clone");
                    return;
                }
                
                let simulationItem = this.getView().getModel("lineSimulationModel").getProperty("/simulationItem");

                simulationItem.forEach(function(oItem,index){
                    oItem.edit = true;
                    oItem.Simulation_name = simName
                    oItem.mode = "I";
                });

                this.getView().getModel("lineSimulationModel").setProperty("/simulationItem",simulationItem);

                this.getView().getModel("lineSimulationModel").setProperty("/Simulation_name",null);
                
                let createArray = JSON.parse(JSON.stringify(simulationItem))

                this.getView().getModel("lineSimulationModel").setProperty("/createArray",createArray);
                this.getView().getModel("lineSimulationModel").refresh(true);

                this.getView().getModel("lineSimulationModel").setProperty("/simulationStatus","");
                this.resetSmartTableData();
                this.getView().getModel("lineSimulationModel").setProperty("/newSimulation",true);
                this.newSimulation = true;
                
                sap.m.MessageBox.information("Clone Completed.Provide Simulation name and Save to Create a new simulation");
                
                
            },

            onCreateSimLine: function(oEvent){
                let tableData = this.getView().byId("simulationHTable").getModel("lineSimulationModel").getProperty("/simulationItem");
                tableData = (tableData && tableData.length !== 0) ? tableData : [];
                let obj = {
                    "Simulation_name": this.getView().getModel("lineSimulationModel").getProperty("/Simulation_name"),
                    "From_GHSite": "",
                    "CM": "",
                    "Site": "",
                    "Program": "",
                    "Line_ID": [],
                    "Line_Type": "",
                    "To_GHSite": "",
                    "To_CM":"",
                    "To_Site":"",
                    "To_Program":"",
                    "To_Business_Grp": "",
                    "createdBy": "",
                    "modifiedBy": "",
                    "mode": "I",
                    "edit": true
                }
                tableData.push(obj);
                this.getView().byId("simulationHTable").getModel("lineSimulationModel").setProperty("/simulationItem",tableData);
            },

            onClearSimulation: function(oEvent){
                this.getView().getModel("lineSimulationModel").setProperty("/Simulation_name",null);
                this.getView().byId("simulationHTable").getModel("lineSimulationModel").setProperty("/simulationItem",[]);
                this.getView().byId("simulationHTable").removeSelections(true);
                this.getView().getModel("lineSimulationModel").setProperty("/createArray",[]);
                this.getView().getModel("lineSimulationModel").setProperty("/changedArray",[]);
                this.getView().getModel("lineSimulationModel").setProperty("/simulationStatus","");
                this.getView().getModel("lineSimulationModel").setProperty("/addEnable",false);
                
                this.resetSmartTableData();
            },
            resetSmartTableData: function(oEvent){
            if(this.getView().byId("rfidEquipTable").getTable().getBinding("rows")){
            this.getView().byId("rfidEquipTable").getTable().getBinding("rows").filter([new Filter("Simulation_name",FilterOperator.EQ,null)]);
            }
            if(this.getView().byId("nonrfidEquipTable").getTable().getBinding("rows")){
            this.getView().byId("nonrfidEquipTable").getTable().getBinding("rows").filter([new Filter("Simulation_name",FilterOperator.EQ,null)]);
            }
            if(this.getView().byId("carryoversimulationTable").getTable().getBinding("rows")){
            this.getView().byId("carryoversimulationTable").getTable().getBinding("rows").filter([new Filter("Simulation_name",FilterOperator.EQ,null)]);
            }
            },

            onRemoveSimLine: function(oEvent){
                try {
                this.getView().byId("simulationHTable").setBusy(true);
                let simulationH = this.getView().getModel("lineSimulationModel").getProperty("/simulationItem");
                let selectedContexts = this.getView().byId("simulationHTable").getSelectedContexts();
                let createArray = this.getView().getModel("lineSimulationModel").getProperty("/createArray");
                let j;
                for(j = selectedContexts.length - 1; j >= 0; j--){
                    let path = selectedContexts[j].getPath();
                    let index =  parseInt(path.substring(path.lastIndexOf("/") + 1));
                    let isEdit = this.getView().getModel("lineSimulationModel").getProperty("/simulationItem/"+ index + "/edit");
                    if(isEdit){
                    simulationH.splice(index, 1);
                    if(createArray && createArray.length !== 0 ){
                    createArray.splice(index,1);
                    }
                    oDataResp.resetFilterForLineId(this);
                    }
                }
                this.getView().byId("simulationHTable").removeSelections(true);
                this.getView().byId("simulationHTable").setBusy(false);
                this.getView().getModel("lineSimulationModel").refresh(true);
            } catch (error) {
                this.getView().byId("simulationHTable").setBusy(false);    
            }
            },
            getLineId: function(oEvent){
              oDataResp.getLineId(oEvent,this);
            },
            getAjaxLineIdUrl: function(){
                let oDataUrl;
                if(this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps"){
                    oDataUrl = "/coa-api/v1/coa/line-simulation-service/BeforeSimulateValidation";
                }else{
                    oDataUrl = "/coa-api-ext/v1/ext/coa/line-simulation-service/BeforeSimulateValidation";
                }
               return oDataUrl; 
            },
            callCAPForLineId: function(ghsite,program,index,runTimeId,that){
                oDataResp.callCAPForLineId(ghsite,program,index,runTimeId,this);
            },

            onTaleDataChange: function(oEvent){
                if(oEvent.getSource().getId().search("lineid") !== -1){
                    this.lineIdSelctionFinish(oEvent);
                }
                if(oEvent.getSource().getId().search("fromghsite") !== -1 || oEvent.getSource().getId().search("cmbfromprogram") !== -1){
                    oDataResp.filterLindIds(oEvent,this);
                }
                let bindingPath = oEvent.getSource().getParent().getBindingContext("lineSimulationModel").getPath();
                let changedRow = this.getView().getModel("lineSimulationModel").getProperty(bindingPath);
                let currentMode = changedRow.mode;
                let existingRecord;
                let index =  parseInt(bindingPath.substring(bindingPath.lastIndexOf("/") + 1));

                if(currentMode === 'I'){
                if(changedRow.From_GHSite && changedRow.Program){
                let createArray = (this.getView().getModel("lineSimulationModel").getProperty("/createArray")) ? 
                                   this.getView().getModel("lineSimulationModel").getProperty("/createArray") : [] ;
                 existingRecord = oDataResp.getExistingRecord(createArray,changedRow);
                    if(!existingRecord){
                        createArray.push(changedRow);
                    }else{
                        createArray[index] = changedRow;
                    }
                this.getView().getModel("lineSimulationModel").setProperty("/createArray",createArray);
                }

                }

            },
            getSimulateAjaxUrl: function(){
                let oDataUrl;
                if(this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps"){
                    oDataUrl = "/coa-api/v1/coa/line-simulation-service/OnSimulate";
                }else{
                    oDataUrl = "/coa-api-ext/v1/ext/coa/line-simulation-service/OnSimulate";
                }
                return oDataUrl;
            },
            onSimulate: function(oEvent){
                let createArray = this.getView().getModel("lineSimulationModel").getProperty("/createArray");
                if(createArray && createArray.length !== 0){
                    this.onSaveSimulation(null,true);
                }else{
                    this.callBackendSimulate();
                }
                
            },

            callBackendSimulate: function(oEvent){
                let that = this;
                this.getView().setBusy(true);
                let simName = this.getView().getModel("lineSimulationModel").getProperty("/Simulation_name");

                let sErrorCheck = oDataResp.validateBeforeSimulate(this);

                if (sErrorCheck) {
                    sap.m.MessageBox.error("Please save simulation data before simulate");
                    return;
                }
                
                let oDataUrl = this.getSimulateAjaxUrl();
                

                let payload = {
                    "simulationName": simName
                };

                let payloadData = JSON.stringify(payload);

                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadData,
                    headers: {
                        "appid": that.getOwnerComponent().getModel("device").getProperty("/appid")
                    },
                    success: function (data) {
                        that.getView().setBusy(false);
                        that.getView().byId("btnGetSim").firePress();
                        sap.m.MessageBox.success("Simulate Triggered Successfully");
                    },
                    error: function(oError){
                        that.getView().setBusy(false);
                        that.raiseBackendException(oError);
                    }
                });
            },

             // Common Error Function
             raiseBackendException: function (oError) {
                if (oError.status === 504 || oError.statusCode === 504 || oError.status === 502 || oError.statusCode === 502) {
                   this.raiseAjaxException(oError);

                } else if (oError.status === 400) {
                    this.raiseCustomExceptionCAP(oError);
                }
                else {
                    this.raiseSystemException(oError);
                }

            },

            raiseAjaxException: function(oError){
                let message = "", xmlDoc;
                let parser = new DOMParser();
                if (oError.responseText) {
                    xmlDoc = parser.parseFromString(oError.responseText, "text/xml");
                } else {
                    xmlDoc = parser.parseFromString(oError.response.body, "text/xml");
                }
                if (xmlDoc.getElementsByTagName("title") && xmlDoc.getElementsByTagName("title").length !== 0) {
                    message = xmlDoc.getElementsByTagName("title")[0].innerHTML;
                }
                if(!message){
                    message = oError.responseText;
                }
                sap.m.MessageBox.error("Unexpected System Error. Please Contact Technical Support",{
                    title: "System Error"+ ' - ' + message,
                    details: message
                });
            },

            raiseSystemException: function(oError){
                let message = "";
                try {
                    let errorResp = JSON.parse(oError.responseText);
                    message = errorResp.error.message.value;
                } catch (e) {
                    message = oError.responseText;

                    if (!message && oError.message) {
                        message = oError.message;
                    }
                }
                try{
                sap.m.MessageBox.error("Unexpected System Error. Please Contact Technical Support",{
                    title: "System Error"+ ' - ' + message,
                    details: message
                });
                }catch(e){
                    sap.m.MessageBox.error(message);
                }
            },

            raiseCustomExceptionCAP: function(oError){
                let message = "";
                try {
                    let errorResp = JSON.parse(oError.responseText);
                    message = errorResp.error.message.value;
                } catch (e) {
                    message = oError.responseText;

                    if (!message && oError.message) {
                        message = oError.message;
                    }
                }
                sap.m.MessageBox.error(message);
            },
            lineIdSelctionFinish: function(oEvent){
                oDataResp.lineIdSelctionFinish(oEvent,this);
                
            },

            onLineIdClick: function(oEvent){
                this.getLineId(oEvent);
            },

            onDownloadSimLine: function () {

                let oSimItemModel = this.getView().getModel("lineSimulationModel").getProperty("/simulationItem");
                let selectedContexts = this.getView().byId("simulationHTable").getSelectedContextPaths();
                let lineIds = this.getView().getModel("lineSimulationModel").getProperty("/lineid_dd");
                let selectLineIdDownload;
                let i,j;

                let oDataSource = [];

                if (selectedContexts.length > 0) {
                    for (i = 0; i < selectedContexts.length; i++) {
                        let selLineArray = this.getView().getModel("lineSimulationModel").getProperty(`${selectedContexts[i]}/Line_ID`);
                          selectLineIdDownload = oDataResp.setSelectedLineId(lineIds,selLineArray,selectedContexts[i],this);
                        oDataSource.push({
                            GH_Site: this.getView().getModel("lineSimulationModel").getProperty(`${selectedContexts[i]}/From_GHSite`),
                            Program: this.getView().getModel("lineSimulationModel").getProperty(`${selectedContexts[i]}/Program`),
                            Line_ID: selectLineIdDownload, //this.getView().getModel("lineSimulationModel").getProperty(`${selectedContexts[i]}/Line_ID`).toString(), //oSimItemModel[selIndices[i]].Line_ID.toString(),
                            To_GHSite: this.getView().getModel("lineSimulationModel").getProperty(`${selectedContexts[i]}/To_GHSite`),
                            To_Program: this.getView().getModel("lineSimulationModel").getProperty(`${selectedContexts[i]}/To_Program`), //oSimItemModel[selIndices[i]].To_Program,
                            To_Business_Grp: this.getView().getModel("lineSimulationModel").getProperty(`${selectedContexts[i]}/To_Business_Grp`)
                        });
                    }
                } else {
                    for (j = 0; j < oSimItemModel.length; j++) {
                        selectLineIdDownload = oDataResp.setSelectedLineIdSelectAll(lineIds,oSimItemModel[j].Line_ID,oSimItemModel[j],this);
                        oDataSource.push({
                            GH_Site: oSimItemModel[j].From_GHSite,
                            Program: oSimItemModel[j].Program,
                            Line_ID: selectLineIdDownload, //oSimItemModel[j].Line_ID.toString(),
                            To_GHSite: oSimItemModel[j].To_GHSite,
                            To_Program: oSimItemModel[j].To_Program,
                            To_Business_Grp: oSimItemModel[j].To_Business_Grp
                        });
                    }
                }

                let aCols = [];
                aCols.push({
                    label: 'From GH Site',
                    property: 'GH_Site'
                });

                aCols.push({
                    label: 'From Program',
                    property: 'Program'
                });

                aCols.push({
                    label: 'Line Id',
                    property: 'Line_ID'
                });

                aCols.push({
                    label: 'To GH Site',
                    property: 'To_GHSite'
                });

                aCols.push({
                    label: 'To Program',
                    property: 'To_Program'
                });

                aCols.push({
                    label: 'Business Group',
                    property: 'To_Business_Grp'
                });

                let oSettings = {
                    workbook: {
                        columns: aCols,
                        hierarchyLevel: 'Level'
                    },
                    dataSource: oDataSource,
                    fileName: 'Simulation Data.xlsx'
                };

                let oSheet = new sap.ui.export.Spreadsheet(oSettings);
                oSheet.build().finally(function () {
                    oSheet.destroy();
                });
            },

            getFilterPath: function(tableEntity,sFilterInUrl){
                let serviceUri = this.getOwnerComponent().getModel("MainModel").sServiceUrl;
                let sPath = serviceUri + `/${tableEntity}?$format=json` + sFilterInUrl;

                return sPath;
            },
            fillFiltersforExport: function (aFilters,smartTable,tableEntity,keys) {
                let allRecordsLoaded = true,sFilterInUrl,i;
                try{
                    this.getView().setBusy(true);
                for ( i = 0; i < smartTable.getTable().getSelectedIndices().length; i++) {
                    
                    let selIndices = smartTable.getTable().getSelectedIndices()[i];
                    if(smartTable.getTable().getContextByIndex(selIndices)){
                    let entityTypesArr = this.getView().getModel().getServiceMetadata().dataServices.schema[0].entityType;
                    let currEntity = entityTypesArr.filter(data => data.name === tableEntity);
                    let currPropArr = currEntity[0].property;
                    let names = keys;


                    if (currPropArr && currPropArr.length !== 0) {
                         aFilters = this.fillFilterArray(currPropArr,names,selIndices,aFilters,smartTable);

                    }
                } else{
                    allRecordsLoaded = false;
                    break;
                }
                }
                this.getView().setBusy(false);
            } catch(e){
                this.getView().setBusy(false);
            }
                
                if(allRecordsLoaded){
                    sFilterInUrl = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, this.getOwnerComponent().getModel("MainModel").oMetadata, this.getOwnerComponent().getModel("MainModel").oMetadata._getEntityTypeByPath(tableEntity));
               } else{
                   sFilterInUrl = smartTable.getTable().getBinding("rows").sFilterParams;
               }
               return sFilterInUrl;
            },

            fillFilterArray: function(currPropArr,names,selIndices,aFilters,smartTable){
                let j;
                for ( j = 0; j < currPropArr.length; j++) {
                    if (names.includes(currPropArr[j].name)) {
                        let value = smartTable.getTable().getContextByIndex(selIndices).getProperty(currPropArr[j].name);
                        aFilters.push(new Filter(currPropArr[j].name, FilterOperator.EQ, value));
                    }
                }
                return aFilters;
            },

            getsmatTableKeys: function(tableEntity){
                let keys = [];
                switch (tableEntity) {
                    case 'RfidSimu':
                        keys = ["Simulation_name","GHSite","To_CM","To_Site","To_Program","Line_Id","Line_Id","CM_Program","RFID","AQID"];
                      break;
                    case 'NonRfidSimu':
                        keys = ["Simulation_name","GH_Site","CM","Site","Program","Aqid","Station","Group_Priority","Scope","Line_Type","UPH","Line_Id","Sequence_No"];
                      break;    
                    case 'COSimu':
                        keys = ["Simulation_name","From_GHSite","From_Product","To_Product","To_Site"];
                      break;
                    default:

                    break;
                }
                return keys;
            },

            onBeforeExportLine: function(oEvent,tableEntity){
                let aFilters = [];
                let smartTable = this.getView().byId(oEvent.getSource().getId());


                if (smartTable.getTable().getSelectedIndices().length !== 0 &&
                    smartTable.getTable().getSelectedIndices().length !== oEvent.getSource().getTable().getBinding("rows").getLength() &&
                    smartTable.getTable().getSelectedIndices().length <= 200000) {

                    let keys = this.getsmatTableKeys(tableEntity);
                    let sFilterInUrl = this.fillFiltersforExport(aFilters,smartTable,tableEntity,keys);
                    sFilterInUrl = "&" + sFilterInUrl;

                    let sPath = this.getFilterPath(tableEntity,sFilterInUrl);
                    oEvent.getParameter("exportSettings").dataSource.count = smartTable.getTable().getSelectedIndices().length;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = sPath;

                }

                oDataResp.setLimitonDownload(oEvent,this);

                this.setDateTimeDuringExport(oEvent);
            },
            setDateTimeDuringExport: function (oEvent) {
                oDataResp.setLimitonDownload(oEvent);
            },

            onDeleteSimulation: function(oEvent){
                let simName = this.getView().getModel("lineSimulationModel").getProperty("/Simulation_name");
                if(!simName){
                    sap.m.MessageBox.error("Enter Simulation Name to Delete");
                    return;
                }
                sap.m.MessageBox.warning("Are you Sure.want to delete?", {
                    actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.CANCEL,
                    onClose: function (sAction) {
                       if(sAction === "OK"){
                            this.callDeleteAction(simName);
                       }
                    }.bind(this)
                });
            },

            getAjaxDeleteUrl: function(){
                let oDataUrl;
                if(this.getOwnerComponent().getModel("device").getProperty("/origin") === "corp-apps"){
                    oDataUrl = "/coa-api/v1/coa/line-simulation-service/DeleteSimulation";
                }else{
                    oDataUrl = "/coa-api-ext/v1/ext/coa/line-simulation-service/DeleteSimulation";
                }
               return oDataUrl; 
            },

            callDeleteAction: function(simName){
                this.getView().setBusy(true);
                let that = this;
                let oDataUrl = this.getAjaxDeleteUrl();
                let simNameObj = {
                    simulationName: simName
                };
                let payloadData = JSON.stringify(simNameObj);

                $.ajax({
                    url: oDataUrl,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: payloadData,
                    headers: {
                        "appid": that.getOwnerComponent().getModel("device").getProperty("/appid")
                    },
                    success: function (data) {
                        oDataResp.deleteSuccess(data,that);  
                    },
                    error: function (oError) { 
                        that.getView().setBusy(false);
                        that.raiseBackendException(oError);
                    }
                });

            }
            
        });
    });