/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "com/apple/coa/nonrfidprojectionui/model/models",
    "com/apple/coa/nonrfidprojectionui/localService/mockserver",
  
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox",
    "sap/base/util/UriParameters"
],
    function (UIComponent, Device, models,MockServer,ODataModel,MessageBox,UriParameters) {
        "use strict";

        return UIComponent.extend("com.apple.coa.nonrfidprojectionui.Component", {
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
                let appODataModel, oPostModel;
                let isMockServer = UriParameters.fromURL(window.location.href).get("responderOn");
                if (isMockServer) {
                    myPromises.push(MockServer.init());
                    Promise.all(myPromises).catch(function (oError) {
                        this.showError(oError.message);
                    }).finally(function () {

                        // post model initilization 
                        oPostModel = new ODataModel('/mock/COA', {
                            json: true,
                            useBatch: true,
                            defaultCountMode: "Inline",
                            defaultBindingModel: "TwoWay"
                        });
                        oPostModel.attachBatchRequestCompleted(function (param1, param2) {
                            sap.ui.core.BusyIndicator.hide();
                        });

                        appODataModel = new ODataModel('/mock/nonrfid-projection', {
                            json: true,
                            useBatch: true,
                            defaultCountMode: "Inline",
                            defaultBindingModel: "TwoWay"
                        });
                        appODataModel.attachBatchRequestCompleted(function (param1, param2) {
                            sap.ui.core.BusyIndicator.hide();
                        });
                        this.initializeApp(appODataModel, "MainModel", ["ProjectionTableModify","ProjectionTableReadOnly"],'corp-apps',oPostModel);
                        this.getModel("device").setProperty("/isMockServer",true);
                    }.bind(this));
                }
                else {

                    if (window.location === window.parent.location) {
                        this.showError("Please access Annotations application from Portal");
                        return;
                    }

                    // get app details

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


                    // User Info
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

                    }).catch(error => {
                        this.showError(error.message);
                    });

              }
               
            },

            validatePromiseAndInitApp: function (values) {
                let appODataModel;
                if (values[1] && values[1].decodedJWTToken.scope) {
                    let sPath;
                    let sPathChangelog;
                    let origin;
                    if (values[1].decodedJWTToken.origin === "corp-apps") {
                         origin = values[1].decodedJWTToken.origin;
                        sPath = "/coa-api/v1/coa/nonrfid-projection-service/";
                        sPathChangelog = "/coa-api/v2/coa/changelog-services/changelog/";
                    } else {
                        origin = "";
                        sPath = "/coa-api-ext/v1/ext/coa/nonrfid-projection-service/";
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
                    let scopes = roleScopes.flat();

                    if (scopes.find(e => e === "ProjectionTableModify" || e === "ProjectionTableReadOnly")) {



                        // Main Model
                        appODataModel = new sap.ui.model.odata.v2.ODataModel(sPath, {
                            headers: {

                                "appid": values[0]
                            },
                            useBatch: true,
                            disableHeadRequestForToken: true,
                            defaultCountMode: "Inline",
                            defaultBindingMode: "TwoWay",
                            prefer: 'odata.continue-on-error'
                        });

                        appODataModel.attachMetadataFailed(function (oEvent) {
                            let response = oEvent.getParameters().response;
                            this.showError(`${response.responseText} ${response.message}`);
                        }.bind(this));

                        appODataModel.attachBatchRequestCompleted(function () {
                            sap.ui.core.BusyIndicator.hide();
                        });
                        //    // Change log oData Model Initialization
                        let appODataChangeLogModel = new sap.ui.model.odata.v2.ODataModel(sPathChangelog, {
                            headers: {
                                "appid": values[0]
                            },
                            disableHeadRequestForToken: true,
                            defaultCountMode: "Inline",
                            defaultBindingMode: "TwoWay",
                            useBatch: false
                        });

                        let oPostModel = new sap.ui.model.odata.v2.ODataModel(sPath, {
            
                            useBatch: true,
                            defaultCountMode: "Inline",
                            defaultBindingMode: "TwoWay"
                        });
                        oPostModel.attachMetadataFailed(function () {
                            this.showError('Metadata loading failed');
                        }.bind(this));
                            
                           oPostModel.attachBatchRequestCompleted(function () {
                            sap.ui.core.BusyIndicator.hide();
                        });
        



                        appODataChangeLogModel.attachRequestFailed(function (oEvent) {
                            let response = oEvent.getParameters().response
                            this.showError(`${response.responseText} ${response.message}`);
                        }.bind(this));





                        this.setModel(appODataChangeLogModel, "changeLogModel");
                        this.initializeApp(appODataModel, "MainModel", scopes,origin,oPostModel);



                    } else {
                        this.initializeApp(appODataModel, "MainModel", [],"","oPostModel");

                    }
                }
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
            },
            initializeApp: function (oDataModel, ModelName, roles,origin,oPostModel) {

                let globalMetamodel = oDataModel;
                let mAuthorizedModel = new sap.ui.model.json.JSONModel();
                mAuthorizedModel.setProperty('/AuthorizationScopes', roles);
                this.setModel(mAuthorizedModel, "mAuthorizedModel");
              this.setModel(globalMetamodel, ModelName);
                // Post Model
                this.setModel(oPostModel, "oPostModel");
                if (roles && roles.length !== 0) {
                    if (roles.find(e => e === "ProjectionTableModify")) {
                        this.getModel("mAuthorizedModel").setProperty("/modify", true);
                    } else {
                        this.getModel("mAuthorizedModel").setProperty("/modify", false);
                    }
                    if (roles.find(e => e === "ProjectionTableReadOnly")) {
                        this.getModel("mAuthorizedModel").setProperty("/display", true);
                    } else {
                        this.getModel("mAuthorizedModel").setProperty("/display", false);
                    }
                    
                }

                mAuthorizedModel.setProperty('/Origin', origin);

                
                // enable routing
                this.getRouter().initialize();


                // set the device model
                this.setModel(models.createDeviceModel(), "device");

            }
           
        });
    }
);