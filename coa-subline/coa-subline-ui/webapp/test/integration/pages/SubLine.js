sap.ui.define([
	"sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/actions/EnterText",
], function (Opa5, Press, EnterText) {
	"use strict";
	var sViewName = "SubLine";
	var sNoAuth = "NoAuthorization";
	Opa5.createPageObjects({
        onTheViewPage: {

            actions: {
                iShouldPressButton: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Button with id" + sid + "pressed");
                        },
                        errorMessage: "Was unable to press the button with id" + sid
                    });
                },iSelectOKOnDialog: function () {
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
                iActionTheControlState: function (tableid) {
                    return this.waitFor({
                        controlType: "sap.m.Input",
                        viewName: sViewName,
                        bindingPath: {
                            path: "/SubLine/1",
                            modelName: "coa",
                            propertyPath: "boH_Qty"
                        },
                        actions: new EnterText({
                            text: "3"
                        }),
                        success: function (vControls) {
                            Opa5.assert.ok(true, "Value entered");
                        },
                        error: function () {
                            
                        }
                    });
                },

                iShouldFillF4Input: function (sid,control){
                   
                            
                    return this.waitFor({
                        viewName : sViewName,
                        controlType:control,
    
                       

                        
                        
                        
                        success: function (oInput) {
                      
                          oInput[0].setValue("kkhh");

                            
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
                },

                iSelectItemCheckBox: function (tableid,index,all) {
                    return this.waitFor({
                        id: tableid,
                        viewName: sViewName,
                        actions: function (oTable) {
                            if(all === "ALL"){
                                oTable.selectAll();
                            }else{
                            oTable.setSelectedIndex(index);
                            }
                        },
                        success: function () {
                            Opa5.assert.ok(true, "Table checkbox selected");
                        },
                        error: function () {  }
                    });
                },
                iShouldClickButtonInFragment: function (sid, textName) {
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
                iShouldFillFileName: function (sid) {
                    return this.waitFor({
                        id: "fileUploader",
                        viewName: sViewName,
                        searchOpenDialogs: true,
                        success: function (vControls) {
                            
                            var oControl = vControls[0] || vControls;
                            oControl.setValue("SubLine.csv")
                            Opa5.assert.ok(true, "filename Set");
                        }
                    });
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
                                if(oItem.getText() === "OK"){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with id"+ sid 
                    })
                },
                iShouldFillDialogInput: function (sid, value, control) {
                    return this.waitFor({
                        viewName: sViewName,
                        controlType: control,
                        searchOpenDialogs: true,
                        matchers: function (oInput) {
                            if (oInput.getId() === sid) {
                                return true;
                            }
                        },
                        actions: new EnterText({
                            text: value
                        }),
                        success: function (oInput) {
                            //oInput[0].setValue(value);
                            Opa5.assert.ok(true, "Data Entered in Fragment with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
                }
            },
            assertions: {

                iShouldSeeThePageView: function () {
                    return this.waitFor({
                        id: "SubPageDynamic",
                        viewName: sViewName,
                        success: function () {
                            Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
                        },
                        errorMessage: "Did not find the " + sViewName + " view"
                    });
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
            }
        }
    });

});