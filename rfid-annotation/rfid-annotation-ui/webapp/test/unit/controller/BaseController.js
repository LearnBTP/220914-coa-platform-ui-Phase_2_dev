/*global QUnit*/

sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "../../../controller/BaseController",
    "sap/ui/core/mvc/View",
    "sap/m/Select"


], function (DateCore, aController, MessageBox, MessageToast, Filter, Base, ManagedObject, Select) {
    "use strict";

    QUnit.module("Base Controller", {
        beforeEach: function () {
            this.oBaseController = new Base();
        },
        afterEach: function () {
            this.oBaseController.destroy();
        }
    }
    );

    QUnit.test("UUID", function (assert) {


        // var oBase = new Base();
        if (this.oBaseController.createUUID() !== "") {

            assert.ok("UUID success");
        }


    });


});

/*global QUnit*/
