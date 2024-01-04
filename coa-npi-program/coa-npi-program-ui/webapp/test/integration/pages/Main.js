sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
], function (Opa5,Press) {
	"use strict";
	var sViewName = "Main";
	
	Opa5.createPageObjects({
		onTheViewPage: {

			actions: {
				iShouldClickonButton: function (sid) {
                    return this.waitFor({
                        timeout: 90,
                        id: sid,
                        viewName: sViewName,
                        actions: new Press(),
                        success: function (oBtn) {
                            Opa5.assert.ok(true, "Button with id" + sid + "pressed");
                        },
                        errorMessage: "Was unable to press the button with id" + sid
                    })
                },

				iShouldFillDatainRow: function(sid){
					return this.waitFor({
						id: sid,
						viewName: sViewName,
						success: function(oTable){
							var path = oTable.getContextByIndex(1).getPath();
							oTable.getModel().setProperty(path +"/Program", "N56");
							oTable.getModel().setProperty(path +"/Program_Description", "NPI Project");
							Opa5.assert.ok(true, "Data Entered for Create");
						}
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
                            oButton.forEach(function(oItem){
                                if(oItem.getText() === text){
                                    oItem.firePress();
                                }
                            });
                        },
                        errorMessage: "Was not able to press button with text "+ text
                    })
                },

				iShouldSelectRecordinTable: function (sid,index,dataChange) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        success: function (oTable) {
                            oTable.setSelectedIndex(index);
                            // if(dataChange){
                            //     var indices = oTable.getSelectedIndices();
                            //     var rowContext = oTable.getContextByIndex(indices[0]);
                            //     oTable.getModel().setProperty(rowContext.sPath + "/" + "Comment", comment);
                            //     }
                            Opa5.assert.ok(true, "Selected records in table");
                        },
                        errorMessage: "Unable to Select Records in Table with id" + sid
                    });
                },


			},

			assertions: {

				iShouldSeeThePageView: function () {
					return this.waitFor({
						id: "page",
						viewName: sViewName,
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
