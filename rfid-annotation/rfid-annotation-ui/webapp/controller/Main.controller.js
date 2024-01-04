sap.ui.define([
    "coa/annotation/rfidannotationui/controller/BaseController",
    "sap/m/MessageBox",
    "coa/annotation/rfidannotationui/utils/Formatter",
    "sap/m/BusyDialog",
    "sap/ui/model/Filter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
        Base,
        MessageBox,
        Formatter,
        BusyDialog,
        Filter
    ) {
        "use strict";

        return Base.extend("coa.annotation.rfidannotationui.controller.Main", {
            formatter: Formatter,
            onInit: function () {

                let allScopes = Base.appClientModel.getProperty('/AuthorizationScopes');
                if (allScopes && (allScopes.includes('AnnotationReadOnly') || allScopes.includes('AnnotationModify'))) {

                    Base.oDiaBusy = new BusyDialog({
                        text: "Fetching Data",
                    }).addStyleClass('nofocusbusy');
                    Base.oDiaBusy.open();

                    this.getView().setModel(Base.appODataModel);

                    const oView = this.getView();
                    oView.addEventDelegate({
                        onAfterShow: function (oEvent) {
                            if (oView.byId('tabDrawingSearch').isInitialised()) {
                                oView.byId('tabDrawingSearch').rebindTable(true);
                            }
                        }
                    }, oView);


                    //Hide the dynamic Page header
                    this.getViewUI('pageDrawingSearch')._getTitle().setVisible(false);

                    // Replace text of SmartFilter Search Button
                    const oSFB = this.getViewUI("smartFilterBar");
                    oSFB.addEventDelegate({
                        "onAfterRendering": (oEvent) => {
                            oEvent.srcControl._oSearchButton.setText('Search');
                        }
                    });


                    //get dropdown values
                    this.getDropDownContent(Base);


                } else {
                    this.getRouter().getTargets().display("TargetNoAuth");
                    sap.ui.core.BusyIndicator.hide();
                }

            },

            getItemData: async function (oEvent) {
                //Start Busy and Hide in error or after loading image in next page
                Base.oDiaBusy.open();
                let selectedRow = oEvent.getSource().getBindingContext().getObject();
                selectedRow = JSON.parse(JSON.stringify(selectedRow));
                Base.appClientModel.setProperty('/ContainerAnnotate', selectedRow);
                Base.appClientModel.setProperty('/EditAuth', selectedRow.AllowModify);

                let nonAnnStatus = ["PLANNED","SCANNED","UPLOADED","RECEIVED","IN PROCESS","QA REVIEW","FAILED","PROCESSING"];
                let statusCapital = selectedRow.Status.toUpperCase();
                if(nonAnnStatus.includes(statusCapital)){
                    Base.oDiaBusy.close();
                    MessageBox.information("The new version of map is not ready yet");
                    return;
                }

                let url;
                if (Base.appClientModel.getProperty('/IsMock')) {
                    url = "./localService/elk_export_with_tags.png";
                } else {
                    url = `/coa-dms/v2/coa/sdm-services/browser/Carryover/root?objectId=${selectedRow.Image_FileId}&cmisSelector=content&download=attachment`;

                }
                const aFilters = [
                    new Filter('Building', sap.ui.model.FilterOperator.EQ, selectedRow.Building),
                    new Filter('Site', sap.ui.model.FilterOperator.EQ, selectedRow.Site),
                    new Filter('Floor', sap.ui.model.FilterOperator.EQ, selectedRow.Floor),
                    new Filter('CM', sap.ui.model.FilterOperator.EQ, selectedRow.CM),
                    new Filter('Status', sap.ui.model.FilterOperator.EQ, selectedRow.Status)
                ];
                const imageContent = this.getImageContent(url, Base);
                const shapeContent = this.getShapeDetails(aFilters, Base);
                const applicationContent = this.getAnnotaionDetails(aFilters, Base);

                Promise.all([applicationContent, shapeContent, imageContent])
                    .then(() => {
                        let oRouter = this.getRouter();
                        oRouter.navTo("RouteAnnotation");
                    })
                    .catch((Err) => {

                        MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                            title: "System Error",
                            details: Err
                        });

                        Base.oDiaBusy.close();
                    })


            },

            afterSmartControlPending: function (oEvent) {
                let bInit = oEvent.getSource().isInitialised();
                let bPen = oEvent.getSource().isPending();
                setTimeout(() => {
                    if (bInit && !bPen) {
                        Base.oDiaBusy.close();
                    } else {
                        MessageBox.error("Unexpected System Error. Please Reload the application", {
                            title: "System Error"
                        });
                    }
                }, 2000)

            }

        });
    });
