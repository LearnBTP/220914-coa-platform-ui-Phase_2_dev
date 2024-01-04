sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter"
], function (
    Controller,
    UIComponent,
    Filter
) {
    "use strict";

    return Controller.extend("coa.annotation.rfidannotationui.controller.BaseController", {
        sAuthAppID: undefined,
        sRelativePath: undefined,
        appODataModel: undefined,
        appODataChangeLogModel: undefined,
        appClientModel: undefined,
        sBase64Content: undefined,
        oDiaBusy: undefined,

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getViewUI(uId) {
            return this.getView().byId(uId);
        },

        createUUID() {
            let dateMS = new Date().valueOf().toString();
            let uString = `xxxxxxxx-xxxx-4xxx-yxxx-${dateMS}`;

            return uString.replace(/[xy]/g, function (c) {
                let r = Math.random() * 16 | 0;
                let v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },


        getDropDownContent: function (Base) {
            //Dropdown
            Base.appODataModel.read('/DropDown', {
                filters: [new Filter('FilterNameValue', sap.ui.model.FilterOperator.EQ, 'Site-ALL')],
                success: (response) => {
                    let dropLine = [];
                    let dropUph = [];
                    response.results.forEach(ele => {
                        if (ele.Type === 'Line') {
                            dropLine.push({
                                Id: ele.Id,
                                possibleUph: ele.Value
                            });
                        }

                        if (ele.Type === 'Uph') {
                            dropUph.push({
                                Id: Number(ele.Id),
                                possibleLine: ele.Value
                            });
                        }
                    })


                    Base.appClientModel.setProperty('/DropLineType', dropLine);
                    Base.appClientModel.setProperty('/DropUph', dropUph);

                } //Error handling implemented at Model attachRequestFailed
            });
        },


        getShapeDetails: function (aFilters, Base) {
            return new Promise((resolve, reject) => {

                //Shapes
                Base.appODataModel.read('/GetShapes', {
                    urlParameters: {
                        "$expand": "Shape_Vertices",
                        "$select": "Shape_Name,Shape_Color,Shape_Guid,Shape_Type,LineId,Line_Priority,LineType,Uph,ConfirmedBy,createdAt,ConfirmedOn,ConfirmedRequired,Shape_Vertices/Vertices_X,Shape_Vertices/Vertices_Y,Shape_Vertices/Sequence_No",
                    },
                    filters: aFilters,
                    success: (response) => {
                        let mResult = response.results.map(ele => {
                            ele.toDel = false;
                            ele.toUpd = false;
                            ele.isNew = false;
                            return ele;
                        });
                        Base.appClientModel.setProperty('/ContainerShapes', mResult);
                        resolve();
                    },
                    error: () => {
                        //Error handling implemented at Model attachRequestFailed
                       reject('Failed to fetch Shape details');
                    }
                });
            })
        },

        getAnnotaionDetails: function (aFilters, Base) {
            return new Promise((resolve, reject) => {
                //Annotation RFIDs
                Base.appODataModel.read('/AnnotationDetails', {
                    urlParameters: {
                        "$top": "10000", //Max number of RFIDs per scan
                        "$skip": "0"//a * nODataRecordLimit
                    },
                    filters: aFilters,
                    success: (response) => {
                        Base.appClientModel.setProperty('/ContainerRFIDPoints', response.results);
                        resolve();
                    },
                    error: () => {
                        //Error handling implemented at Model attachRequestFailed
                       reject('Failed to fetch Annotation details');
                    }
                });
            });

        },

        getImageContent: function (url, Base) {
            return new Promise((res, rej) => {
                fetch(url, {
                    headers: {
                        "appid": Base.sAuthAppID,
                    }
                })
                    .then((resp) => {
                        if (resp.ok) {
                            return resp.blob()
                        } else {
                            throw Error('Failed to fetch image from server')
                        }
                    })
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onload = function (event) {
                            Base.sBase64Content = event.target.result;
                            res();
                        }
                        reader.readAsDataURL(blob);
                    })
                    .catch(() => {
                        rej('Failed to fetch Image from Server');
                    })

            });
        }



    });


});