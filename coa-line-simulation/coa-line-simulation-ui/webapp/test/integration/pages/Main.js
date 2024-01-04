sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
], function (Opa5, EnterText, Press) {
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

				iShouldEnterDatainInput: function (sid, text) {
					return this.waitFor({
						timeout: 90,
						id: sid,
						viewName: sViewName,
						actions: new EnterText({
							text: text
						}),
						success: function (oInp) {
							// oInp.fireSuggest();
							Opa5.assert.ok(true, "Entered text in" + sid);
						},
						errorMessage: "Was unable to Enter Text in id" + sid
					})
				},

				iShouldMakeInputEditable: function(sid){
					return this.waitFor({
						timeout: 90,
						id: sid,
						viewName: sViewName,
						success: function(oInp){
							oInp.setValueHelpOnly(false);
						},
						errorMessage: "Not able to Make Input Editable with id "+ sid
					})
				},
				iShouldClickButtonInFragment: function (text) {
					return this.waitFor({
						timeout: 90,
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
								if (oItem.getText() === text) {
									oItem.firePress();
								}
							});
						},
						errorMessage: "Was not able to press button with text " + text
					})
				},

				iShouldSelectRecordinTabletoDownload: function (sid,index) {
					return this.waitFor({
						timeout: 90,
						id: sid,
						viewName: sViewName,
						success: function (oTable) {
							oTable.setSelectedIndex(index);
							Opa5.assert.ok(true, "Selected records in table");
						},
						errorMessage: "Unable to Select Records in Table with id" + sid
					});
				},

				iShouldSelectRecordinHeaderTabletoDownload: function (sid,index) {
					return this.waitFor({
						timeout: 90,
						id: sid,
						viewName: sViewName,
						success: function (oTable) {
							oTable.setSelectedItem(oTable.getItems()[index]);
							Opa5.assert.ok(true, "Selected records in table");
						},
						errorMessage: "Unable to Select Records in Table with id" + sid
					});
				},

				iShouldFillF4Input: function (sid, control) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        controlType: control,
                        success: function (oInput) {
                            // value = [ (new Token({
                            //     key: "site3",
                            //     text: "site3"
                            // }))];
                            oInput.fireValueHelpRequest();
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
                    });
                },

				iShouldFillF4Input: function (sid, control) {
                    return this.waitFor({
                        id: sid,
                        viewName: sViewName,
                        controlType: control,
                        success: function (oInput) {
                            // value = [ (new Token({
                            //    key: "site3",
                            //    text: "site3"
                            // }))];
                            oInput.fireValueHelpRequest();
                            Opa5.assert.ok(true, "Data Entered in Input with id" + sid);
                        },
                        errorMessage: "Was not able to enter data in input with id" + sid
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
