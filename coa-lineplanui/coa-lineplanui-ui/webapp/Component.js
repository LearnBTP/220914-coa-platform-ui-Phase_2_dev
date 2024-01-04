sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "coa/coalineplanui/model/models",
    "coa/coalineplanui/localService/mockserver",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox",
    "sap/base/util/UriParameters"
],
    function (UIComponent, Device, models, MockServer, ODataModel, MessageBox, UriParameters) {
        "use strict";

        return UIComponent.extend("coa.coalineplanui.Component", {
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

                var isMockServer = UriParameters.fromURL(window.location.href).get("responderOn");

                var myPromises = [];
                if (isMockServer) {
                    myPromises.push(MockServer.init());
                    Promise.all(myPromises).catch(function (oError) {
                        this.showError(oError.message);
                    }).finally(function () {
                        this.initializeApp(true, ['LinePlanReadOnly'],"", "corp-apps");
                    }.bind(this));
                } else {

                    //Check whether inside an iframe
                  
                    if(window.location === window.parent.location){
                        this.showError("Please access Line Plan application from Portal");
                        return;
                    }
                    var apiError = [];
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
                            var origin = values[0].decodedJWTToken.origin;
                            var roleScopes = values[0].decodedJWTToken.scope.map(str => {
                                var v = str.match(/\.\S+/g);
                                if (v) {
                                    return v.map(e => e.substr(1));
                                } else {
                                    return str;
                                }
                            }) || [];
                            
                           
                                this.initializeApp(false,roleScopes, values[1],origin);
                            
                           
                        }
                    }).catch(error => {
                        this.showError('Failed to fetch BTP configuration - ' + apiError.toString());
                    });
                }
            },
            showError: function (msgText) {
                MessageBox.show(
                    "Unexpected System Error. Please Contact Technical Support", {
                    icon: MessageBox.Icon.ERROR,
                    title: "System error",
                    details: msgText,
                    actions: [MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK
                });
            },
            initializeApp: function (isMock,  allScopes,appid,origin) {
                
                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                
                var appODataModel, oDataURl;
                var scopes = allScopes.flat();
                if (isMock) {
                    oDataURl = "/mock/lineplanService";
                    appODataModel = new ODataModel(oDataURl, { json: true });
                }
                else {
                    // CAPM lineplan Service model
                    if (origin === "corp-apps") {
                        oDataURl = "/coa-api/v1/coa/lineplan-services/lineplan";
                    } else {
                        oDataURl = "/coa-api-ext/v1/ext/coa/lineplan-services/lineplan";
                    }
                    if (scopes.find(e => e === "LinePlanReadOnly")) {

                        appODataModel = new sap.ui.model.odata.v2.ODataModel(oDataURl, {
                            headers: {
                                "appid": appid
                            },
                            useBatch: true,
                            defaultCountMode: "Inline",
                            disableHeadRequestForToken: true,
                            defaultBindingMode: "OneWay"
                        });
       
                appODataModel.attachMetadataFailed(function () {
                    this.showError('Metadata loading failed');
                }.bind(this));

                appODataModel.attachBatchRequestCompleted(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
                appODataModel.attachBatchRequestFailed(function (oEvent) {
                    var response = oEvent.getParameters().response
                    MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                        title: "System Error",
                        details: `${response.responseText} ${response.message}`
                    });
                });

               
            }
             
        }
        // View Bindings
        this.setModel(appODataModel, "oDataModel");
        var oModel1 = new sap.ui.model.json.JSONModel();
        oModel1.setProperty('/AuthorizationScopes', allScopes);
        this.setModel(oModel1);
       // enable routing
       this.getRouter().initialize();
            }
        });
    }
);