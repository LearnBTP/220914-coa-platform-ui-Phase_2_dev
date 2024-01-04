sap.ui.define([], function () {
    "use strict";
    return {
        handleUploadPress: function (oEvent,that) {
            let file = oEvent.getParameters().files[0];
            if (file.type !== "text/csv") {
                sap.m.MessageBox.error("Only CSV files are allowed.");
                return;
            }
            let filedata = oEvent.getParameter("files")[0];
            if( oEvent.getParameter("files")[0].size > 3298089 )
            {
                sap.m.MessageToast.show("File upload is allowed only for 10k records");
                return;
            }
            let l_url;
            let appid = that.getOwnerComponent().getModel().getProperty('/Appid');
            if (that.getOwnerComponent().getModel().getProperty('/Origin') === "corp-apps") {
                l_url = "/coa-api/v1/coa/lineplan-services/lineplan/Upload_SubLine/csv";
            } else {
                l_url = "/coa-api-ext/v1/ext/coa/lineplan-services/lineplan/Upload_SubLine/csv";
            }
            that.getView().setBusy(true);
            let settings = {
                "url": l_url,
                "method": "PUT",
                "headers": {
                    "Content-Type": "text/csv",
                    "appid": appid
                },
                "data": filedata,
                "processData": false,
                "error": function (err) {
                    that.getView().setBusy(false);
                    that.odataCommonErrorDisplay(err);
                },
            };

            $.ajax(settings).done(function (response) {
                that.getView().setBusy(false);
                that.getView().byId("fileUploader").clear();
                that.handleFileUploadStatus(response, that);
            });
        },
        handleFileUploadStatus: function (response, that) {
            let aFilter = that.getView().byId("smartFilterBar").getFilters();
            let  resp;
            if (response.d.msg) {
                resp = response.d.msg;
            } else if (response.d.d.msg) {
                resp = response.d.d.msg;
            }
            if (response && resp && Array.isArray(resp)) {
                sap.ui.core.Fragment.load({
                    name: "coasublineui.Fragments.UpdError",
                    controller: that
                }).then(function name(oFragment) {
                    that._oDialogErr = oFragment;
                    that._oDialogErr.setModel(new sap.ui.model.json.JSONModel(), "coaErr");
                    that._oDialogErr.getModel("coaErr").setProperty("/coaSubLine", resp);
                    that.getView().addDependent(that._oDialogErr);
                    that._oDialogErr.open();
                    if (aFilter.length !== 0) {
                        that.getView().byId("OTBRefresh").firePress();
                    }
                  

                }.bind(that));
                
            } else if (resp && resp.includes('Successfully')) {
                sap.m.MessageToast.show(resp);
                that.getView().byId("OTBRefresh").firePress();
            }
            else if (resp) {
                sap.m.MessageBox.error(resp, {
                    title: "System Error"
                });
            }

        },
        raiseDeleteStatus: function (errFlag, succFlg,that) {
            let lv_message = "";
            if (errFlag === true && succFlg === true) {
                lv_message = "Please check error column for more details";
            } else if (errFlag === false && succFlg === true) {
                sap.m.MessageBox.success("Deleted Successfully!");
                that.setTableToDisplay();
            } else if (errFlag === true && succFlg === false) {
                lv_message = "Please check error column for more details";
            }
            if (lv_message !== "") {
                sap.m.MessageBox.show(lv_message, {
                    icon: "INFORMATION",
                    actions: ["OK"]
                });
            }
        },


        handleSaveResponse : function(succFlg,errFlag,that){
            if (that.getView().byId("SubLineTab").isInitialised()) {
                that.getView().byId("SubLineTab").rebindTable();
                if(!errFlag){
                    that.onSearch();
                }
                
            }

        },
        updateBatchChangeResponse: function (response, tabData,that) {
            let respData, row, succFlg = false;
            let fRowIdx = that.getView().byId("SubLineTab").getTable().getFirstVisibleRow();
            for (let item of response) {
                if (item.statusCode[0] === '2') {
                    succFlg = true;
                    if (item.data) {
                        respData = item.data;
                        let idx = tabData.findIndex(el => el.CM === respData.CM && el.Site === respData.Site && el.Program === respData.Program && el.Sub_Line_Name === respData.Sub_Line_Name && el.Uph === respData.Uph)
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

        updateBatchCreateResponse: function (errFlag, succFlg, response, tabData,deleteFag,that) {
            let strMessage, respData, row;
            if (response.statusCode >= 400 && response.statusCode <= 499) {
                try {
                    errFlag = true;
                    strMessage = JSON.parse(response.body).error.message.value;
                    respData = JSON.parse(strMessage);
                    if(deleteFag){
                        row = tabData.find(el => el.CM === respData.CM &&  el.Site === respData.Site && el.Program === respData.Program
                            && el.Sub_Line_Name === respData.Sub_Line_Name && parseInt(el.Uph) === respData.Uph);

                    } else if(respData.hasOwnProperty("GH_Site")) {
                        row = tabData.find(el => el.GH_Site === respData.GH_Site && el.Program === respData.Program
                            && el.Sub_Line_Name === respData.Sub_Line_Name && parseInt(el.Uph) === respData.Uph && el.flgChg === 'C');
                    }
                    else if(respData.hasOwnProperty("Site")){
                        row = tabData.find(el => el.CM === respData.CM  &&  el.Site === respData.Site  && el.Program === respData.Program
                            && el.Sub_Line_Name === respData.Sub_Line_Name && parseInt(el.Uph) === respData.Uph && el.flgChg === 'U');
                    }
                   
                
                    if (row !== undefined) {
                        row.Error = respData.Error;
                    }
                }
                catch (err) {
                    that.onRaiseMessage("Unexpected System Error. Please Contact Technical Support");
                }
            }
            else if (response.statusCode >= 200 && response.statusCode <= 299) {
                succFlg = true;
            }

            return [errFlag, succFlg, tabData];
        },
       

        getSublineName: function (Field,that) {
            let oDataModel = that.getOwnerComponent().getModel("oDataModel");
            that.getView().setBusy(true);

            oDataModel.read("/F4help", {

                urlParameters: {
                    "$orderby": `${Field} asc`,
                    "$select": `${Field}`
                },

                success: function (oData) {
                    that.getView().setBusy(false);
                    that.bindResulttoModel(oData);
                   

                }.bind(that),
                error: function (oError) {
                    that.getView().setBusy(false);
                    that.odataCommonErrorDisplay(oError);
                }.bind(that)
            });
        },

        getExportFilters : function(oEvent,that){
            let allfilters = that.getView().byId("smartFilterBar").getFilters()[0].aFilters;
            let k, l, key, value, data, value1;
                for (k = 0; k < allfilters.length; k++) {

                   
                
                        let multiFilters = allfilters[k].aFilters;
                        if(multiFilters=== undefined){
                            key = allfilters[k].sPath;
                            value = allfilters[k].oValue1;
                            value1 = "=" + value;

                            data = {
                                "key": key,
                                "value": value1
                            };
                        
                            let defaultfilters = oEvent.mParameters.exportSettings.workbook.context.metainfo[1].items;
                            defaultfilters.push(data);


                        }
                        else{
                            for (l = 0; l < multiFilters.length; l++) {
                                key = multiFilters[l].sPath;
                                value = multiFilters[l].oValue1;
                                value1 = "=" + value;
    
                                data = {
                                    "key": key,
                                    "value": value1
                                };
                              
                                let defaultfilters = oEvent.mParameters.exportSettings.workbook.context.metainfo[1].items;
                                defaultfilters.push(data);
    
    
                            }

                        }
                       

                    
                   


                }


        },

    };
}, true);