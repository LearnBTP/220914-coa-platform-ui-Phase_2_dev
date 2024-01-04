sap.ui.define([
	"sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText",
    "sap/m/Token"
], function (Opa5,Press, EnterText,Token) {
	"use strict";
	var sViewName = "Main";
    var sNoAuth = "AccessDenied";
	
	Opa5.createPageObjects({
		onTheViewPage: {

			actions: {
                iShouldSelectRecordinF4Table: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function (oTable) {
                            
                            oTable.selectAll();
                           //oTable.setSelectedIndex(1);
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
                            oTable.setSelectedIndex(0);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },
                iShouldSelectRecordinTableReject: function (sid) {
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
                iShouldSelectRecordinTableDownQuantity: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(6);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },
                iShouldSelectRecordinTableAccept: function (sid) {
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
                iShouldSelectRecordinTablePending: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(6);
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },
                iShouldSelectRecordinTableNew: function (sid) {
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
                // F4 button event
                iShouldClickonF4Button: function (sid) {
                         
                    return this.waitFor({
                        
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                    
                      
                        
                        success: function (oBtn) {
                            oBtn.setValue("site3");
                           
                            

                            //      value.push(new Token({
                            //         key: "site3",
                            //         text: "site3"
                            //     }));
        
                           
                            // oBtn.addToken(value);
                            
                            Opa5.assert.ok(true, "Button with id" + sid + "pressed");
                        },
                        errorMessage: "Was unable to press the button with id" + sid
                    })
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
                iShouldFillF4InputReject: function (sid,control){
                   
                            
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
                iShouldFillF4InputAccept: function (sid,control){
                   
                            
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
                iSelectOKOnDialog: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        properties: {
                            text: "OK"
                        },
                        searchOpenDialogs: true,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Dialog pressed Yes");
                        },
                    });
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
                iShouldClickButtonIndownloadError: function(sid){
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
                iShouldClickButtonInDeleteError: function(sid){
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
                                if(oItem.getText() === "OK"){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with id"+ sid 
                    })
                },

                iShouldFillDatainInputDownload: function (sid, value, control) {
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
                        
                            if(oButton[1].getText() === "Download Data"){
                                oButton[1].fireSelect();
                            }

                           
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
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
                iShouldSelectDownloadReport: function (sid) {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        id: sid,
                        viewName: sViewName,
                       
                        success: function (oItem) {
                          
                           
                         //   oSelectedKey.setSelectedKey("CO Output");
                          //  oSelectedKey.oPropagatedProperties.oModels.localJsonModel.setProperty("/selOPExport", "2");
                          //  oSelectedKey.firePress();
                        

                            Opa5.assert.ok(true, "Selected item in the dropdown");
                        },
                        errorMessage: "Unable to Select Records in dropdown with id" + sid
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
                iShouldSeeTheNoAuthPageView: function () {
                    return this.waitFor({
                        id: "_IDGenMessagePage2",
                        viewName: sNoAuth,
                        success: function () {
                            Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
                        },
                        errorMessage: "Did not find the " + sViewName + " view"
                    });
                },

                
                


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
