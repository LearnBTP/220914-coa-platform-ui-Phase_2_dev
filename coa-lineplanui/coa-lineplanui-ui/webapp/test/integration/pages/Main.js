sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
], function (Opa5,Press) {
    "use strict";
    var sViewName = "Main";

    Opa5.createPageObjects({
        onTheViewPage: {
            actions: {
                iShouldPressGo: function (sid) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function () {
                            Opa5.assert.ok(true, "Search button pressed");
                        },
                        errorMessage: "Was unable to press the Search button"
                    });
                },
                iShouldPressButton: function (sid) {
                    
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function () {
                            debugger;
                            Opa5.assert.ok(true, "Button with id" + sid + "pressed");
                        },
                        errorMessage: "Was unable to press the button with id" + sid
                    });
                },
                iSelectItemCheckBox: function (tableid,idx,all) {
                    return this.waitFor({
                        id: tableid,
                        viewName: sViewName,
                        actions: function (oTable) {
                            if(all === "ALL"){
                                oTable.selectAll();
                            }else{
                            oTable.setSelectedIndex(idx);
                            }
                        },
                        success: function () {
                            Opa5.assert.ok(true, "Table checkbox selected");
                        },
                        error: function () { }
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
                }

            
            },
            assertions: {

                iShouldSeeThePageView: function () {
                    return this.waitFor({
                        id: "PageDynamic",
                        viewName: sViewName,
                        success: function () {
                            Opa5.assert.ok(true, "The " + sViewName + " view is displayed");
                        },
                        errorMessage: "Did not find the " + sViewName + " view"
                    });
                }
            }
        }
    });

});
