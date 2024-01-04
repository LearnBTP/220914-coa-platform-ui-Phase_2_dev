/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comapplecoa/coa-npi-program-ui/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
