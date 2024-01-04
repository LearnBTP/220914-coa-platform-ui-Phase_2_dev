sap.ui.define([], function () {
    "use strict";
    return {
        formatValue: function (value) {
            if (value !== null && value !== "") {
                try {
                    return value.split(",");
                }
                catch (e) {
                    return value;
                }
            }
        },
    }
},true);