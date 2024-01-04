/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"coa/coa-carryover-output-ui/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
