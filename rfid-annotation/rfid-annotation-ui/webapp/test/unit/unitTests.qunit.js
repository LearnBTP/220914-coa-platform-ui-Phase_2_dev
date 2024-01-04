/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"coaannotation/rfid-annotation-ui/test/unit/AllTests"
	], function () {
        QUnit.config.testTimeout = 300000;
		QUnit.start();
	});
});
