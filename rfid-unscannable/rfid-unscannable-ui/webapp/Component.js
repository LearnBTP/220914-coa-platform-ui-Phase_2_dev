/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/apple/coa/rfidunscannableui/model/models",
    "sap/base/util/UriParameters",
    "com/apple/coa/rfidunscannableui/localService/mockserver",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox"
],
    function (UIComponent, Device, models, UriParameters, MockServer, ODataModel, MessageBox) {
        "use strict";

        return UIComponent.extend("com.apple.coa.rfidunscannableui.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: async function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
                let myPromises = [];
                let appODataModel;
                let isMockServer = UriParameters.fromURL(window.location.href).get("responderOn");
                if (isMockServer) {
                    myPromises.push(MockServer.init());
                    Promise.all(myPromises).catch(function (oError) {
                        this.showError(oError.message);
                    }).finally(function () {

                        appODataModel = new ODataModel('/mock/rfid_unscannable', {
                            json: true,
                            useBatch: true,
                            defaultCountMode: "Inline",
                            defaultBindingMode: "TwoWay"
                        });
                        appODataModel.attachBatchRequestCompleted(function (param1, param2) {
                            sap.ui.core.BusyIndicator.hide();
                        });

                        sap.ui.core.BusyIndicator.hide();
                        this.initializeApp(appODataModel, "MainModel", ["UnScannableReadOnly","UnScannableModify","ApproveRfidOnHandTT","SyncActionAll"], 'corp-apps');
                        this.getModel("device").setProperty("/isMockServer", true);
                        this.getModel("authModel").setProperty("/syncButton", true);

                    }.bind(this));
                } else {
                    //App Variables
                    myPromises.push(new Promise((res, rej) => {

                        fetch("/getAppVariables")
                            .then(lres => lres.json())
                            .then(val => {
                                res(val);
                            })
                            .catch((error) => {
                                this.showError('Failed to Fetch Variables');
                            });
                    }));

                    // // User Info
                    myPromises.push(new Promise((res, rej) => {
                        fetch("/getUserInfo")
                            .then(lres => lres.json())
                            .then(val => {
                                res(val);
                            })
                            .catch((error) => {
                                this.showError('Failed to Fetch Roles');
                            });
                    }));

                    await Promise.all(myPromises).then((values) => {
                        //AppId
                        this.validatePromiseAndInitApp(values);
                        this.getModel("device").setProperty("/isMockServer", false);

                    }).catch(error => {
                        this.showError(error.message);
                    });


                }
            },
            validatePromiseAndInitApp: function (values) {
                
                //Check whether inside an iframe
                if (window.location === window.parent.location) {
                    this.showError("Please access COA application from Portal");
                    return;
                }
                if ((values[0] && values[0] !== "") &&
                (values[1] && values[1].decodedJWTToken.scope)) {
                let origin = values[1].decodedJWTToken.origin;
                let oModel1 = new sap.ui.model.json.JSONModel();        // intialise authorization model
                this.setModel(oModel1, "authModel");
                let sPath,sPathChangelog;
                if(origin === "corp-apps"){
                    sPath = "/coa-api/v1/coa/rfid-unscannable-service/";
                    sPathChangelog = "/coa-api/v2/coa/changelog-services/changelog/";
                }else{
                     sPath = "/coa-api-ext/v1/ext/coa/rfid-unscannable-service/";
                     sPathChangelog = "/coa-api-ext/v2/ext/coa/changelog-services/changelog/";
                }
                let roleScopes = values[1].decodedJWTToken.scope.map(str => {
                    let v = str.match(/\.\S+/g);
                    if (v) {
                        return v.map(e => e.substr(1));
                    } else {
                        return str;
                    }
                }) || [];
                this.appid = values[0];
                let scopes = roleScopes.flat();
                if (scopes.find(e => e === "UnScannableReadOnly" || e === "UnScannableModify" || e === "ApproveRfidOnHandTT" || e === "SyncActionAll")) {
                // Main Model oData Initialization    
                let appODataModel = new sap.ui.model.odata.v2.ODataModel(sPath, {
                    headers: {
                        "appid": values[0]
                    },
                    disableHeadRequestForToken: true,
                    useBatch: true,
                    defaultCountMode: "Inline",
                    defaultBindingMode: "TwoWay"
                });

                appODataModel.attachMetadataFailed(function () {
                    this.showError('Metadata loading failed');
                }.bind(this));

                appODataModel.attachBatchRequestCompleted(function () {
                    sap.ui.core.BusyIndicator.hide();
                });



                // Change log oData Model Initialization
                let appODataChangeLogModel = new sap.ui.model.odata.v2.ODataModel(sPathChangelog, {
                    headers: {
                        "appid": values[0]
                    },
                    disableHeadRequestForToken: true,
                    defaultCountMode: "Inline",
                    defaultBindingMode: "TwoWay",
                    useBatch: false

                });

                appODataChangeLogModel.attachMetadataFailed(function (oError) {
                    this.showError('Change log Metadata loading failed');
                }.bind(this));

                appODataChangeLogModel.attachRequestFailed(function (oEvent) {
                    let response = oEvent.getParameters().response;
                    this.showError(`${response.responseText} ${response.message}`);

                }.bind(this));

                this.setModel(appODataChangeLogModel, "changeLogModel");

                this.initializeApp(appODataModel, "MainModel", scopes, origin);
                this.getModel("device").setProperty("/isMockServer", false);
            }
            }
            },

            initializeApp: function (oDataModel, ModelName, scopes, sOrigin) {

                let globalMetamodel = oDataModel;
                this.setModel(globalMetamodel, ModelName);

                if (!this.getModel("authModel")) {
                    let oModel1 = new sap.ui.model.json.JSONModel();
                    this.setModel(oModel1, "authModel");
                }

                if (scopes && scopes.length !== 0) {
                    // Modify Flag
                    if (scopes.find(e => e === "UnScannableModify")) {
                        this.getModel("authModel").setProperty("/modifiy", true);
                    } else {
                        this.getModel("authModel").setProperty("/modifiy", false);
                    }

                    // Approve / Reject Flag
                    if (scopes.find(e => e === "ApproveRfidOnHandTT")) {
                        this.getModel("authModel").setProperty("/approve", true);
                    } else {
                        this.getModel("authModel").setProperty("/approve", false);
                    }

                    // Display Flag
                    if (scopes.find(e => e === "UnScannableReadOnly")) {
                        this.getModel("authModel").setProperty("/display", true);
                    } else {
                        this.getModel("authModel").setProperty("/display", false);
                    }

                    // Sync Button Flag
                    if (scopes.find(e => e === "SyncActionAll")) {
                        this.getModel("authModel").setProperty("/SyncActionAll", true);
                    } else {
                        this.getModel("authModel").setProperty("/SyncActionAll", false);
                    }
                }


                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                // set appid to device to use in controllers
                this.getModel("device").setProperty("/appid", this.appid);

                //Set origin 
                this.getModel("device").setProperty("/origin", sOrigin);

            },
            showError: function (msgText) {
                MessageBox.show(
                    msgText, {
                    icon: MessageBox.Icon.ERROR,
                    title: "Error",
                    actions: [MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK,
                });
            }

        });
    }
);