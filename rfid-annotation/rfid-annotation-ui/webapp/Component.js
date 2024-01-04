sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "coa/annotation/rfidannotationui/model/models",
    "sap/base/util/UriParameters",
    "coa/annotation/rfidannotationui/localService/mockserver",
    "coa/annotation/rfidannotationui/controller/BaseController",
    "sap/m/MessageBox",
],
    function (UIComponent,
        Device,
        models,
        UriParameters,
        mockserver,
        Base,
        MessageBox) {
        "use strict";

        return UIComponent.extend("coa.annotation.rfidannotationui.Component", {
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

                let isMockServer = UriParameters.fromURL(window.location.href).get("responderOn");

                if (isMockServer) {
                    myPromises.push(mockserver.init())

                    Promise.all(myPromises).catch(function (oError) {
                        this.showError(oError.message);
                    }).finally(function () {
                        // AnnotationReadOnly, AnnotationModify
                        this._initializeApp(true, '123', ['AnnotationModify'],'corp-apps');
                    }.bind(this));


                } else {

                    let apiError = [];

                    //Check whether inside an iframe

                   if (window.location === window.parent.location) {
                       this.showError("Please access Annotations application from Portal");
                       return;
                   }


                    //App Variables
                    myPromises.push(new Promise((resolve, reject) => {
                        fetch("/getAppVariables")
                            .then(res => res.json())
                            .then(val => {
                                resolve(val);
                            })
                            .catch(() => {
                                apiError.push('App Variable API')
                                reject();
                            });

                    }));

                    // User Info
                    myPromises.push(new Promise((resolve, reject) => {
                        fetch("/getUserInfo")
                            .then(res => res.json())
                            .then(val => {
                                resolve(val);
                            })
                            .catch(() => {
                                apiError.push('User Info API')
                                reject();
                            });
                    }));


                    await Promise.all(myPromises).then((values) => {
                        //AppId and Roles check
                        if ((values[0] && values[0] !== "") &&
                            (values[1] && values[1].decodedJWTToken.scope)
                        ) {
                            let token = values[1].decodedJWTToken;
                            let roleScopes = token.scope.map(str => {
                                let v = str.match(/\.\S+/g);
                                if (v) {
                                    return v.map(e => e.substr(1));
                                } else {
                                    return str;
                                }
                            }) || [];
                            this._initializeApp(false, values[0], roleScopes.flat(),token.origin, token.user_name); /* // this._initializeApp(false, values[0], ['AnnotationModify']);   */
                        }

                    }).catch(error => {
                        this.showError('Failed to fetch BTP configuration - ' + apiError.toString());
                    });
                }
            },

            _initializeApp(isMock, appIdVal, allScopes, sOrigin,sUserName) {
                let sChangeLogPath;
               
                if (isMock) {
                    Base.sRelativePath = "/mock/coa";
                    sChangeLogPath = "";
                } else {
                    if (sOrigin === 'corp-apps') {
                        Base.sRelativePath = "/coa-api/v1/coa/3dv-line-services/annotation3-dv";
                        sChangeLogPath = "/coa-api/v2/coa/changelog-services/changelog"
                    } else {
                        Base.sRelativePath = "/coa-api-ext/v1/ext/coa/3dv-line-services/annotation3-dv";
                        sChangeLogPath = "/coa-api-ext/v2/ext/coa/changelog-services/changelog"
                    }

                }
                    if (allScopes && (!allScopes.includes('AnnotationReadOnly') && !allScopes.includes('AnnotationModify'))) {
                        this.getRouter().initialize();
                        this.getRouter().getTargets().display("TargetNoAuth");                  
                        return;
                    }
                //Odata model - for the application
                let ODataModel = new sap.ui.model.odata.v2.ODataModel(Base.sRelativePath, {
                    headers: {
                        "appid": appIdVal
                    },
                    useBatch: false, //batch response sizes are huge exceed 10mb
                    disableHeadRequestForToken: true,
                    defaultCountMode: "Inline",
                    defaultBindingModel: "OneWay"
                });
                ODataModel.attachMetadataFailed(function () {
                    this.showError('Annotation metadata loading failed')
                }.bind(this));

                ODataModel.attachMetadataLoaded(function () {
                    this.getRouter().initialize();
                    // set the device model
                    this.setModel(models.createDeviceModel(), "device");
                }.bind(this));

                ODataModel.attachBatchRequestCompleted(function () {
                    sap.ui.core.BusyIndicator.hide();
                });
                ODataModel.attachBatchRequestFailed(function (oEvent) {
                    let response = oEvent.getParameters().response
                    MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                        title: "System Error",
                        details: `${response.responseText} ${response.message}`
                    });
                });


                //Odata model - for the change log
                Base.appODataChangeLogModel = new sap.ui.model.odata.v2.ODataModel(sChangeLogPath, {
                    headers: {
                        "appid": appIdVal
                    },
                    disableHeadRequestForToken: true,
                    defaultCountMode: "Inline",
                    defaultBindingModel: "TwoWay",
                    useBatch: false
                });
                Base.appODataChangeLogModel.attachRequestFailed(function (oEvent) {
                    const response = oEvent.getParameters().response;

                    MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                        title: "System Error",
                        details: `${response.responseText} ${response.message}`
                    });

                   
                });



                Base.appODataModel = ODataModel;
                Base.appClientModel = this.getOwnModels()["Drawings"];
                Base.appClientModel.setSizeLimit(30000);
                Base.appClientModel.setProperty('/IsMock', isMock);
                Base.appClientModel.setProperty('/UserName', sUserName);
                Base.appClientModel.setProperty('/AuthorizationScopes', allScopes);
                Base.sAuthAppID = appIdVal;         


            },

            showError: function (msgText) {
                MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                    title: "System Error",
                    details: msgText
                });
            }
        });
    }
);