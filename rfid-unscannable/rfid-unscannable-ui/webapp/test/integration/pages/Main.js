sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText"
], function (Opa5, Press, EnterText) {
    "use strict";
    var sViewName = "Main";

    Opa5.createPageObjects({
        onTheViewPage: {

            actions: {

                iShouldSelectRecordinTable: function (sid, dataChange, comment) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(0);
                            if (dataChange) {
                                oTable.setSelectedIndex(1);
                                var indices = oTable.getSelectedIndices();
                                var rowContext = oTable.getContextByIndex(indices[0]);
                                rowContext.sPath = "/Carryover_rfid_unscannable(GUID=guid'0002c741-8e84-4ad0-85b4-37561b37fa81',GH_SITE='iPhone_FXZZ',CM='HHZZ',SITE='PBPH',FROM_BUSINESS_GRP='',PROGRAM='D73',AQID='109520-01',SEQUENCE_NO=0,NPI_INDICATOR='NON-NPI',MAPPED_AQID=null,EQUIPMENT_NAME=null,PO_TYPE=null,SCOPE='Per%20Station',CONSUMABLES=null,FLEX_KITS=null,PROJECTED_QTY=7,TRANSFER_FLAG=null,TO_GHSITE=null,TO_CM=null,TO_SITE=null,TO_BUSINESS_GRP=null,TO_PROGRAM=null,QTY=0,STATUS='',REVIEW_DATE=null,REVIEWED_BY=null,MODIFIEDAT=null,MODIFIEDBY=null,CREATEDAT=datetimeoffset'2023-06-12T14:36:55.491Z',CREATEDBY='C8852207PL',CREATEDBY_NAME='Pooja%20Lakshman',CREATEDBY_MAIL='pooja_lakshman%40apple.com',MODIFIEDBY_NAME=null,MODIFIEDBY_MAIL=null,REVIEWED_BY_NAME=null,REVIEWED_BY_MAIL=null,SAP_CM_SITE='HHZZ-PBPH',SAP_TO_CM_SITE=null,COMMENT=null,ID='0002c741-8e84-4ad0-85b4-37561b37fa81',SYNC_STATUS='In%20Progress',ERROR=null)";
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "COMMENT", comment);
                            }
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                iShouldClickonButton: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function (oBtn) {
                            Opa5.assert.ok(true, "Button with id" + sid + "pressed");
                        },
                        errorMessage: "Was unable to press the button with id" + sid
                    })
                },

                iShouldFillDatainInput: function (sid, value, control) {
                    return this.waitFor({
                        viewName: "Main",
                        controlType: control,
                        searchOpenDialogs: true,
                        check: function (oInput) {
                            if (oInput.length > 0) {
                                return true
                            } else {
                                return false;
                            }
                        },
                        success: function (oInput) {
                            oInput[0].setValue(value);
                            if (oInput.length > 1) {
                                oInput[1].setValue(value);
                            }
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
                },

                iShouldClickButtonInFragment: function (text) {
                    return this.waitFor({
                        viewName: "Main",
                        controlType: "sap.m.Button",
                        searchOpenDialogs: true,
                        check: function (oButton) {

                            if (oButton.length > 0) {
                                return true
                            } else {
                                return false;
                            }
                        },
                        success: function (oButton) {
                            oButton.forEach(function (oItem) {
                                if (oItem.getText() === text) {
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with text " + text
                    })
                },

                iShouldSelectAllCheckboxes: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.selectAll(true);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                iShouldFillF4Input: function (sid, control) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: control,
                        success: function (oInput) {
                            oInput[0].setValue("iPhone_FXZZ");
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
                },

                //25 May

                iShouldClickButtonInSaveError: function (sid) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        searchOpenDialogs: true,
                        check: function (oButton) {
                            if (oButton.length > 0) {
                                return true
                            } else {
                                return false;
                            }
                        },
                        success: function (oButton) {
                            oButton.forEach(function (oItem) {
                                if (oItem.getText() === "OK" || oItem.getText() === "Close") {
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with id" + sid
                    })
                },

                iShouldSelectAllRecordinTable: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.selectAll();
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                iShouldSelectRecordinTabletoDownload: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(2);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                iShouldApproveButton: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function (oBtn) {
                            Opa5.assert.ok(true, "Button with id" + sid + "pressed");
                        },
                        errorMessage: "Was unable to press the button with id" + sid
                    })
                },

                iShouldRejectButton: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function (oBtn) {
                            Opa5.assert.ok(true, "Button with id" + sid + "pressed");
                        },
                        errorMessage: "Was unable to press the button with id" + sid
                    })
                },

                iShouldSelectRecordinTableNew: function (sid,index) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setVisibleRowCount(16);
                            oTable.setSelectedIndex(index);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                iShouldSelectRecordinTablePending: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(3);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                iShouldSelectDatainMultComboBox: function (sid) {
                    return this.waitFor({
                        viewName: "Main",
                        controlType: "sap.m.MultiComboBox",
                        searchOpenDialogs: true,
                        check: function (oCmb) {

                            if (oCmb.length > 0) {
                                return true
                            } else {
                                return false;
                            }
                        },
                        success: function (oCmb) {
                            oCmb[0].setSelectedKeys(['iPhone_FXZZ']);
                        },
                        errorMessage: "Was not able to select values in combo box " + sid
                    })
                },

                iShouldEnterDatainFragmentInput: function(control,sid,text){
                    return this.waitFor({
                        viewName: "Main",
                        controlType: control,
                        searchOpenDialogs: true,
                        check: function (oInput) {

                            if (oInput.length > 0) {
                                return true
                            } else {
                                return false;
                            }
                        },
                        success: function (oInput) {
                           oInput.forEach(function(oItem,index){
                            if(oItem.getId() === sid){
                                oItem.setValue(text);
                            }
                           })
                        },
                    });
                }

            },

            assertions: {

                // iShouldSeeThePageView: function () {
                // 	return this.waitFor({
                // 		id: "page",
                // 		viewName: sViewName,
                // 		success: function () {
                // 			Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
                // 		},
                // 		errorMessage: "Did not find the " + sViewName + " view"
                // 	});
                // }

            }
        }
    });

});