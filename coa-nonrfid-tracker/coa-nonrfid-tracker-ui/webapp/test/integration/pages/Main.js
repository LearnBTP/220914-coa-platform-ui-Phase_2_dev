sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText",
    "sap/m/Token"
], function (Opa5,Press, EnterText,Token) {
	"use strict";
	var sViewName = "Main";
	
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

                iShouldFillF4Input: function (sid,control){
                   
                            
                    return this.waitFor({
                        viewName : "Main",
                        controlType:control,
    
                       

                        
                        
                        
                        success: function (oInput) {
                           
                            // value = [ (new Token({
                            //     key: "site3",
                            //     text: "site3"
                            // }))];

                      
                          oInput[0].setValue("kkhh");

                            
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

                iShouldSelectRecordinTable: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(1);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                iShouldSelectFirRecordinTable: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(0);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                //
                iShouldSelectAndSetDatainTable: function (sid, dataChange, Businessgroup) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(1);
                            if (dataChange) {
                                var indices = oTable.getSelectedIndices();
                                var rowContext = oTable.getContextByIndex(indices[0]);
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "To_Business_Grp", Businessgroup);
                            }
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },

                //
                // for reset functioanlity
                iShouldSelectRecordinTableReset: function (sid) {
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
                 // rejected Status
                 iShouldSelectRecordinTableRejected: function (sid) {
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
                 // blank status
                 iShouldSelectRecordinTableBlankStatus: function (sid) {
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
                iShouldFillDatainInput: function (sid, value, control) {
                    return this.waitFor({
                        viewName : "Main",
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

                iShouldClickButtonInFragmentConfirm: function (sid, textName) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: "sap.m.Button",
                        properties: {
                            text: textName
                        },
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Dialog " + sid + " button pressed");
                        },
                        errorMessage: "Was not able to press button with id" + sid
                    })
                },

                iShouldPressCancelResetBtn: function (sid) {
                
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

                iShouldFillDatainInputCancelReset: function (sid, value, control) {
                    return this.waitFor({
                        viewName : "Main",
                        controlType: control,
                        searchOpenDialogs: true,
                        check: function (oInput) {
                            if (oInput.length > 0) {
                                return true
                            } else {
                                return false;
                            }
                        },
                        
                        success: function (oButton) {
                        
                            if(oButton[0].getText() === "Cancel Request"){
                                oButton[0].fireSelect();
                            }

                           
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
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
                            oCmb[0].setSelectedKeys(['kkhh']);
                        },
                        errorMessage: "Was not able to select values in combo box " + sid
                    })
                },
                iShouldSelectDatainChckbox: function (sid) {
                    return this.waitFor({
                        viewName: "Main",
                        controlType: "sap.m.CheckBox",
    
                        
                        success: function (oCheckbox) {
                            oCheckbox[0].setSelected(true);
                        },
                        errorMessage: "Was not able to select values in combo box " + sid
                    })
                },

              

                iShouldClickButtonInFragment: function(text){
                    return this.waitFor({
                        viewName : "Main",
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
                            debugger;
                            
                            oButton.forEach(function(oItem){
                                if(oItem.getText() === text){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with text"+ text
                    })
                },

                iShouldClickButtonInFragment: function(text){
                    return this.waitFor({
                        viewName : "Main",
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
                            debugger;
                            
                            oButton.forEach(function(oItem){
                                if(oItem.getText() === text){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with text"+ text
                    })
                },
                iShouldClickButtonInUIError: function(sid){
                    return this.waitFor({
                        viewName : "Main",
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
                          
                            oButton.forEach(function(oItem){
                                if(oItem.getText() === "Close"){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with id"+ sid 
                    })
                },

                iShouldClickButtonInHistoryFragment: function(sid){
                    return this.waitFor({
                        viewName : "Main",
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
                          
                            oButton.forEach(function(oItem){
                                if(oItem.getText() === "Close"){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with id"+ sid 
                    })
                },

                

                iShouldClickButtonInSaveError: function(sid){
                    return this.waitFor({
                        viewName : "Main",
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
                          
                            oButton.forEach(function(oItem){
                                if(oItem.getText() === "OK" || oItem.getText() === "Close"){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with id"+ sid 
                    })
                },

                
			},
            

		}
	});

});

