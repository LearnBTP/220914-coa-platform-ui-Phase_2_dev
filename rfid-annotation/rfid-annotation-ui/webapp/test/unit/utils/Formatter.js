sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../../../controller/BaseController",
   "sap/ui/core/format/DateFormat",
    "../../../utils/Formatter"


], function ( aController,Base, DateFormat, formatter) {
    "use strict";
    // QUnit.module("Formatting functions",{
    //     beforeEach: function () {
    //          
    //         this.oFormatter = formatter();
    //     },
    //     afterEach: function () {
    //         this.oFormatter.destroy();
    //     }
    // });

    QUnit.test("statusText 1", function (assert){

        var fText = formatter.statusText('PUBLISH');
        assert.equal(fText, 'Published', 'statusText function');

    });
    QUnit.test("statusIcon 1", function (assert){
        var fText = formatter.statusIcon('PUBLISH');
        assert.equal(fText, 'sap-icon://approvals', 'statusColor function');

    });
    QUnit.test("statusColor 1", function (assert){
        var fText = formatter.statusColor('PUBLISH');
        assert.equal(fText, 'Success', 'statusColor function');

    });
    QUnit.test("statusText 2", function (assert){

        var fText = formatter.statusText('DRAFT');
        assert.equal(fText, 'Draft', 'statusText function');

    });
    QUnit.test("statusIcon 2", function (assert){
        var fText = formatter.statusIcon('DRAFT');
        assert.equal(fText, 'sap-icon://document', 'statusColor function');

    });
    QUnit.test("statusColor 2", function (assert){
        var fText = formatter.statusColor('DRAFT');
        assert.equal(fText, 'Information', 'statusColor function');

    });
    QUnit.test("formatScanDate", function (assert){
        var fText = formatter.formatScanDate('2022/07/13');
        assert.equal(fText, 'Jul 13, 2022 00:00', 'formatScanDate function');

    });

});

/*global QUnit*/
