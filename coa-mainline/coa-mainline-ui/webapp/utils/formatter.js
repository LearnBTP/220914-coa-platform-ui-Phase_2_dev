sap.ui.define([], function () {
    "use strict";
    return {
        formatDate: function (sDate) {
      
            if (sDate) {
                let date = new Date(sDate);
                let oOutFormat1 = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "MMM d y HH:mm:ss"
                });
      
                date = oOutFormat1.format(date,false);
                return date;
            } else {
                return sDate;
            }
        },
        valueStateApply:function(value){
        
            if (Array.isArray(value) && value.includes(this.getBindingInfo("value").binding.sPath) ) {
                return sap.ui.core.ValueState.Information;
            }
            else{
                return sap.ui.core.ValueState.None;
            }

        },
    };
}, true);