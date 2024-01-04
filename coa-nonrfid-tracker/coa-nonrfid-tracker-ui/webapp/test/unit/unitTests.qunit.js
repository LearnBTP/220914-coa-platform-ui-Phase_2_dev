/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comapplecoa/coa-nonrfid-tracker-ui/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
