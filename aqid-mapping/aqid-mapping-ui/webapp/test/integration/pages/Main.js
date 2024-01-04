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
                iShouldSelectRecordinTable: function (sid,dataChange,comment) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(1);
                            if(dataChange){
                                var indices = oTable.getSelectedIndices();
                                var rowContext = oTable.getContextByIndex(indices[0]);
                                oTable.getModel().setProperty(rowContext.sPath + "/" + "Comment", comment);
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
                        
                        success: function (oInput) {
                            
                            oInput[0].setValue(value);
                            if(oInput.length > 1){
                            oInput[1].setValue(value);
                            }
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
                            oButton.forEach(function(oItem){
                                if(oItem.getText() === text){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with text "+ text 
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
