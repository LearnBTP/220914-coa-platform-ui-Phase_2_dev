sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "coasublineui/model/models",
    "coasublineui/localService/mockserver",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox",
    "sap/base/util/UriParameters"
],
    function (UIComponent, Device, models, MockServer, ODataModel, MessageBox, UriParameters) {
        "use strict";

        return UIComponent.extend("coasublineui.Component", {
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


                let isMockServer = UriParameters.fromURL(window.location.href).get("responderOn");
                let NoAuth = UriParameters.fromURL(window.location.href).get("NoAuth");
                let myPromises = [];
                if (isMockServer) {
                    myPromises.push(MockServer.init());
                    Promise.all(myPromises).catch(function (oError) {
                        this.showError(oError.message);
                    }).finally(function () {
                        this.initMockServer(NoAuth);
                    }.bind(this));

                } else {
                    //Check whether inside an iframe

                    if (window.location === window.parent.location) {
                        this.showError("Please access Annotations application from Portal");
                        return;
                    }
                    let apiError = [];
                    //App Variables
                    myPromises.push(new Promise((res, rej) => {

                        fetch("/getUserInfo")
                            .then(lres => lres.json())
                            .then(val => {
                                res(val);
                            })
                            .catch((error) => {
                                apiError.push('User Info API');
                                rej();
                            });
                    }));

                    myPromises.push(new Promise((res, rej) => {
                        fetch("/getAppVariables")
                            .then(lres => lres.json())
                            .then(val => {
                                res(val);
                            })
                            .catch((error) => {
                                apiError.push('App Variable API');
                                rej();
                            });
                    }));
                    
                    await Promise.all(myPromises).then((values) => {
                        //AppId and Roles check
                        if ((values[0] && values[0].decodedJWTToken.scope) && (values[1] && values[1] !== "")) {
                            let origin = values[0].decodedJWTToken.origin;
                            let roleScopes = values[0].decodedJWTToken.scope.map(str => {
                                let v = str.match(/\.\S+/g);
                                if (v) {
                                    return v.map(e => e.substr(1));
                                } else {
                                    return str;
                                }
                            }) || [];
                            this.initializeApp(false, roleScopes, values[1], origin);
                        }
                    }).catch(error => {
                        this.showError('Failed to fetch BTP configuration - ' + apiError.toString());
                    });

                }
            },
            initMockServer: function (NoAuth) {
                if (NoAuth) {
                    this.initializeApp(true, [], "corp-apps");
                } else {
                    this.initializeApp(true, ['SubLineModify', 'SubLineReadOnly'], "corp-apps");
                }
            },
            showError: function (msgText) {
                MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                    title: "System Error",
                    icon: MessageBox.Icon.ERROR,
                    actions: [MessageBox.Action.OK],
                    details: msgText
                });
            },
            initializeApp: function (isMock, allScopes, appid, origin) {
                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                let appODataModel, oDataURl, chgLogUrl;
                let scopes = allScopes.flat();
                if (isMock) {
                    oDataURl = "/mock/lineplanService";
                    appODataModel = new ODataModel(oDataURl, { json: true });
                }
                else {
                    // CAPM lineplan Service model
                    if (origin === "corp-apps") {
                        oDataURl = "/coa-api/v1/coa/lineplan-services/lineplan";
                        chgLogUrl = "/coa-api/v2/coa/changelog-services/changelog/";
                    } else {
                        oDataURl = "/coa-api-ext/v1/ext/coa/lineplan-services/lineplan";
                        chgLogUrl = "/coa-api-ext/v2/ext/coa/changelog-services/changelog/";
                    }

                    if (scopes.find(e => e === "SubLineReadOnly" || e === "SubLineModify")) {

                        appODataModel = new sap.ui.model.odata.v2.ODataModel(oDataURl, {
                            headers: {
                                "appid": appid
                            },
                            defaultOperationMode: "Server",
                            disableHeadRequestForToken: true,
                            useBatch: true,
                            defaultCountMode: "None",
                            defaultBindingMode: "TwoWay"
                        });
    
                        appODataModel.attachMetadataFailed(function () {
                            this.showError('Metadata loading failed');
                        }.bind(this));
    
                        appODataModel.attachBatchRequestCompleted(function () {
                            sap.ui.core.BusyIndicator.hide();
                        });
                        appODataModel.attachBatchRequestFailed(function (oEvent) {
                            let response = oEvent.getParameters().response
                            MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                                title: "System Error",
                                details: `${response.responseText} ${response.message}`
                            });
                        });
                        // CAPM Change History Service
                        let appODataChangeLogModel = new sap.ui.model.odata.v2.ODataModel(chgLogUrl, {
                            headers: {
                                "appid": appid
                            },
                            disableHeadRequestForToken: true,
                            defaultCountMode: "Inline",
                            defaultBindingModel: "TwoWay",
                            useBatch: false
                        });
                        appODataChangeLogModel.attachRequestFailed(function (oEvent) {
                            this.showError(oEvent.getParameters().response.statusText);
                        });
                        appODataChangeLogModel.attachBatchRequestFailed(function (oEvent) {
                            MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                                title: "System Error",
                                details: `${response.responseText} ${response.message}`
                            });
                        });
                        this.setModel(appODataChangeLogModel, "LogOdataModel");

                        
                    }         
                    
                }
                // View Bindings
                this.setModel(appODataModel, "oDataModel");
                let oModel1 = new sap.ui.model.json.JSONModel();
                oModel1.setProperty('/AuthorizationScopes', allScopes);
                oModel1.setProperty('/Appid', appid);
                oModel1.setProperty('/Origin', origin);
                this.setModel(oModel1);

            }
        });
    }
);