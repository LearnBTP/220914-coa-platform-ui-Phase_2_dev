sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText",
    "sap/m/Token"
], function (Opa5, Press, EnterText, Token) {
    "use strict";
    var sViewName = "main";

    Opa5.createPageObjects({
        onTheViewPage: {

            actions: {
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

                iShouldSelectRecordinTable: function (sid, dataChange, comment) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(1);
                            if (dataChange) {
                                var indices = oTable.getSelectedIndices();
                                var rowContext = oTable.getContextByIndex(indices[0]);
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "RFID_SCOPE", comment);
                            }
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                // iShouldSelectRecordinTable: function (sid) {
                //     return this.waitFor({
                //         id: sid,
                //         viewName: sViewName,
                //         success: function (oTable) {
                //             oTable.setSelectedIndex(1);
                //             Opa5.assert.ok(true, "Selected records in table");
                //         },
                //         errorMessage: "Unable to Select Records in Table with id" + sid
                //     });
                // },

                iShouldFillDatainInput: function (sid, value, control) {
                    return this.waitFor({
                        viewName: "main",
                        controlType: control,
                        searchOpenDialogs: true,
                        // check: function (oInput) {
                        //     if (oInput.length > 0) {
                        //         return true
                        //     } else {
                        //         return false;
                        //     }
                        // },
                        matchers: function (oInput) {
                            if (oInput.getId() === sid) {
                                return true;
                            }
                        },
                        actions: new EnterText({
                            text: value
                        }),
                        success: function (oInput) {
                            // oInput[0].setText(value);
                            // if(oInput.length > 1){
                            // oInput[1].setValue(value);
                            // }
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
                },

                iShouldClickButtonInFragment: function (text) {
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
                            // debugger;
                            oButton.forEach(function (oItem) {
                                if (oItem.getText() === text) {
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with text" + text
                    })
                },

                // iShouldClickButtonInFragment: function (text) {
                //     return this.waitFor({
                //         viewName: "Main",
                //         controlType: "sap.m.Button",
                //         searchOpenDialogs: true,
                //         check: function (oButton) {
                //             if (oButton.length > 0) {
                //                 return true
                //             } else {
                //                 return false;
                //             }
                //         },
                //         success: function (oButton) {
                //             debugger;

                //             oButton.forEach(function (oItem) {
                //                 if (oItem.getText() === text) {
                //                     oItem.firePress();
                //                 }
                //             });
                //         },
                //         errorMessage: "Was not able to press button with text" + text
                //     })
                // },

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

                //24 may//
                iShouldFillF4Input: function (sid, control) {
                    return this.waitFor({
                        viewName: "main",
                        controlType: control,
                        success: function (oInput) {
                            oInput[0].setValue("WATCH_CCPB");
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
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
                            oTable.setSelectedIndex(4);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                iShouldPressDownloadReport: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function (oBtn) {
                            // oBtn.forEach(function(oItem){
                            //     if(oItem.getText() === "Download Data"){
                            //         oItem.firePress();
                            //     }
                            // });
                            Opa5.assert.ok(true, "Button with id" + sid + "pressed");
                        },
                        errorMessage: "Was unable to press the button with id" + sid
                    })
                },

                iShouldClickButtonIndownloadError: function (sid) {
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
                                if (oItem.getText() === "Close") {
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with id" + sid
                    })
                },

                iShouldClickButtonInHistoryFragment: function (sid) {
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
                                if (oItem.getText() === "Close") {
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with id" + sid
                    })
                },

                iShouldSelectRecordinTable: function (sid, dataChange, rfidscope,carryover,QPL) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(1);
                            if (dataChange) {
                                var indices = oTable.getSelectedIndices();
                                var rowContext = oTable.getContextByIndex(indices[0]);
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "RFID_SCOPE", rfidscope);
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "CARRY_OVER", carryover);
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "QPL", QPL);
                            }
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },
                iShouldSelectRecordinTable1stRow: function (sid, dataChange, rfidscope) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(2);
                            if (dataChange) {
                                var indices = oTable.getSelectedIndices();
                                var rowContext = oTable.getContextByIndex(indices[0]);
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "RFID_SCOPE", rfidscope);
                            }
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },
                iShouldSelectRecordinTable2ndRow: function (sid, dataChange, rfidscope) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(3);
                            if (dataChange) {
                                var indices = oTable.getSelectedIndices();
                                var rowContext = oTable.getContextByIndex(indices[0]);
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "RFID_SCOPE", rfidscope);
                            }
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },



                iShouldFillF4InputReject: function (sid, control) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: control,
                        success: function (oInput) {
                            // value = [ (new Token({
                            //     key: "site3",
                            //     text: "site3"
                            // }))];

                            oInput[0].setValue("WATCH_CCPB");
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
                },

                iShouldFillF4InputAccept: function (sid, control) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: control,
                        success: function (oInput) {
                            // value = [ (new Token({
                            //     key: "site3",
                            //     text: "site3"
                            // }))];
                            oInput[0].setValue("WATCH_CCPB");
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
                },
            },

          

        }
    });

});
