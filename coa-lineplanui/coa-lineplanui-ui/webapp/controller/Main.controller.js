sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("coa.coalineplanui.controller.Main", {
            onInit: function () {
                var oDataModel = this.getOwnerComponent().getModel("oDataModel");
                this.getView().setModel(oDataModel);
                var roleScopes = this.getOwnerComponent().getModel().getProperty('/AuthorizationScopes');
                var access = { read: false };
                for (let item of roleScopes) {
                    if (item.includes('LinePlanReadOnly')) {
                        access.read = true;
                    }
                }
                if (access.read === false) {
                    this.getOwnerComponent().getRouter().getTargets().display("TargetNoAuth");
                } else {
                    var oSmartFilterBar = this.getView().byId("smartFilterBar");
                    oSmartFilterBar.addEventDelegate({
                        "onAfterRendering": function (oEvent) {
                            var oButton = oEvent.srcControl._oSearchButton;
                            oButton.setText("Search");
                        }
                    });
                }
            },
            onDataReceived: function (oEvent) {
                this.onSmartTableInit(oEvent);
            },
            onSmartTableInit: function (oEvent) {
                var oTable = oEvent.getSource().getTable();
                var aColumns = oTable.getColumns();
                for (let item of aColumns) {
                    item.setWidth("10rem");
                }
            },
            formatDate: function (sDate) {
                if (sDate) {
                    var pstTime = new Date(sDate.toLocaleString("en-US", {
                        timeZone: "America/Los_Angeles"
                    }));
                    var oOutFormat1 = sap.ui.core.format.DateFormat.getDateTimeInstance({
                        pattern: "MMM d y HH:mm:ss"
                    });
                    pstTime = oOutFormat1.format(pstTime);
                    return pstTime;
                } else {
                    return sDate;
                }
            },
            clearRfidFilter: function (oEvent) {
                this.getView().byId('LinePlanTab').applyVariant({});
            },
            fillFiltersforExport: function (aFilters) {
                var i;
                for (i = 0; i < this.getView().byId("LinePlanTab").getTable().getSelectedIndices().length; i++) {
                    var selIndices = this.getView().byId("LinePlanTab").getTable().getSelectedIndices()[i];
                    var obj = this.getView().byId("LinePlanTab").getTable().getContextByIndex(selIndices).getObject();

                    aFilters.push(new Filter("CM", FilterOperator.EQ, obj.CM));
                    aFilters.push(new Filter("Site", FilterOperator.EQ, obj.Site));
                    aFilters.push(new Filter("Program", FilterOperator.EQ, obj.Program));
                    aFilters.push(new Filter("Sub_Line_Name", FilterOperator.EQ, obj.Sub_Line_Name));
                }
                return aFilters;

            },

            onBeforeExportLinePlan: function (oEvent) {
                debugger;
                var aFilters = [];
                if (this.getView().byId("LinePlanTab").getTable().getSelectedIndices().length !== 0 && this.getView().byId("LinePlanTab").getTable().getSelectedIndices().length !== oEvent.getSource().getTable().getBinding("rows").getLength()) {
                    aFilters = this.fillFiltersforExport(aFilters);
                    var sFilterInUrl = sap.ui.model.odata.ODataUtils.createFilterParams(aFilters, this.getView().getModel().oMetadata, this.getView().getModel().oMetadata._getEntityTypeByPath("/CarryoverLineplan"));
                    sFilterInUrl = "&" + sFilterInUrl;
                    var serviceUri = this.getView().getModel().sServiceUrl;
                    var sPath = serviceUri + "/CarryoverLineplan?$format=json" + sFilterInUrl;
                    oEvent.getParameter("exportSettings").dataSource.count = this.getView().byId("LinePlanTab").getTable().getSelectedIndices().length;
                    oEvent.getParameter("exportSettings").dataSource.dataUrl = sPath;
                }
                if (!oEvent.getParameter("exportSettings").dataSource.count) {
                    oEvent.getParameter("exportSettings").dataSource.count = oEvent.getSource().getTable().getBinding("rows").getLength();
                }
                var n;
                var columns = oEvent.getParameter("exportSettings").workbook.columns
                for (n = 0; n < columns.length; n++) {
                    if (columns[n].property === "Date_Subline" || columns[n].property === "Date_Mainline") {
                        columns[n].type = "DateTime";
                        columns[n].utc = false;
                        columns[n].timezone = "PST";
                    }
                }
            }
        });
    });