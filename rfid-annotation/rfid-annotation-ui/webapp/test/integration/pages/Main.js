sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText",
], function (Opa5, Press, EnterText) {
    "use strict";
    var sViewName = "Main";
    var sViewAnn = "Annotation";

    Opa5.createPageObjects({
        onTheMainPage: {

            actions: {

                iPressf4: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Main--smartFilterBar-filterItemControl_BASIC-Alderaan_Site-vhi",
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "F4 opened");
                        }
                    });
                },

                iTypeCM: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Main--smartFilterBar-filterItemControl_BASIC-Alderaan_Site",
                        actions: new EnterText({
                            text: "FXZZ"
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "Type");
                        }
                    });
                },

                iPressSelectRow: function (val) {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Main--smartFilterBar-filterItemControl_BASIC-Alderaan_Site-valueHelpDialog-table-rows-" + val,
                        searchOpenDialogs: true,
                        actions: new Press()
                    });
                },

                iPressTheTableControl: function () {
                    return this.waitFor({
                        controlType: "sap.m.ColumnListItem",
                        viewId: "container-coa.annotation.rfidannotationui---Main",
                        properties: {
                            type: "Navigation"
                        },
                        descendant: {
                            controlType: "sap.m.Text",
                            viewId: "container-coa.annotation.rfidannotationui---Main",
                            bindingPath: {
                                path: "/HeaderAnnotation(CM='HHZZ',Site='PBPH',Building='K03',Floor='1F',Status='DRAFT')",
                                propertyPath: "Alderaan_CM"
                            }
                        },
                        actions: new Press()
                    });
                },
                iPressTheTableControl2: function () {
                    return this.waitFor({
                        controlType: "sap.m.ColumnListItem",
                        viewId: "container-coa.annotation.rfidannotationui---Main",
                        properties: {
                            type: "Navigation"
                        },
                        descendant: {
                            controlType: "sap.m.Text",
                            viewId: "container-coa.annotation.rfidannotationui---Main",
                            bindingPath: {
                                path: "/HeaderAnnotation(CM='HHZZ',Site='PBPH',Building='K03',Floor='1F',Status='PUBLISH')",
                                propertyPath: "Alderaan_CM"
                            }
                        },
                        actions: new Press()
                    });
                },
                iPressSearch: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Main--smartFilterBar-btnGo",
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, 'pressed');
                        }
                    });
                },
                iPressTheTableControlPlannedStatus: function () {
                    return this.waitFor({
                        controlType: "sap.m.ColumnListItem",
                        viewId: "container-coa.annotation.rfidannotationui---Main",
                        properties: {
                            type: "Navigation"
                        },
                        descendant: {
                            controlType: "sap.m.Text",
                            viewId: "container-coa.annotation.rfidannotationui---Main",
                            bindingPath: {
                                path: "/HeaderAnnotation(CM='FXZZ',Site='PBPH',Building='WINDY1',Floor='FF0000',Status='Planned')",
                                propertyPath: "Alderaan_CM"
                            }
                        },
                        actions: new Press()
                    });
                },
                iShouldCloseInformationDialog: function () {
                    return     this.waitFor({
                        controlType: "sap.m.Button",
                        properties: {
                            text: "OK"
                        },
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Error Dialog closed");
                        },
                    });
                },


            },

            assertions: {



                iShouldSeeThePageView: function () {
                    return this.waitFor({
                        id: "pageSelection",
                        viewName: sViewName,
                        success: function () {
                            Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
                        },
                        errorMessage: "Did not find the " + sViewName + " view"
                    });
                },
                iShouldSeeTheTable: function () {
                    return this.waitFor({
                        id: "tabDrawingSearch",
                        viewName: sViewName,
                        success: function () {
                            Opa5.assert.ok(true, "The " + sViewName + " Table is displayed");
                        },
                        errorMessage: "Did not find the " + sViewName + " Table"
                    });
                },

                iShouldSeeTheF4Table: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Main--smartFilterBar-filterItemControl_BASIC-Alderaan_Site-valueHelpDialog-table",
                        searchOpenDialogs: true,
                        success: function (vControls) {
                            var oControl = vControls[0] || vControls;
                            oControl.selectAll();
                            Opa5.assert.ok(true);
                        }
                    });
                },

                iPressDialogOk: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Main--smartFilterBar-filterItemControl_BASIC-Alderaan_Site-valueHelpDialog-ok",
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function (vControls) {
                            Opa5.assert.ok(true, 'pressed');
                        }
                    });
                },



                
            }
        },

        onTheAnnotationPage: {

            actions: {
                iSelectItemCheckBox: function (tableid, index) {
                    return this.waitFor({
                        id: tableid,
                        viewName: sViewAnn,
                        actions: function (oTable) {
                            oTable.setSelectedIndex(index);
                        },
                        success: function () {
                            Opa5.assert.ok(true, "Table checkbox selected");
                        },
                        error: function () { }
                    });
                },

                iPressCopyOver: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            text: "Copy Over"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "CO Pressed");
                        },
                    });
                },

                iPressApplyCopyOver: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        properties: {
                            text: "Apply"
                        },
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "CO Applied");
                        },
                    });
                },


                iPressMassUpdate: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            text: "Mass Update"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Mass Update pressed");
                        },
                    });
                },
                iTypeInMassUpdate: function () {
                    return this.waitFor({
                        controlType: "sap.m.Input",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        labelFor: {
                            text: "Comments"
                        },
                        searchOpenDialogs: true,
                        actions: new EnterText({
                            text: "test"
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "Text Typed");
                        },
                    });
                },
                iApplyMassUpdate: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Annotation--btnMassSave",
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Applied Mass Update");
                        },
                    });
                },



                iPressBackButton: function () {
                    this.waitFor({
                        controlType: "sap.ui.core.Icon",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            src: {
                                regex: {
                                    source: "nav\\-back"
                                }
                            }
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Nav back succuss");
                        },
                    });
                },
                iPressZoomOut: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            icon: "sap-icon://zoom-out"
                        },
                        actions: new Press()
                    });
                },
                iPressZoomIn: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            icon: "sap-icon://zoom-in"
                        },
                        actions: new Press()
                    });
                },

                iPressZoomReset: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            icon: "sap-icon://responsive"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Zoom Reset Success");
                        },
                    });
                },

                iToggleSwitch: function () {
                    return this.waitFor({
                        controlType: "sap.m.Switch",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        bindingPath: {
                            path: "",
                            propertyPath: "/EditAuth"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Toggle Switch Success");
                        },
                    });
                },

                iDeleteRecordFromTable: function () {


                    return this.waitFor({
                        controlType: "sap.ui.core.Icon",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            src: {
                                regex: {
                                    source: "sys\\-cancel\\-2"
                                }
                            }
                        },
                        ancestor: {
                            controlType: "sap.m.ColumnListItem",
                            viewId: "container-coa.annotation.rfidannotationui---Annotation",
                            bindingPath: {
                                modelName: "Drawings",
                                path: "/UiShapes/0"
                            },
                            ancestor: {
                                id: "container-coa.annotation.rfidannotationui---Annotation--tabShapes"
                            }
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Delete Success");
                        },
                    });
                },

                iTypeOnShapeTable: function () {
                    return this.waitFor({
                        controlType: "sap.m.Input",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        bindingPath: {
                            path: "/UiShapes/1",
                            propertyPath: "LineId",
                            modelName: "Drawings"
                        },
                        actions: new EnterText({
                            text: "test"
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "Text entry Success");
                        },
                    });
                },
                iTypeOnShapeTableComments: function () {
                    return this.waitFor({
                        controlType: "sap.m.Input",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        bindingPath: {
                            path: "/UiShapes/1",
                            propertyPath: "Shape_Name",
                            modelName: "Drawings"
                        },
                        actions: new EnterText({
                            text: "comments"
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "Text comment entry Success");
                        },
                    });
                },
                iPressShapesButtonR: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            text: "Rectangle"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Segment button rect");
                        },
                    });
                },
                iPressShapesButtonL: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            text: "Free Draw"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Segment button Free Draw");
                        },
                    });
                },
                iPressRefreshButton: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            icon: "sap-icon://refresh"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Refresh Draw");
                        },
                    });
                },

                iRemoveAllShapes: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            text: "Remove All"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Remove All Shapes");
                        },
                    });
                },
                iSelectYesOnDialog: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        properties: {
                            text: "Yes"
                        },
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Dialog pressed Yes");
                        },
                    });
                },
                iNavigateBack: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            icon: "sap-icon://nav-back"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Success in nav back");
                        }
                    });
                },

                iPressSaveAsDraft: function () {
                    this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            text: "Save As Draft"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Save Draft");
                        }
                    });
                },
                iPressSaveOnDialog: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        properties: {
                            text: "Save"
                        },
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Save  Success");
                        }
                    });
                },

                iPressCreateDraft: function () {

                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        bindingPath: {
                            path: "",
                            propertyPath: "/ContainerAnnotate/Status"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Create Draft Open");
                        }
                    });
                },
                iShouldSeeMessageToastAppearance: function () {
                    return this.waitFor({
                        autoWait: false,
                        check: function () {
                            return Opa5.getJQuery()(".sapMMessageToast").length > 0;
                        },
                        success: function () {
                            Opa5.assert.ok(true, "The message toast was shown");
                        },
                        errorMessage: "The message toast did not show up"
                    });
                },

                iPressLogButton: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            text: "Change Logs"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Log button pressed");
                        },
                        errorMessage: "Log button failure"
                    });

                },
                iPressFullScreen: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Annotation--tabSmartRFID-btnFullScreen",
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Full dialog visible");
                        },
                        errorMessage: "Full dialog failure"
                    })
                },
                iPressCollapseFullScreen: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Annotation--tabSmartRFID-btnFullScreen",
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Full dialog collapsed");
                        },
                        errorMessage: "Full dialog failure"
                    })
                },
                iPressHorizontalScroll: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            icon: "sap-icon://media-play"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "H scroll table collapsed");
                        },
                        errorMessage: "H scroll failure"
                    });
                },
                iPressExport: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        properties: {
                            icon: "sap-icon://excel-attachment"
                        },
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Exported");
                        },
                        errorMessage: "Exported failure"
                    });
                },

                iShouldSeeLogDialog: function () {
                    return this.waitFor({
                        controlType: "sap.m.Dialog",
                        viewId: "container-coa.annotation.rfidannotationui---Annotation",
                        searchOpenDialogs: true,
                        success: function () {
                            Opa5.assert.ok(true, "Log dialog visible");
                        },
                        errorMessage: "Log dialog failure"
                    });

                },
                iPressCloseLogButton: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Annotation--btnCloseAppServer",
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Log button close pressed");
                        },
                        errorMessage: "Log button close failure"
                    });

                },

                iPressPublish: function () {
                    return this.waitFor({
                        id: "container-coa.annotation.rfidannotationui---Annotation--btnPublish",
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Button Press - Publish");
                        },
                    });
                },

                iShouldSeeErrorDialog: function () {
                    return this.waitFor({
                        controlType: "sap.m.Dialog",
                        properties: {
                            icon: "sap-icon://error"
                        },
                        searchOpenDialogs: true,
                        success: function () {
                            Opa5.assert.ok(true, "Error Dialog Showed");
                        },
                    });
                },
                iShouldCloseErrorDialog: function () {
                    return     this.waitFor({
                        controlType: "sap.m.Button",
                        properties: {
                            text: "Close"
                        },
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Error Dialog closed");
                        },
                    });
                },

                iPressExpandButton: function(sid){
                    return this.waitFor({
                        id: sid,
                        viewName: sViewAnn,
                        actions: new Press(),
                        success: function(oBtn){
                            Opa5.assert.ok(true,"Expand Pressed")
                        }
                    })
                }             
            },
            assertions: {
                iShouldSeeThePageView: function () {
                    return this.waitFor({
                        id: "pageAnnotation",
                        viewName: sViewAnn,
                        success: function () {
                            Opa5.assert.ok(true, "The " + sViewAnn + " view is displayed");
                        },
                        errorMessage: "Did not find the " + sViewAnn + " view"
                    });
                },
            }

        }
    });

});
