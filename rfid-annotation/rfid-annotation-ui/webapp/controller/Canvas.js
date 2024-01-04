/*
*the purpose of creating canvas.js and placing partial functions here was to by-pass test scripts execution.
*as the mouse events cannot be triggerd/captured using opa5
*/
sap.ui.define([
    "./BaseController",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
], function (Base, MessageBox, Fragment, Filter

) {
    "use strict";

    return {

        onMouseDownEditor(event, CG) {
            if (Base.appClientModel.getProperty('/ViewMode')) {
                CG.oMousePoint.LX = event.pageX;
                CG.oMousePoint.LY = event.pageY;
                CG.nScrollLeft = CG.hDivWrapper.scrollLeft - CG.hDivWrapper.offsetLeft;
                CG.nScrollTop = CG.hDivWrapper.scrollTop - CG.hDivWrapper.offsetTop;
                CG.bIsDrawing = false;
                CG.bViewMode = true;
                $('#canvasEditor')[0].style.cursor = 'grabbing';
            } else {
                CG.hEditorContext.strokeStyle = CG.sDrawingColor;
                CG.oMousePoint.LX = Math.round((event.clientX - CG.oEditorBounds.x + CG.oScrollAxis.X) / CG.nEditorZoomScale);
                CG.oMousePoint.LY = Math.round((event.clientY - CG.oEditorBounds.y + CG.oScrollAxis.Y) / CG.nEditorZoomScale);
                CG.bIsDrawing = true;
                CG.bViewMode = false;
            }


        },

        onMouseMoveEditor(event, CG) {

            if (CG && CG.bIsDrawing) {
                if (CG.sDrawingShapeType === 'R') {

                    let scaledX = Math.round((event.clientX - CG.oEditorBounds.x + CG.oScrollAxis.X) / CG.nEditorZoomScale);
                    let scaledY = Math.round((event.clientY - CG.oEditorBounds.y + CG.oScrollAxis.Y) / CG.nEditorZoomScale);

                    CG.oMousePoint.EX = scaledX - CG.oMousePoint.LX;
                    CG.oMousePoint.EY = scaledY - CG.oMousePoint.LY;
                    //Clear the shapes which are being created during mouse movement

                    CG.hEditorContext.clearRect(CG.oMousePoint.LX - 2, CG.oMousePoint.LY - 2, CG.oMousePoint.EX + 2, CG.oMousePoint.EY + 2);
                    CG.hEditorContext.beginPath();
                    CG.hEditorContext.strokeRect(
                        CG.oMousePoint.LX,
                        CG.oMousePoint.LY,
                        CG.oMousePoint.EX,
                        CG.oMousePoint.EY
                    );
                } else if (CG.sDrawingShapeType === 'L') {

                    CG.oMousePoint.EX = Math.round((event.clientX - CG.oEditorBounds.x + CG.oScrollAxis.X) / CG.nEditorZoomScale);
                    CG.oMousePoint.EY = Math.round((event.clientY - CG.oEditorBounds.y + CG.oScrollAxis.Y) / CG.nEditorZoomScale);

                    let isProperShape = CG.oControllerInstance._checkShape(CG.oMousePoint.LX, CG.oMousePoint.LY, CG.oMousePoint.EX, CG.oMousePoint.EY);
                    if (isProperShape) {
                        CG.hEditorContext.moveTo(CG.oMousePoint.LX, CG.oMousePoint.LY);
                        CG.hEditorContext.lineTo(CG.oMousePoint.EX, CG.oMousePoint.EY);
                        CG.hEditorContext.stroke();
                    }
                }
            } else if (CG && CG.bViewMode) {
                event.preventDefault();
                const scroll_x = event.pageX - CG.oMousePoint.LX;
                const scroll_y = event.pageY - CG.oMousePoint.LY;
                CG.hDivWrapper.scrollLeft = CG.nScrollLeft - scroll_x;
                CG.hDivWrapper.scrollTop = CG.nScrollTop - scroll_y;



            }
        },

        onMouseUpEditor: function (CG) {

            if (CG.bViewMode) {
                $('#canvasEditor')[0].style.cursor = 'default';
                CG.bViewMode = false;
                return;
            }

            if (!CG.bIsDrawing) {
                return;
            }
            let guidTxt;
            if (CG.sDrawingShapeType === 'R') {
                //This condition will not add Shapes on Click - 3px is threshold set
                let finalRectDrawing = {};
                if ((CG.oMousePoint.EX < -3 || CG.oMousePoint.EX > 3) || (CG.oMousePoint.EY < -3 || CG.oMousePoint.EY > 3)) {
                    guidTxt = CG.oControllerInstance.createUUID();

                    let rectPoints = JSON.parse(JSON.stringify(CG.oMousePoint));
                    finalRectDrawing = {
                        Shape_Vertices: {
                            results: [
                                {
                                    Shape_Guid: guidTxt,
                                    Vertices_X: rectPoints.LX,
                                    Vertices_Y: rectPoints.LY,
                                    Sequence_No: 1
                                },
                                {
                                    Shape_Guid: guidTxt,
                                    Vertices_X: rectPoints.EX,
                                    Vertices_Y: rectPoints.EY,
                                    Sequence_No: 2
                                },

                            ]
                        },
                        Shape_Guid: guidTxt,
                        Shape_Color: CG.sDrawingColor,
                        Shape_Type: CG.sDrawingShapeType,
                        isNew: true,
                        toDel: false,
                        toUpd: false,
                        ConfirmedRequired: false
                    };

                    CG.aShapes.unshift(finalRectDrawing);


                    CG.oControllerInstance._checkRfidInShape(finalRectDrawing);
                }
                CG.hEditorContext.closePath();
                CG.oControllerInstance._reDraw(CG.aShapes);

            } else if (CG.sDrawingShapeType === 'L') {
                let isProperShape = CG.oControllerInstance._checkShape(CG.oMousePoint.LX, CG.oMousePoint.LY, CG.oMousePoint.EX, CG.oMousePoint.EY);
                if (isProperShape) {


                    CG.aPolygonVertices.push({
                        LX: CG.oMousePoint.LX,
                        LY: CG.oMousePoint.LY,
                        Sequence_No: CG.aLineTempShapes.length + 1
                    });

                    CG.hEditorContext.closePath();

                    /* Start of temp line draw */
                    //Since it is one line - add in temp array to render all shapes on canvas
                    let singleLine = {
                        Shape_Vertices: JSON.parse(JSON.stringify(CG.oMousePoint)),
                        Shape_Color: CG.sDrawingColor,
                        Shape_Type: CG.sDrawingShapeType
                    };
                    CG.aLineTempShapes.push(singleLine); //All lines of polygon
                    let tempShapes = CG.aShapes.concat(CG.aLineTempShapes);
                    CG.oControllerInstance._reDraw(tempShapes);

                    /* End of temp line draw */


                    // First line and last line are connected
                    if ((Math.abs(CG.oMousePoint.EX) - CG.aPolygonVertices[0].LX) < 10 &&
                        (Math.abs(CG.oMousePoint.EY) - CG.aPolygonVertices[0].LY) < 10) {

                        guidTxt = CG.oControllerInstance.createUUID();
                        let finalPolyDrawing = {
                            Shape_Guid: guidTxt,
                            Shape_Color: CG.sDrawingColor,
                            Shape_Type: CG.sDrawingShapeType,
                            isNew: true,
                            toDel: false,
                            toUpd: false,
                            Shape_Vertices: {},
                            ConfirmedRequired: false
                        };

                        finalPolyDrawing.Shape_Vertices.results = CG.aPolygonVertices.map(ele => {
                            return {
                                Vertices_X: ele.LX,
                                Vertices_Y: ele.LY,
                                Sequence_No: ele.Sequence_No
                            };
                        });
                        CG.aShapes.unshift(finalPolyDrawing);
                        CG.aPolygonVertices = [];
                        CG.aLineTempShapes = [];

                        CG.oControllerInstance._checkRfidInShape(finalPolyDrawing);

                    }
                }




            }


            //Common to both shapes
            CG.bIsDrawing = false;
            CG.oMousePoint = {};


        },


        /**
         * 
         * Click on Editor and View Canvas to Open popup
         * 
         */
        onClickOfCanvas(event, CG, type) {

            CG.bIsDrawing = false;

            for (let c of CG.aPlotReference) {
                let scaledPointX = 0;
                let scaledPointY = 0;
                if (type === 'E') {
                    scaledPointX = event.offsetX / CG.nEditorZoomScale;
                    scaledPointY = event.offsetY / CG.nEditorZoomScale;
                }

                if (this._plotCircleIntersect(scaledPointX, scaledPointY, c)) {
                    this._openPopOver(c.Rfid, event.offsetX, event.offsetY, CG);
                    break;
                }
            }
        },


        _openPopOver(rfVal, X1, Y1, CG) {
            const allRecs = Base.appClientModel.getProperty('/ContainerRFIDPoints');

            //get x and y position for the onerfid
            let oneRfid = allRecs.find(ele => ele.Rfid === rfVal);

            //Find similar rfid's with same x any y position
            let reqRecs = allRecs.filter(ele => {
                return ele.Rfid_XAxis === oneRfid.Rfid_XAxis && ele.Rfid_YAxis === oneRfid.Rfid_YAxis;
            });

            if (reqRecs.length === 0) {
                MessageToast.show("No RFID Data found");
                return;
            }

            const oView = CG.oControllerInstance.getView();

            //Position the html button on canvas - so that it can be used by responsive popover to Open
            let proxyButton = $("#canvasProxyButton");
            proxyButton.css({
                "top": (Y1 + CG.oEditorBounds.top - CG.oScrollAxis.Y) + "px",
                "left": (X1 + CG.oEditorBounds.left - CG.oScrollAxis.X) + "px",
                "visibility": "visible"
            });


            if (!CG.oControllerInstance._rPopOver) {
                CG.oControllerInstance._rPopOver = Fragment.load({
                    id: oView.getId(),
                    name: "coa.annotation.rfidannotationui.Fragment.rfidPop",
                    controller: CG.oControllerInstance
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            CG.oControllerInstance._rPopOver.then(function (oPopover) {
                Base.appClientModel.setProperty('/SelectedRfid', reqRecs);

                //If html button creates issue in future ui5 releases execute catch statement
                try {
                    oPopover.openBy(proxyButton[0]);
                } catch {
                    oPopover.openBy(CG.oControllerInstance.getViewUI('txtAnnotate'))
                }
            })


        },

        _plotCircleIntersect: function (pointX, pointY, circle) {
            return Math.sqrt((pointX - circle.plotX) ** 2 + (pointY - circle.plotY) ** 2) < circle.radius;
        },


        hideProxyButton() {
            let proxyButton = $("#canvasProxyButton");
            proxyButton.css({
                "top": "1px",
                "left": "1px",
                "visibility": "hidden"
            });
        },



        onColorIconHover(row, CG, canvasContext, isEditMode) {

            canvasContext.beginPath();
            canvasContext.lineWidth = 8;
            canvasContext.strokeStyle = row.Shape_Color;
            if (row.Shape_Type === 'R') {
                CG.oControllerInstance._reDrawRect(row, canvasContext, isEditMode);
            } else if (row.Shape_Type === 'L') {
                CG.oControllerInstance._reDrawPoly(row, canvasContext, isEditMode);
            }


        },


        checkRfidInShape: async function (shapeObj, hData, isMock, CG) {

            const aShapeVertices = this._getAllShapesVertices(shapeObj, CG);

            let shapeInfo = {
                request: {
                    Floor: hData.Floor,
                    Site: hData.Site,
                    CM: hData.CM,
                    Building: hData.Building,
                    Status: (CG.bCreateDraftFromPublishPressed) ? CG.sStatusPublish : hData.Status,
                    Shape_Guid: shapeObj.Shape_Guid,
                    scale: {
                        X: parseFloat(hData.Scale_X),
                        Y: parseFloat(hData.Scale_Y)
                    },
                    origin: {
                        X: parseFloat(hData.Origin_X),
                        Y: parseFloat(hData.Origin_Y)
                    },
                    canvasDim: {
                        width: CG.nEditorWidth,
                        height: CG.nEditorHeight
                    },
                    Shape_Vertices: shapeObj.Shape_Vertices.results.map(ele => { delete ele.Shape_Guid; return ele; }),
                    otherShapes: aShapeVertices
                }
            };
            if (isMock) {
                fetch('./localService/mockdata/checkRFIDInsideShape.json')
                    .then(response => response.json())
                    .then(content => {
                        this._afterCheckRfidInShape(content, shapeObj, null, CG);
                    })
                    .catch(() => {
                        this._afterCheckRfidInShape(content, shapeObj, "Failed Mock Server", CG);
                    })

            } else {

                $.ajax({
                    method: "POST",
                    url: `${Base.sRelativePath}/checkRFIDInsideShape`,
                    headers: {
                        "appid": Base.sAuthAppID,
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(shapeInfo),
                    success: (content) => {
                        this._afterCheckRfidInShape(content, shapeObj, null, CG);
                    },
                    error: (err) => {
                        this._afterCheckRfidInShape(content, shapeObj, `${err.statusCode().status} - ${err.responseText}`, CG);
                    }

                });
            }

        },


        _getAllShapesVertices: function (newShapeObj, CG) {
            let filteredData = CG.aShapes.filter(record => { return (record.Shape_Guid !== newShapeObj.Shape_Guid && record.toDel === false) });
            return filteredData.map(ele => {
                return {
                    data: ele.Shape_Vertices.results.map(vRec => {
                        return {
                            Vertices_X: vRec.Vertices_X,
                            Vertices_Y: vRec.Vertices_Y,
                            Sequence_No: vRec.Sequence_No
                        }
                    })
                }
            });

        },

        _afterCheckRfidInShape: function (dataSet, shapeObj, backEndFailedText, CG) {

            //If shape overlaps, delete the shape 
            if (backEndFailedText || (dataSet.d && dataSet.d.hasOwnProperty('errMsg'))) {
                sap.ui.core.BusyIndicator.hide();
                let nIndexToDelete = 0;
                if (dataSet.d) {
                    MessageBox.error(dataSet.d.errMsg);
                    nIndexToDelete = CG.aShapes.findIndex(ele => ele.Shape_Guid === dataSet.d.Shape_Guid);
                    CG.aShapes.splice(nIndexToDelete, 1); //Delete the error shapeid
                } else {
                    MessageBox.error(`Unexpected System Error. Please Contact Technical Support. (${backEndFailedText})`);
                    CG.aShapes.shift(); //Delete the last inserted record
                }
                CG.oControllerInstance._reDraw(CG.aShapes);

            } else { //Add to Shapes Table
                let recs = Base.appClientModel.getProperty('/UiShapes') || [];
                recs.unshift(shapeObj);
                CG.oControllerInstance.getViewUI('tabShapes').getModel().refresh();

                //apply filter 
                CG.oControllerInstance._defaultFilterForShapeTable();


                //Update RFID table - if the shape is not overlapping
                if (!shapeObj.hasError) {
                    this._updateItemToRfidTable(shapeObj, dataSet.d.results, CG)
                }
            }


        },

        _updateItemToRfidTable: function (shapeObj, resultData, CG) {


            let eData = Base.appClientModel.getProperty('/UiRFIDPoints');

            resultData.forEach(rec => {
                let nInd = eData.findIndex(ele => ele.Asset_id === rec.Asset_ID);

                if (nInd >= 0) {
                    eData[nInd].Shape_Guid = rec.Shape_Guid;
                    eData[nInd].Shape_Color = shapeObj.Shape_Color;
                    eData[nInd].modifiedAt = new Date(parseInt(rec.modifiedAt.substr(6)));
                    //If AQID is similar to CO AQID copy over equipment name
                    if (eData[nInd].CarryOverAqid === null || eData[nInd].CarryOverAqid === "") {
                        eData[nInd].CarryOverEqName = eData[nInd].EquipName;
                        eData[nInd].CarryOverAqid = eData[nInd].Aqid;
                    }

                    if (eData[nInd].CarryOverOldProgram === "" || eData[nInd].CarryOverOldProgram === null) {
                        eData[nInd].CarryOverOldProgram = eData[nInd].Program;
                    }
                }
            })

            
            resultData.sort(function(a,b){
                return a.modifiedAt - b.modifiedAt
              });

            //Apply filter
            CG.oControllerInstance.getViewUI('tabSmartRFID').rebindTable();
        },

        constructUphDropDown(oEvent) {

            let val = oEvent.srcControl.getParent().getBindingContext("Drawings").getProperty();
            let uphUI = oEvent.srcControl;
            let selectedKey = uphUI.getSelectedKey();

            if (!val.LineType || !uphUI) {
                return;
            }
            uphUI.getBinding("items").filter([
                new sap.ui.model.Filter(
                    "possibleLine",
                    "Contains",
                    val.LineType
                )
            ]);
            uphUI.setSelectedKey(selectedKey);


        },
        showRfidUIError: function (dataRecords, CG) {
            try {
                let popupError = false,noAssetArray=[];
                const errorRecords = JSON.parse(dataRecords.value);
                let UiRows = Base.appClientModel.getProperty('/UiRFIDPoints');

                //Only update records which are part of response
                for (let row of UiRows) {
                    row.ErrorMsg = ''; //clear
                    let rowRespData = errorRecords.find(ele => ele.Rfid === row.Rfid && ele.Shape_Guid === row.Shape_Guid);
                    if (rowRespData) {
                        row.ErrorMsg = rowRespData.ErrorMsg; //If error exist else null will be copied over
                        row.CarryOverEqName = rowRespData.CarryOverEqName; //Eq name is present for success records only

                    }
                }
                let i;
                for(i=0; i < errorRecords.length; i++){
                    let rowFinder = UiRows.find(ele => ele.Rfid === errorRecords[i].Rfid && ele.Shape_Guid === errorRecords[i].Shape_Guid);
                    if(!rowFinder){
                        popupError = true;
                        noAssetArray.push(errorRecords[i]);
                    }
                }
                Base.appClientModel.setProperty("/noAssetErrorRecords",noAssetArray);
                Base.appClientModel.setProperty('/UiRFIDPoints', UiRows);
                CG.oControllerInstance.getViewUI('tabSmartRFID').rebindTable();
                if(!popupError){
                MessageBox.error("RFID table items have error. Please address them before saving", {
                    title: "Validation Error"
                });
                }else{
                    this.openNoAsset(CG);
                }
            } catch (e) {
                MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                    title: "System Error",
                    details: "Unexpected Error while parsing"
                });
            }
        },


        _plotTagsOnImageRFIDHover: function(hoverRFID,dotsSize,CG,headVariables){
            let rfidPlot =  hoverRFID; 
            
            CG.hEditorContext.canvas.style.display = 'block'; //Mark Editor as visible to plot rfids
            const shiftOriginX = Math.abs(Number(headVariables.Origin_X) / Number(headVariables.Scale_X));
            const shiftOriginY = Math.abs(Number(headVariables.Origin_Y) / Number(headVariables.Scale_Y));
            const offsetHeight = CG.hEditorContext.canvas.offsetHeight;

            if (rfidPlot && rfidPlot.length > 0) {
                const fSizeOfDots = dotsSize;
                rfidPlot.forEach(item => {
                    const xPosition = (Number(item.Rfid_XAxis) / Number(headVariables.Scale_X)) + shiftOriginX;
                    let yPosition = (Number(item.Rfid_YAxis) / Number(headVariables.Scale_Y)) + shiftOriginY;
                    yPosition = Math.abs(offsetHeight - yPosition);
                    CG.hEditorContext.fillStyle = "red"; 
                    CG.hEditorContext.strokeStyle = "yellow";
                    CG.hEditorContext.lineWidth   = 2;
                    CG.hEditorContext.beginPath();
                    CG.hEditorContext.arc(xPosition, yPosition, fSizeOfDots, 0, 2 * Math.PI);
                    CG.hEditorContext.fill();
                    CG.hEditorContext.stroke();

                });

            }
        },

        toMainScreen: function(lockFlag,that){
            if(lockFlag){
                that.navigateToMain();
            }
        },
        openNoAsset: function(CG){
            let that = CG.oControllerInstance;
            if(!that._noAssetLogsPopover){
                Fragment.load({ name: "coa.annotation.rfidannotationui.Fragment.NoAsset", controller: that }).then(function name(oFragment) {
                    that._noAssetLogsPopover = oFragment;
                    that.getView().addDependent(that._noAssetLogsPopover);
                    that._noAssetLogsPopover.open();
                }.bind(this));
                }else{
                    that._noAssetLogsPopover.open();
                }
        },
       applyTableLogFilter: function(oEvent,that){
        const oBindingParams = oEvent.getParameter("bindingParams");
            const oHeaderRow = Base.appClientModel.getProperty('/ContainerAnnotate');
            const sKeyFieldFilter = `${oHeaderRow.CM},${oHeaderRow.Site},${oHeaderRow.Building},${oHeaderRow.Floor},${oHeaderRow.Status}`;
            oBindingParams.filters.push(new Filter({
                filters: [
                    new Filter("Table", "EQ", "T_COA_RFID_ANNOTATION"),
                    new Filter("Key_Fields", "StartsWith", sKeyFieldFilter)
                ],
                and: true,
            })); //replace Table name related to your application

            if (!oBindingParams.sorter.length) {
                oBindingParams.sorter.push(new sap.ui.model.Sorter("modifiedAt", true));
            }
       }

    }
});