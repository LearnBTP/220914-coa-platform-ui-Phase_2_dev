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
            if (oEvent.getParameter("files")[0].size > 3298089) {
                sap.m.MessageToast.show("File upload is allowed only for 10k records");
                return;
            }
            let l_url;
            let appid = that.getOwnerComponent().getModel().getProperty('/Appid');

            if (that.getOwnerComponent().getModel().getProperty('/Origin') === "corp-apps") {
                l_url = "/coa-api/v1/coa/lineplan-services/lineplan/Upload_MainLine/csv";
            } else {
                l_url = "/coa-api-ext/v1/ext/coa/lineplan-services/lineplan/Upload_MainLine/csv";
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
                "error": function (err, t) {
                    that.getView().setBusy(false);
                    that.odataCommonErrorDisplay(err);
                },
            };
            $.ajax(settings).done(function (response, data) {
                that.getView().setBusy(false);
                that.getView().byId("fileUploader").clear();
                that.handleFileUploadStatus(response, that);
            });
        },

        raiseDeleteStatus: function (errFlag, succFlg, that) {
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

        handleFileUploadStatus: function (response, that) {
            let resp;
            if (response.d.msg) {
                resp = response.d.msg;
            } else if (response.d.d.msg) {
                resp = response.d.d.msg;
            }
            if (response && resp && Array.isArray(resp)) {
                sap.ui.core.Fragment.load({
                    name: "coamainlineui.Fragments.UpdError",
                    controller: that
                }).then(function name(oFragment) {
                    that._oDialogErr = oFragment;
                    that._oDialogErr.setModel(new sap.ui.model.json.JSONModel(), "coaErr");
                    that._oDialogErr.getModel("coaErr").setProperty("/coaMainLine", resp);
                    that.getView().addDependent(that._oDialogErr);
                    that._oDialogErr.open();
                }.bind(that));
                that.getView().byId("OTBRefresh").firePress();
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

        handleSaveResponse: function (succFlg, errFlag, that) {
            if (that.getView().byId("MainLineTab").isInitialised()) {
                that.getView().byId("MainLineTab").rebindTable();
                if (!errFlag) {
                    that.onSearch();
                }

            }

        },

        getExportFilters: function (oEvent, that) {
            let allfilters = that.getView().byId("smartFilterBar").getFilters()[0].aFilters;
            let k, l, key, value, data, value1;
            for (k = 0; k < allfilters.length; k++) {



                let multiFilters = allfilters[k].aFilters;
                if (multiFilters === undefined) {
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
                else {
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
        applyTableLogFilter: function (oEvent, that) {
            let oBindingParams = oEvent.getParameter("bindingParams");
            oBindingParams.filters.push(new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("Table", "EQ", "T_COA_MAIN_LINE")
                ]
            }));

            // Replace removed duplicate fields to correct fields in this application
            oBindingParams.filters[0].aFilters.forEach(function (oItem, index) {
                if (oItem.oValue1 === "COMMENTS") {
                    oItem.oValue1 = "COMMENT";
                }
            });
        }
    };
}, true);