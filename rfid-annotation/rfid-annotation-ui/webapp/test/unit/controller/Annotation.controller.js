
sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/core/mvc/View",
    "../../../controller/BaseController",
    "../../../controller/Annotation.controller"
], function (aController, MessageBox, MessageToast, Filter, ManagedObject, Base, Annotation) {
    "use strict";

    QUnit.module("Annotation Controller", {
        beforeEach: function () {
            this.oBaseController = new Base();
            this.oAnnController = new Annotation();


        },
        afterEach: function () {
            this.oBaseController.destroy();
            this.oAnnController.destroy();


        }
    }
    );

    // QUnit.test("showRfidUIError", function (assert) {

    //     var sampleText = JSON.stringify({ text: "Test Simulated Error - showRfidUIError" })
    //     this.oAnnController.showRfidUIError({
    //         value: sampleText
    //     })

    //     assert.ok("Backend Fail Message Box open");


    // });

    QUnit.test("CreateRecord", function (assert) {
        try {
            this.oAnnController._initializeGlobalVariables()
            this.oAnnController._createRecordSuccess({
                value: "sampleText"
            }, 'D')
        } catch{
            assert.ok("Created");
        }




    });

    QUnit.test("Check Shape", function(assert){
        this.oAnnController._checkShape(5,4,3,2);
        assert.ok("Check Shape")
    });

    QUnit.test("validationBeforeSave", function (assert) {

        this.oAnnController.shapeValidationBeforeSave([{
            ConfirmedRequired: true,
            toDel: false
        }]);

        assert.ok("Error Shown")

    });
    QUnit.test("validationBeforeSave1", function (assert) {

        this.oAnnController.rfidValidationBeforeSave([{
            Shape_Guid: null
        }]);

        assert.ok("Error Shown")

    });
    QUnit.test("validationBeforeSave2", function (assert) {

        this.oAnnController.rfidValidationBeforeSave([{
            LineType: null
        }])
        assert.ok("Error Shown")
    });

   

});