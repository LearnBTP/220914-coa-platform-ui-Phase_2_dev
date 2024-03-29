sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "coa/aqidmappingui/model/models",
    "coa/aqidmappingui/localService/mockserver",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox",
    "sap/base/util/UriParameters"
],
    function (UIComponent, Device, models, MockServer, ODataModel,MessageBox, UriParameters) {
        "use strict";

        return UIComponent.extend("coa.aqidmappingui.Component", {
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

                        appODataModel = new ODataModel('/mock/AQID_Details', {
                            json: true,
                            useBatch: true,
                            defaultCountMode: "Inline",
                            defaultBindingMode: "TwoWay"
                        });
                        appODataModel.attachBatchRequestCompleted(function (param1, param2) {
                            sap.ui.core.BusyIndicator.hide();
                        });
                        this.initializeApp(appODataModel, "MainModel", ["AqidReadOnly", "AqidModify"],'corp-apps');
                        this.getModel("device").setProperty("/isMockServer",true);
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
                        this.getModel("device").setProperty("/isMockServer",false);

                    }).catch(error => {
                        this.showError(error.message);
                    });
                }

            },

            validatePromiseAndInitApp: function (values) {
                let appODataModel;

                //Check whether inside an iframe

                if (window.location === window.parent.location) {
                    this.showError("Please access Annotations application from Portal");
                    return;
                }
                if ((values[0] && values[0] !== "") &&
                    (values[1] && values[1].decodedJWTToken.scope)) {
                    let sPath;
                    let sPathChangelog;
                    let oModel1 = new sap.ui.model.json.JSONModel();        // intialise authorization model
                    this.setModel(oModel1, "authModel");
                    
                    if (values[1].decodedJWTToken.origin === "corp-apps") {
                        sPath = "/coa-api/v1/coa/db-services/aqid-details/";
                        sPathChangelog = "/coa-api/v2/coa/changelog-services/changelog/";
                    } else {
                        sPath = "/coa-api-ext/v1/ext/coa/db-services/aqid-details/";
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
                    if (scopes.find(e => e === "AqidReadOnly" || e === "AqidModify")) {

                        // Main Model oData Initialization    
                    appODataModel = new sap.ui.model.odata.v2.ODataModel(sPath, {
                        headers: {
                            "appid": values[0]
                        },
                        disableHeadRequestForToken: true,
                        useBatch: true,
                        defaultCountMode: "Inline",
                        defaultBindingMode: "TwoWay"
                    });

                    appODataModel.attachMetadataFailed(function (oEvent) {
                        let response = oEvent.getParameters().response;
                        this.showError(`${response.responseText} ${response.message}`);
                    }.bind(this));

                    appODataModel.attachBatchRequestCompleted(function () {
                        sap.ui.core.BusyIndicator.hide();
                    });

                    this.initializeApp(appODataModel, "MainModel", roleScopes.flat(), values[1].decodedJWTToken.origin);

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
                    appODataChangeLogModel.attachRequestFailed(function (oEvent) {
                        let response = oEvent.getParameters().response;
                        this.showError(`${response.responseText} ${response.message}`);

                    });
                    this.setModel(appODataChangeLogModel, "changeLogModel");


                    }
                    // else condition
                    else {
                        this.initializeApp(appODataModel, "MainModel", []);

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
                    if (scopes.find(e => e === "AqidModify")) {
                        this.getModel("authModel").setProperty("/modifiy", true);
                        this.getModel("authModel").setProperty("/display", true);
                    } else {
                        this.getModel("authModel").setProperty("/modifiy", false);
                        this.getModel("authModel").setProperty("/display", false);
                    }
                    if (scopes.find(e => e === "AqidReadOnly")) {
                        this.getModel("authModel").setProperty("/display", true);
                    } else {
                        this.getModel("authModel").setProperty("/display", false);
                    }
                    if(scopes.find(e => e === "SyncActionAll")){
                        this.getModel("authModel").setProperty("/syncButton", true);
                    }else{
                        this.getModel("authModel").setProperty("/syncButton", false);
                    }
                } else {
                    this.getModel("authModel").setProperty("/display", false);
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
                    "Unexpected System Error. Please Contact Technical Support", {
                    icon: MessageBox.Icon.ERROR,
                    title: "System Error",
                    actions: [MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK,
                    details: msgText
                });
            }
        });
    }
);
