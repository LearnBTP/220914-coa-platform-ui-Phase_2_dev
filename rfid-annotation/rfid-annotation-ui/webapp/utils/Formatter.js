sap.ui.define([
    "../controller/BaseController"

], function (
    Base) {
    "use strict";
    let Formatter = 
    {
        formatScanDate: function (sDate) {

            if (!sDate) { return }

            let dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "MMM dd, yyyy HH:mm" });
            return dateFormat.format(new Date(sDate));
        },

        statusColor: function (sStatus) {
            if (sStatus === 'PUBLISH') {
                return 'Success'
            } else {
                return 'Information'
            }
        },
        statusIcon: function (sStatus) {
            if (sStatus === 'PUBLISH') {
                return 'sap-icon://approvals'
            } else {
                return 'sap-icon://document'
            }
        },

        statusText: function (sStatus) {
            if(!sStatus){
                return;
            }

            let formattedText = sStatus.charAt(0).toUpperCase() + (sStatus.slice(1)).toLowerCase();
            if (sStatus === 'PUBLISH') {
                formattedText = formattedText + 'ed';
            }
            return formattedText;
        },

        addNewText: function(sStatus,createdUser){
            if(!sStatus){
                return;
            }

            if(sStatus === "DRAFT" && createdUser && createdUser.includes("zcoa_xsuaa")){
                this.addStyleClass("zNewDraft");
                return "";
            } else{

                this.removeStyleClass("zNewDraft");
                return "";
            }
        }

       /*  // logKeyFieldText:function(sKeyFields){
        //     if(!sKeyFields){
        //         return;
        //     }

        //     return sKeyFields.split(',').pop();
        // } */

    };
    return Formatter;
},true);