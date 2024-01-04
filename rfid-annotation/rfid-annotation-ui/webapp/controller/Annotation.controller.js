/**
 * 
 * JSON properties used in this app 
ContainerAnnotate
ContainerRFIDPoints
UiShapes
UiRFIDPoints
ViewMode
IsMock

 */


sap.ui.define([
    "../controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "./Canvas",
    "sap/ui/model/Filter",
    "../utils/Formatter"
], function (
    Base,
    Fragment,
    MessageBox,
    CNV,
    Filter,
    Formatter
) {
    "use strict";
    //Canvas Globals
    let CG = undefined;


    return Base.extend("coa.annotation.rfidannotationui.controller.Annotation", {
        formatter: Formatter,
        /**
         * @override
         */
        onInit() {

            // Set colors to color pallete         
            let colors = ["red", "gold", "darkorange", "darkmagenta", "cornflowerblue", "deepskyblue", "darkcyan", "#4DFFD2", "#FF8080", "azure", "#FF00FF","#66FF33","#0000FF","#FF99FF","#FFFF99"];
            this.getView().byId("colorPellete").setColors(colors);
            
            //Scopes Check
            let allScopes = Base.appClientModel.getProperty('/AuthorizationScopes');
            if (allScopes && (allScopes.includes('AnnotationReadOnly') || allScopes.includes('AnnotationModify'))) {
                //Init Globlas
                this._initializeGlobalVariables();
                //Div Element Creation
                const htmlContainer = this.getViewUI('htmlCanvasContainer');
                const customHTML = `<div id="divWrapper" style="height:56vh;overflow:auto;background-color:rgb(255, 255, 255);text-align: start;">
                <div id="zoomBox" style="position:relative" >
                    <img id="imgBox" style="position:absolute"></img>
                    <canvas id="canvasEditor" style="cursor:pointer;position:absolute" ></canvas>
                </div>    
                </div>`


                htmlContainer.setDOMContent(customHTML)

                htmlContainer.addEventDelegate({
                    onAfterRendering: () => {
                        this._initalizeCanvas();
                        this._attachEventToHTML();
                    }
                });

                //Attach callback
                const oRouter = this.getRouter();
                oRouter.getRoute("RouteAnnotation").attachMatched(this._onRouteMatchedAnnotate, this);

                const oHashChanger = new sap.ui.core.routing.HashChanger.getInstance();
                oHashChanger.attachEvent("hashChanged", function (oEvent) {
                    /* 
                       -This event triggers everytime a hash is been changed
                       -Empty hash represents first view && if CG is defined - it means browser back is pressed instead of Application back button
                       -oRouter is in Stopped State navigation won't happen from here unless initialize method is called;below condition is true if browser back button is pressed...
                        Hence the browse back/explicit url change will not work 
                     */
                    if (oEvent.getParameter("newHash") === "" && CG) {
                        CG.oControllerInstance.getRouter().getHashChanger().replaceHash(oEvent.getParameter("oldHash")); //Set to the current hash (stays in same view)
                        MessageBox.information('Use Application Back Button');
                    }
                }, this);



                //Attach event listener to table icon color
                this.getViewUI('iconColor').addEventDelegate({
                    onmouseover: function (oEvent) {
                        CG.oControllerInstance._onColorIconHover(oEvent.srcControl.getBindingContext('Drawings').getProperty())
                    },
                    onmouseout: function () {
                        CG.oControllerInstance._reDraw(CG.aShapes);
                    }
                });
                //Attach event listener to table drop down
                this.getView().byId("boxUph").addEventDelegate({
                    "onclick": function (oEvent) {
                        CNV.constructUphDropDown(oEvent);
                    }
                });

                //Attach event listener to RFID table icon color
                this.getViewUI('rfidShapeColor').addEventDelegate({
                    onmouseover: function (oEvent) {
                        this.dotsSize = 5 + (5 / CG.nEditorZoomScale);
                        CG.oControllerInstance._plotTagsOnImageRFID([oEvent.srcControl.getParent().getParent().getBindingContext("Drawings").getProperty()], this.dotsSize);
                    },
                    onmouseout: function (oEvent) {                        
                        CG.oControllerInstance._reDraw(CG.aShapes);
                    }
                });

                //to open Rfid popup on canvas 
                const $proxyButton = $("<button/>").attr({
                    type: "button",
                    name: "btn1",
                    id: 'canvasProxyButton',
                    style: "position:absolute; zindex:10; width:1px; height:1px; padding: 0px; background-color:transparent; border:none;visibility:hidden",

                });
                $("body").append($proxyButton);

                //Set model
                this.getView().setModel(Base.appODataModel);
                this.getViewUI('toolDraw').setModel(Base.appClientModel);
                this.getViewUI('barAnnotationPage').setModel(Base.appClientModel);
                this.getViewUI('tabShapes').setModel(Base.appClientModel);

            } else {
                //Exit out
                this.getRouter().getTargets().display("TargetNoAuth");
            }
            this.getView().byId("splitterAnnotation").addStyleClass("noHeightSplitter");
        },

        _onRouteMatchedAnnotate() {
            if (!CG) {
                this._initializeGlobalVariables();
                this._initalizeCanvas();
                CG.sDrawingShapeType = this.getViewUI('segDrawingType').getSelectedKey();
            }

            const oRouter = this.getRouter();
            oRouter.stop(); // Disable Routing Back. The Routing will be enabled only if validation Criteria Meets


                let selectedRow = Base.appClientModel.getProperty('/ContainerAnnotate');
                if (!selectedRow) {
                    MessageBox.error('No Annotation Selected', {
                        title: "Validation Error"
                    });
                    return;
                }


            //By-default make View Only
            Base.appClientModel.setProperty('/ViewMode', true);



            //Remove Filter, Sorters
            this.clearRfidFilter();


            //Using timeout as getBoundingClientRect method return method after a delay
            setTimeout(() => {
                CG.oEditorBounds = $('#divWrapper')[0].getBoundingClientRect();

                this._appIyImageOnCanvas();
                this._setDataOnUITable();
                Base.oDiaBusy.close();
            }, 1000)

            let visFlag = this.getView().byId("shapeTable").getVisible();
            if(!visFlag){
                this.getView().byId("expandBtn").firePress();
            }
        },

        _initializeGlobalVariables() {
            CG = {
                bViewMode: false,
                nScrollLeft: 0,
                nScrollTop: 0,
                hDivWrapper: undefined,
                oControllerInstance: undefined,
                nEditorWidth: 0,
                nEditorHeight: 0,
                nEditorZoomScale: 1,
                nDrawingLineWidth: 2,
                sDrawingColor: "red",
                sPlotColor: "red",
                sDrawingShapeType: 'R', // Default to Rectangle
                hEditorContext: undefined,
                oEditorBounds: {},
                oScrollAxis: {
                    X: 0,
                    Y: 0
                },
                bIsDrawing: false,
                oMousePoint: {
                    LX: 0,
                    LY: 0,
                    EX: 0,
                    EY: 0
                },
                aShapes: [],
                aLineTempShapes: [],
                aPolygonVertices: [],
                aPlotReference: [],
                sStatusPublish: 'PUBLISH',
                sStatusDraft: 'DRAFT',
                bCreateDraftFromPublishPressed: false,
                aAllShapeVertices: []
            };
        },

        _setDataOnUITable: function () {
            //Shapes Table
            let shapeAll = Base.appClientModel.getProperty('/ContainerShapes');
            if (shapeAll) {
                Base.appClientModel.setProperty('/UiShapes', JSON.parse(JSON.stringify(shapeAll)));
            }

            //RFIDs table
            let rfidPlot = Base.appClientModel.getProperty('/ContainerRFIDPoints');
            if (rfidPlot && rfidPlot.length > 0) {


                //Only Show those records in UI where shape guid is not empty
                const rfidData = JSON.parse(JSON.stringify(rfidPlot));
                rfidData.forEach((element) =>{
                    element.modifiedAt = new Date(element.modifiedAt)
                });
                Base.appClientModel.setProperty('/UiRFIDPoints', rfidData);
                this.getViewUI('tabSmartRFID').rebindTable();
            }

            this.getViewUI('txtTotalRfid').setText((rfidPlot.length || 0));
            let selRow = Base.appClientModel.getProperty('/ContainerAnnotate');
            if(selRow.Lock){
                Base.appClientModel.setProperty("/lockText",`This record is locked.Please refresh the page`);
            }else{
                Base.appClientModel.setProperty("/lockText","");   
            }

        },
        applyDefaultFilterToSmartTable: function (oEvent) {
            //Always filter out Rfid recs where ShapeGuid is not present
            const oBindingParams = oEvent.getParameter("bindingParams");
            const defaultFilter = new sap.ui.model.Filter("Shape_Guid", "NE", null);
            oBindingParams.filters.push(defaultFilter);


            //Default Sorter
            if (!oBindingParams.sorter.length) {
                oBindingParams.sorter.push(new sap.ui.model.Sorter("modifiedAt",true));
                oBindingParams.sorter.push(new sap.ui.model.Sorter("LineId",true));
            }

        },

        _defaultFilterForShapeTable: function () {
            let oBinding = this.getViewUI('tabShapes').getBinding("items");
            oBinding.filter([new sap.ui.model.Filter("toDel", "EQ", false)]);
        },

        _appIyImageOnCanvas: function () {
            let imgBox = $('#imgBox')[0];
            const img = new Image();
            img.onload = function () {

                //Place Image in Canvas and Adjust canvas height and width
                let canvas = $('#canvasEditor')[0];
                canvas.width = img.width;
                canvas.height = img.height;

                imgBox.width = img.width;
                imgBox.height = img.height;

                CG.nEditorWidth = img.width;
                CG.nEditorHeight = img.height;
                //In canvas editor - image and canvas should have same width and height
                CG.hEditorContext.drawImage(img, 0, 0, CG.nEditorWidth, CG.nEditorHeight);

                Base.sBase64Content = null; //Clear Variable

                //Apply RFID plots on Image
                CG.oControllerInstance._plotTagsOnImage();
            };
            img.src = Base.sBase64Content;
        },

        _plotTagsOnImage: function () {

            let rfidPlot = Base.appClientModel.getProperty('/ContainerRFIDPoints');
            const headVariables = Base.appClientModel.getProperty('/ContainerAnnotate');

            CG.hEditorContext.canvas.style.display = 'block'; //Mark Editor as visible to plot rfids
            const shiftOriginX = Math.abs(Number(headVariables.Origin_X) / Number(headVariables.Scale_X));
            const shiftOriginY = Math.abs(Number(headVariables.Origin_Y) / Number(headVariables.Scale_Y));
            const offsetHeight = CG.hEditorContext.canvas.offsetHeight;

            if (rfidPlot && rfidPlot.length > 0) {
                const fSizeOfDots = 3.8;
                rfidPlot.forEach(item => {
                    const xPosition = (Number(item.Rfid_XAxis) / Number(headVariables.Scale_X)) + shiftOriginX;
                    let yPosition = (Number(item.Rfid_YAxis) / Number(headVariables.Scale_Y)) + shiftOriginY;
                    yPosition = Math.abs(offsetHeight - yPosition);
                    CG.hEditorContext.fillStyle = CG.sPlotColor; //Default Red Dots always
                    CG.hEditorContext.beginPath();
                    CG.hEditorContext.arc(xPosition, yPosition, fSizeOfDots, 0, 2 * Math.PI);
                    CG.hEditorContext.fill();


                    CG.aPlotReference.push({
                        plotX: xPosition,
                        plotY: yPosition,
                        radius: fSizeOfDots,
                        Rfid: item.Rfid
                    })

                });
            }

            //Redraw image with Plots over it
            const canvas = $('#canvasEditor')[0];
            const imgBox = $('#imgBox')[0];
            imgBox.src = canvas.toDataURL();

            CG.hEditorContext.clearRect(0, 0, CG.nEditorWidth, CG.nEditorHeight); //Remove Image from Canvas; Canvas should only have shapes

            //Draw All Shapes on Image
            let sData = Base.appClientModel.getProperty('/UiShapes');
            if (sData && sData.length > 0) {
                CG.aShapes = JSON.parse(JSON.stringify(sData));
                CG.oControllerInstance._reDraw(sData);
            }
            this.toggleViewMode();

        },

        _plotTagsOnImageRFID: function (hoverRFID, dotsSize) {
            const headVariables = Base.appClientModel.getProperty('/ContainerAnnotate');
            CNV._plotTagsOnImageRFIDHover(hoverRFID,dotsSize,CG,headVariables);
        },

        navigateToMain: function () {
            this.resetZoom();
            //Remove lock if leaving in edit mode
            if (!Base.appClientModel.getProperty('/ViewMode')) {
                this.toggleLock(null, 'X');
            }


            CG = null;
            //Clear tables data
            Base.appClientModel.setProperty('/ContainerAnnotate', {});
            Base.appClientModel.setProperty('/ContainerRFIDPoints', []);
            Base.appClientModel.setProperty('/ContainerShapes', []);

            Base.appClientModel.setProperty('/UiShapes', []);
            Base.appClientModel.setProperty('/UiRFIDPoints', []);

            const oRouter = this.getRouter();
            oRouter.initialize(true); //Removes the Stop Flag set earlier on the router
            oRouter.navTo("RouteMain");
        },
        onColorSelection(oEvent) {
            const col = oEvent.getParameter("value");
            CG.sDrawingColor = col;
        },

        onDrawSelection: function (oEvent) {
            CG.sDrawingShapeType = oEvent.getSource().getSelectedKey();
        },

        deleteShape: function (oEvent) {
            let v = oEvent
                .getSource()
                .getBindingContext("Drawings")
                .getObject();

            //mark delete from UI
            v.toDel = true;

            //mark del in array
            let drawingRec = CG.aShapes.find(ele => ele.Shape_Guid === v.Shape_Guid);
            drawingRec.toDel = true;

            //Filter non delete records
            this._defaultFilterForShapeTable();

            //Re-render all the shapes excluding the deleted ones
            this._reDraw(CG.aShapes);

            //Un-assign shape_guid from rfid table
            let rfidRecs = Base.appClientModel.getProperty('/UiRFIDPoints');
            rfidRecs.forEach(rfidRow => {
                if (v.Shape_Guid === rfidRow.Shape_Guid) {
                    rfidRow.Shape_Guid = null;
                    rfidRow.Comments = null;
                    rfidRow.LineId = null;
                    rfidRow.LineType = null;
                    rfidRow.Uph = null;
                    rfidRow.Override_LineId = null;
                    rfidRow.CarryOverOldProgram = null;
                    rfidRow.CarryOverAqid = null;
                    rfidRow.ErrorMsg = '';
                }
            });
            this.getViewUI('tabSmartRFID').rebindTable();
            sap.m.MessageToast.show('Shape Removed');

        },

        deleteAll: function () {


            MessageBox.warning(`This will remove all the annotations from the screen. Do you want to proceed?`, {
                actions: ['Yes', MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === 'Yes') {


                        //Mark del all - Shapes
                        let shapeRecs = Base.appClientModel.getProperty('/UiShapes');
                        shapeRecs.forEach(shRow => {
                            shRow.toDel = true;
                        });

                        //update del in array
                        if (typeof shapeRecs === "object") {
                            CG.aShapes = JSON.parse(JSON.stringify(shapeRecs));
                        }

                        //Filter non delete records
                        CG.oControllerInstance._defaultFilterForShapeTable();


                        //RFID
                        let rfidRecs = Base.appClientModel.getProperty('/UiRFIDPoints');
                        rfidRecs.forEach(rfidRow => {
                            rfidRow.Shape_Guid = null;
                            rfidRow.Comments = null;
                            rfidRow.LineId = null;
                            rfidRow.LineType = null;
                            rfidRow.Uph = null;
                            rfidRow.Override_LineId = null;
                            rfidRow.CarryOverOldProgram = null;
                            rfidRow.CarryOverAqid = null;
                            rfidRow.ErrorMsg = '';
                        });
                        CG.oControllerInstance.getViewUI('tabSmartRFID').rebindTable();

                        //clear canvas
                        CG.oControllerInstance._clearCanvas();


                        //fancy popup
                        CG.oControllerInstance._showSuccessToast('All Shapes Removed');
                    }

                }
            });





        },

        updateShape: function (oEvent, bFlagClearUph, bConfirmLinkPressed) {
            //Set Update flags
            let oUI = oEvent.getSource()
            let context = oUI.getBindingContext('Drawings');
            let v = context.getObject();

            //If user types a value not part of combobox, then it should clear the value
            //Line Type and UPH are only 2 comboboxes 
            if (oUI.getMetadata()._sClassName === "sap.m.ComboBox" &&
                oUI.getSelectedKey() === ''
            ) {
                oUI.setValue('');
                bFlagClearUph = true;
            }


            if (!v.isNew) {
                v.toUpd = true;

                //Only applicable to Records which are stored in DB
                if (bConfirmLinkPressed) {
                    v.ConfirmedOn = new Date().toLocaleString("en-US", {
                        timeZone: "America/Los_Angeles"
                    });
                    v.ConfirmedBy = Base.appClientModel.getProperty('/UserName');
                    v.ConfirmedRequired = false;
                }
            }



            if (bFlagClearUph) {
                v.Uph = null;
            }

            Base.appClientModel.setProperty(context.getPath(), v)

            //Update the RFID table
            let rfidRecs = Base.appClientModel.getProperty('/UiRFIDPoints');

            (rfidRecs.filter(ele => ele.Shape_Guid === v.Shape_Guid)).forEach(rec => {
                rec.LineType = v.LineType;
                rec.Line_Priority = v.Line_Priority;
                rec.Comments = v.Shape_Name;
                rec.LineId = v.LineId;
                rec.Uph = bFlagClearUph ? null : v.Uph;
            });

            Base.appClientModel.refresh();
            this.getView().byId('tabSmartRFID').rebindTable();
        },


        _initalizeCanvas() {
            CG.oControllerInstance = this;

            CG.hDivWrapper = $('#divWrapper')[0];

            const divUI = $('#divWrapper')[0];
            let dW = divUI.clientWidth;
            let dH = divUI.clientHeight;

            // Editor
            const canvas = $('#canvasEditor')[0];

            CG.nEditorWidth = dW;
            CG.nEditorHeight = dH;

            canvas.width = CG.nEditorWidth;
            canvas.height = CG.nEditorHeight;

            const imgBox = $('#imgBox')[0];
            imgBox.width = CG.nEditorWidth;
            imgBox.height = CG.nEditorHeight;

            CG.hEditorContext = canvas.getContext('2d');
            CG.hEditorContext.lineWidth = CG.nDrawingLineWidth;


        },

        toggleViewMode() {

            const canvasEditor = $('#canvasEditor')[0];
            if (Base.appClientModel.getProperty('/ViewMode')) {
                canvasEditor.style.cursor = 'default';
            } else {
                canvasEditor.style.cursor = 'pointer';
            }
        },

        _attachEventToHTML() {
            $('#divWrapper').on('scroll', this._onScroll);
            $('#divWrapper').on('contextmenu', event => event.preventDefault());

            $('#canvasEditor').on('click', this._onClickEditor);
            $('#canvasEditor').on('mousedown', this._onMouseDownEditor);
            $('#canvasEditor').on('mousemove', this._onMouseMoveEditor);
            $('#canvasEditor').on('mouseup', this._onMouseUpEditor);
            $('#canvasEditor').on('mouseleave', this._onMouseLeaveEditor);



        },


        _onClickEditor(event) {
            CNV.onClickOfCanvas(event, CG, 'E');
        },
        hideProxyButton() {
            CNV.hideProxyButton();
        },

        _onMouseDownEditor(event) {
            CNV.onMouseDownEditor(event, CG);
        },

        _onMouseMoveEditor(event) {
            CNV.onMouseMoveEditor(event, CG);
        },

        _onMouseUpEditor: function () {
            CNV.onMouseUpEditor(CG);
        },


        _checkShape: function (x1, y1, x2, y2) {
            //Returns false if size of shape is too small i.e barely visible
            const diffX = x2 - x1;
            const diffY = y2 - y1;
            return ((diffX < -5 || diffX > 5) || (diffY < -5 || diffY > 5)) ? true : false;
        },

        _onMouseLeaveEditor() {
            if (CG) {
                if (CG.bIsDrawing) {
                    sap.m.MessageToast.show('Drawing exceed the bounds');
                    CG.oControllerInstance._reDraw(CG.aShapes);
                }
                CG.bIsDrawing = false;
                CG.bViewMode = false;
            }
        },

        _onScroll(val) {
            CG.oScrollAxis.X = val.currentTarget.scrollLeft;
            CG.oScrollAxis.Y = val.currentTarget.scrollTop;

        },


        _reDraw: function (drawings) {

            //Remove all and re-apply the image
            CG.hEditorContext.clearRect(0, 0, CG.nEditorWidth, CG.nEditorHeight);
            CG.hEditorContext.lineWidth = CG.nDrawingLineWidth;



            for (let rec of drawings) {
                if (rec.toDel) { //skip delete redrawings
                    continue;
                }

                CG.hEditorContext.beginPath();
                CG.hEditorContext.strokeStyle = rec.Shape_Color;

                if (rec.Shape_Type === 'R') {
                    this._reDrawRect(rec, CG.hEditorContext, true);
                } else if (rec.Shape_Type === 'L') {
                    if (Array.isArray(rec.Shape_Vertices.results)) {
                        this._reDrawPoly(rec, CG.hEditorContext, true);
                    } else {
                        CG.hEditorContext.moveTo(rec.Shape_Vertices.LX, rec.Shape_Vertices.LY);
                        CG.hEditorContext.lineTo(rec.Shape_Vertices.EX, rec.Shape_Vertices.EY);
                        CG.hEditorContext.stroke();
                    }
                }
            }
        },



        _reDrawRect: function (sObj, context, isEditMode) {
            for (let p = 0; p < sObj.Shape_Vertices.results.length; p++) {
                const point1 = sObj.Shape_Vertices.results[p];
                const point2 = sObj.Shape_Vertices.results[p + 1];
                if (!point2) {
                    break;
                }

                let sPx = 0;
                let sPy = 0;
                let ePx = 0;
                let ePy = 0;

                if (isEditMode) {
                    sPx = Number(point1.Vertices_X);
                    sPy = Number(point1.Vertices_Y);

                    ePx = Number(point2.Vertices_X);
                    ePy = Number(point2.Vertices_Y);
                }
                context.strokeRect(sPx, sPy, ePx, ePy);

            }
        },
        _reDrawPoly: function (sObj, context, isEditMode) {
            //Sort by sequence
            sObj.Shape_Vertices.results.sort((a, b) => {
                return a.Sequence_No - b.Sequence_No;
            })

            for (let p = 0; p < sObj.Shape_Vertices.results.length; p++) {

                const point1 = sObj.Shape_Vertices.results[p];
                let point2 = sObj.Shape_Vertices.results[p + 1];
                if (!point2) {
                    point2 = sObj.Shape_Vertices.results[0]; //First line
                }

                let sPx = 0;
                let sPy = 0;
                let ePx = 0;
                let ePy = 0;

                if (isEditMode) {
                    sPx = Number(point1.Vertices_X);
                    sPy = Number(point1.Vertices_Y);

                    ePx = Number(point2.Vertices_X);
                    ePy = Number(point2.Vertices_Y);
                }


                context.moveTo(sPx, sPy);
                context.lineTo(ePx, ePy);
                context.stroke();
            }
        },

        _clearCanvas: function () {
            CG.hEditorContext.clearRect(0, 0, CG.nEditorWidth, CG.nEditorHeight);

        },

        _checkRfidInShape: function (shapeObj) {
            const hData = Base.appClientModel.getProperty('/ContainerAnnotate');
            const isMock = Base.appClientModel.getProperty('/IsMock');

            CNV.checkRfidInShape(shapeObj, hData, isMock, CG);

        },

        saveConfirmation: function (oEvent, mode) {
            let headerData = Base.appClientModel.getProperty('/ContainerAnnotate')
            if(oEvent.mParameters.fromPopUp){
                headerData.skip = 'X';
            }else{
                headerData.skip = '';
            }
            Base.appClientModel.setProperty('/ContainerAnnotate', headerData);
            const msgText = mode === 'P' ? CG.sStatusPublish : CG.sStatusDraft;
            MessageBox.warning(`Please confirm for saving this as ${msgText} record. This action will override previous version of ${msgText}.`, {
                actions: ['Save', MessageBox.Action.CANCEL],
                emphasizedAction: 'Save',
                onClose: function (sAction) {
                    if (sAction === 'Save') {
                        CG.oControllerInstance.saveShapes(mode)
                    }

                }
            });


        },


        shapeValidationBeforeSave: function (shapeRecs) {

            if (shapeRecs.some(recs => recs.ConfirmedRequired === true && recs.toDel === false)) {
                MessageBox.error('Please provide confirmation on the Shapes', {
                    title: "Validation Error"
                });
                return false;
            }
            return true;
        },
        rfidValidationBeforeSave: function (rfidRecs) {
            //All RFID should be part of a shape 
            //Line Id, UPH, Line Type shouldn't be empty
            const openRfid = rfidRecs.filter(rec => rec.Shape_Guid === null);
            if (openRfid.length > 0) {
                MessageBox.error('Every RFID should be enclosed in a Shape. Please Annotate the open RFIDs', {
                    title: "Validation Error"
                });
                return false;
            }

            if (rfidRecs.some(rec => rec.LineId === null || rec.LineType === null || rec.Uph === null)) {
                MessageBox.error('Line Id/Line Type/Uph is mandatory for RFIDs. Please provide a valid input', {
                    title: "Validation Error"
                });
                return false;
            }

            return true;
        },

        /**
         * 
         * @param {
         * P = PUBLISH
         * C = CREATE FROM PUBLISH
         * D = DRAFT
         * } mode 
         */
        saveShapes: function (mode) {

            //If Mass Update 


            const isMock = Base.appClientModel.getProperty('/IsMock');
            let headerData = Base.appClientModel.getProperty('/ContainerAnnotate');
            let shapesData = Base.appClientModel.getProperty('/UiShapes');
            let rfidDataUI = Base.appClientModel.getProperty('/UiRFIDPoints');



            //P = Publish Mode; C = Create Draft From Published Mode
            if (CG.bCreateDraftFromPublishPressed && mode === 'D') {
                mode = 'C';
            }


            if (!this.shapeValidationBeforeSave(shapesData)) {
                return;
            }

            if (mode === 'P' && this.rfidValidationBeforeSave(rfidDataUI) === false && !isMock) {
                return;
            }


            let deltaRequest = {
                header: {},
                shapes: {
                    new_shapes: [],
                    del_shapes: []
                },
                rfid: []
            };
            if (mode === 'D') {
                deltaRequest.shapes.upd_shapes = [];
            }


            sap.ui.core.BusyIndicator.show(0);
            let headObj = {
                Floor: headerData.Floor,
                Site: headerData.Site,
                CM: headerData.CM,
                Building: headerData.Building,
                Status: headerData.Status,
                Required_Version: (this.isPublishCreate) ? "PUBLISH" : "DRAFT",
                skip: headerData.skip
            };


            deltaRequest = this._prepareShapesData(shapesData, deltaRequest, mode);
            deltaRequest = this._prepareRfidData(rfidDataUI, deltaRequest);

            //Update RFID with Shape_Guid and Other Fields
            deltaRequest.header = JSON.parse(JSON.stringify(headObj));
            let apiPath;
            switch (mode) {
                case 'P':
                    apiPath = 'publishAnnotation'; //Publish Draft
                    break;
                case 'C':
                    apiPath = 'createDraftAnnotation'; //Create Draft
                    break;
                case 'D':
                    apiPath = 'saveAsAnnotation'; //Save Draft
                    break;
            }

            this._createRecord({
                request: deltaRequest
            }, apiPath, mode);
        },

        _prepareShapesData(Shapes, deltaRequest, mode) {

            for (let rec of Shapes) {
                let shapeBody = {
                    Shape_Guid: rec.Shape_Guid,
                    Shape_Color: rec.Shape_Color,
                    Shape_Type: rec.Shape_Type,
                    Shape_Name: rec.Shape_Name,
                    LineId: rec.LineId,
                    LineType: rec.LineType,
                    Line_Priority: CG.oControllerInstance.getLinePriorityValue(rec.Line_Priority),
                    Uph: typeof (rec.Uph) === 'number' || typeof (rec.Uph) === 'string' ? Number(rec.Uph) : null,
                    Shape_Vertices: { results: rec.Shape_Vertices.results.map(points => { return { Vertices_X: points.Vertices_X, Vertices_Y: points.Vertices_Y, Sequence_No: points.Sequence_No } }) }
                };

                if (rec.isNew === true && rec.toDel === false) {
                    deltaRequest.shapes.new_shapes.push(shapeBody);
                } else if (rec.toDel === true && rec.isNew === false) {
                    deltaRequest.shapes.del_shapes.push(shapeBody.Shape_Guid);
                } else if (rec.toUpd === true && rec.isNew === false) {


                    if (mode === 'D') {
                        shapeBody.ConfirmedBy = rec.ConfirmedBy;
                        shapeBody.ConfirmedOn = rec.ConfirmedOn;
                        shapeBody.ConfirmedRequired = rec.ConfirmedRequired;
                        delete shapeBody.Shape_Vertices;
                        deltaRequest.shapes.upd_shapes.push(shapeBody);
                    } else {
                        deltaRequest.shapes.new_shapes.push(shapeBody);
                    }
                }


            }

            return deltaRequest;
        },
        getLinePriorityValue: function(value){
            return typeof (value) === 'number' || typeof (value) === 'string' ? Number(value) : null;
        },

        _prepareRfidData(rfids, deltaRequest) {

            if (rfids.length > 0) {
                let allRfidData = Base.appClientModel.getProperty('/ContainerRFIDPoints');
                rfids.forEach(uiRfid => {
                    //Only consider updating the changed records
                    let originalRfidRec = allRfidData.find(ele => ele.Rfid === uiRfid.Rfid) || {};
                    //If any of the fields do not match with original record
                    if (uiRfid.Shape_Guid !== originalRfidRec.Shape_Guid ||
                        uiRfid.Comments !== originalRfidRec.Comments ||
                        uiRfid.LineId !== originalRfidRec.LineId ||
                        uiRfid.Override_LineId !== originalRfidRec.Override_LineId ||
                        uiRfid.LineType !== originalRfidRec.LineType ||
                        uiRfid.Line_Priority !== originalRfidRec.Line_Priority ||
                        uiRfid.Uph !== originalRfidRec.Uph ||
                        uiRfid.CarryOverAqid !== originalRfidRec.CarryOverAqid ||
                        uiRfid.CarryOverOldProgram !== originalRfidRec.CarryOverOldProgram
                    ) {
                        let lineToUpdate = {
                            Rfid: uiRfid.Rfid,
                            Comments: uiRfid.Comments,
                            Shape_Guid: uiRfid.Shape_Guid,
                            Shape_Color: uiRfid.Shape_Color,
                            LineId: uiRfid.LineId,
                            LineType: uiRfid.LineType,
                            Line_Priority: CG.oControllerInstance.getLinePriorityValue(uiRfid.Line_Priority),
                            Override_LineId: uiRfid.Override_LineId,
                            Uph: typeof (uiRfid.Uph) === 'number' || typeof (uiRfid.Uph) === 'string' ? Number(uiRfid.Uph) : null,
                            Aqid: uiRfid.Aqid,
                            CarryOverAqid: uiRfid.CarryOverAqid,
                            CarryOverOldProgram: uiRfid.CarryOverOldProgram
                        };
                        deltaRequest.rfid.push(lineToUpdate);

                    }

                });
            }

            return deltaRequest;
        },

        createRecordAnnotation: function(uiContent, path, mode){
            $.ajax({
                method: "POST",
                url: `${Base.sRelativePath}/${path}`,
                headers: {
                    "appid": Base.sAuthAppID,
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(uiContent),
                success: (content) => {
                    this._createRecordSuccess(content.d.results, mode);
                    this.closeUpdateChange();
                },
                error: (err) => {
                    this.showErrorAjaxCall(err);
                }
            });
        },

        _createRecord: function (uiContent, path, mode) {

                this.createRecordAnnotation(uiContent,path,mode);

            
        },


        _createRecordSuccess: function (dataSet, mode) {
            this.isPublishCreate = false;
            if (mode === 'D' || mode === 'C') {
                this.updateUIScreen(CG.sStatusDraft, false, dataSet);
                this._showSuccessToast('Success - Saved As Draft');
            } else {
                this.updateUIScreen(CG.sStatusPublish, false, dataSet);
                this._showSuccessToast('Success - Published');
            }
            CG.bCreateDraftFromPublishPressed = false; //Reset Flag
            this.clearRfidFilter();
        },

        updateAnnotationScreen: function(status, isCreateButtonPressed, successRfidData){
            if(status === "PUBLISHCREATE"){
                status = "DRAFT";
            }
            CG.bCreateDraftFromPublishPressed = isCreateButtonPressed;

            //1. header
            Base.appClientModel.setProperty('/ContainerAnnotate/Status', status);


            //2. Shapes - Update latest changes on Shapes tables
            let shapesData = Base.appClientModel.getProperty('/UiShapes');
            let finalShapes = [];

            shapesData.forEach(ele => {
                if (!ele.toDel) {
                    ele.toUpd = false;// Delete flag maintains the same value, because it is not suppose to render in UI
                    ele.isNew = false; //All of them are false 
                    ele.Status = status;
                    ele.ConfirmedBy = null;
                    ele.ConfirmedOn = null;
                    ele.ConfirmedRequired = null;
                    finalShapes.push(ele);
                }

            });

            try {
                const fixedShapes = JSON.parse(JSON.stringify(finalShapes)); // Change in UiShapes shouldn't change the ContainerShapes. Therefore deep-cloning
                Base.appClientModel.setProperty('/ContainerShapes', fixedShapes);
                Base.appClientModel.setProperty('/UiShapes', finalShapes);
                CG.aShapes = JSON.parse(JSON.stringify(finalShapes));
            } catch {
                MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                    title: "System Error",
                    details: 'Unexpected Error in Parsing - Please reload the application'
                });
                return;
            }

            Base.appClientModel.setProperty('/ViewMode', status === CG.sStatusPublish ? true : false);
            this.toggleViewMode();

            let rfidData = Base.appClientModel.getProperty('/UiRFIDPoints');
            let fixedRfid = {};

            if (isCreateButtonPressed && rfidData.length > 0) {
                //Update status on Rfid Table rows

                let modRfidData = rfidData.map(ele => {
                    ele.Status = status
                    return ele;
                });
                fixedRfid = JSON.parse(JSON.stringify(modRfidData)); // Change in UiRFIDPoints shouldn't change the ContainerRFIDPoints. Therefore deep-cloning
                Base.appClientModel.setProperty('/ContainerRFIDPoints', fixedRfid);
                Base.appClientModel.setProperty('/UiRFIDPoints', modRfidData);

                this._showSuccessToast('Draft record created');
            } else if (successRfidData.length > 0) {
                fixedRfid = JSON.parse(JSON.stringify(successRfidData)); // Change in UiRFIDPoints shouldn't change the ContainerRFIDPoints. Therefore deep-cloning
                const uiRfid = JSON.parse(JSON.stringify(successRfidData)); // Change in UiRFIDPoints shouldn't change the ContainerRFIDPoints. Therefore deep-cloning
                Base.appClientModel.setProperty('/ContainerRFIDPoints', fixedRfid);
                Base.appClientModel.setProperty('/UiRFIDPoints', uiRfid);
            }



            sap.ui.core.BusyIndicator.hide();
        },


        updateUIScreen: function (status, isCreateButtonPressed, successRfidData) {
            let lockFlag;
            if(status === CG.sStatusPublish){
                lockFlag = false;
            }else{
                lockFlag = true;
            }
            const isMock = Base.appClientModel.getProperty('/IsMock');
            if(status === "PUBLISHCREATE" && !isMock){
                status = "DRAFT";
                this.isPublishCreate = true;
                const oHeaderRow = Base.appClientModel.getProperty('/ContainerAnnotate');
                let data = {
                    request: {
                    Building : oHeaderRow.Building,
                    Floor : oHeaderRow.Floor,
                    Site: oHeaderRow.Site,
                    CM: oHeaderRow.CM
                    }
                }
                $.ajax({
                    method: "POST",
                    url: `${Base.sRelativePath}/check_draft_record`,
                    headers: {
                        "appid": Base.sAuthAppID,
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify(data),
                    success: (content) => {
                      if(content && content.d && content.d.check_draft_record && content.d.check_draft_record.msg){
                        MessageBox.show(
                            content.d.check_draft_record.msg, {
                            icon: MessageBox.Icon.WARNING,
                            title: "Severe Warning",
                            actions: [MessageBox.Action.OK,MessageBox.Action.CANCEL],
                            emphasizedAction: MessageBox.Action.CANCEL,
                            styleClass: "zWarningStyle",
                            onClose: function (sAction) {
                                    if(sAction === "OK"){
                                        this.updateAnnotationScreen(status, isCreateButtonPressed, successRfidData);
                                        this.toggleLock(null,'',lockFlag)
                                    }
                                }.bind(this)
                            });
                      } else{
                       this.updateAnnotationScreen(status, isCreateButtonPressed, successRfidData);
                       this.toggleLock(null,'',lockFlag)
                      }
                    },
                    error: (err) => {
                        this.showErrorAjaxCall(err);
                    }
                });
            } else{
                this.updateAnnotationScreen(status, isCreateButtonPressed, successRfidData);
                this.toggleLock(null,'',lockFlag)
            }

           
        },

        showErrorAjaxCall: function(err){
            if (err.statusCode().status === 400) {
                CNV.showRfidUIError(err.responseJSON.error.message, CG);
            } else {
                MessageBox.error("Unexpected System Error. Please Contact Technical Support", {
                    title: "System Error",
                    details: err
                });
            }
            sap.ui.core.BusyIndicator.hide();
            this.closeUpdateChange();
        },

        _onColorIconHover(row) {
            CNV.onColorIconHover(row, CG, CG.hEditorContext, true);
        },

        onZoom(val) {
            //Zoom Editor

            if (val === 1) {
                CG.nEditorZoomScale += 0.2;
            } else {
                let zVal = parseFloat(CG.nEditorZoomScale.toFixed(3) - 0.2);

                if (zVal > 0) {
                    CG.nEditorZoomScale = zVal;
                } else {
                    sap.m.MessageToast.show('Zoom out limit reached');
                }
            }
            $('#canvasEditor')[0].style.zoom = CG.nEditorZoomScale;
            $('#imgBox')[0].style.zoom = CG.nEditorZoomScale;

        },

        resetZoom() {
            CG.nEditorZoomScale = 1;
            $('#canvasEditor')[0].style.zoom = CG.nEditorZoomScale;
            $('#imgBox')[0].style.zoom = CG.nEditorZoomScale;
        },

        refreshDrawings() {
            this._reDraw(CG.aShapes);
            CG.aPolygonVertices = [];
            CG.aLineTempShapes = [];
            sap.m.MessageToast.show("Shapes Refreshed");

        },
        showChangeLog: function () {
            let oView = this.getView();
            if (!this._diaChangeLog) {
                this._diaChangeLog = Fragment.load({
                    id: oView.getId(),
                    name: "coa.annotation.rfidannotationui.Fragment.ChangeLog", //path to the fragment created
                    controller: this
                }).then(function (oDialog) {
                    oDialog.setModel(Base.appODataChangeLogModel); //variable to which your changelog Odata model is assigned
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._diaChangeLog.then(function (oDialog) {
                oDialog.open();
                sap.ui.core.Fragment.byId(oView.getId(), "tabChangeLog").rebindTable();
            })
        },

        closeChangeLog() {
            this._diaChangeLog.then(function (oDialog) {
                oDialog.close();
            })
        },
        applyTableLogFilter: function (oEvent) {
            CNV.applyTableLogFilter(oEvent,this);
        },

        onRfidFullScreen(oEvent) {
            if (oEvent.getParameters().fullScreen) {
                this.getViewUI('tabSmartRFID').getTable().setVisibleRowCount(18);
            } else {
                this.getViewUI('tabSmartRFID').getTable().setVisibleRowCount(4)
            }
        },

        tableScroller: function (direction) {
            let tabUI = this.getViewUI('tabSmartRFID').getTable();
            let hScroll = tabUI._getScrollExtension().getHorizontalScrollbar();
            if (direction === 'L') {
                hScroll.scrollLeft -= 220;
            } else {
                hScroll.scrollLeft += 220;
            }
        },


        _showSuccessToast: function (messageTxt) {
            let oView = this.getView();

            if (!this._diaSuccessToast) {
                this._diaSuccessToast = Fragment.load({
                    id: oView.getId(),
                    name: "coa.annotation.rfidannotationui.Fragment.SuccessToast", //path to the fragment created
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._diaSuccessToast.then(function (oDialog) {

                let blockLayer = $('.sapUiBLy')[0];
                if (blockLayer) {

                    $('.sapUiBLy')[0].style.backgroundColor = 'transparent';
                }

                oDialog.open();
                sap.ui.core.Fragment.byId(oView.getId(), "txtMsg").setText(messageTxt);
                setTimeout(() => {
                    oDialog.close();
                }, 2000);
            })
        },

        afterCloseSuccessToast: function () {
            $('.sapUiBLy')[0].style.backgroundColor = '#000';
        },


        showMassUpdate: function () {
            const sels = this.getViewUI('tabSmartRFID').getTable().getSelectedIndices().length
            if (sels === 0) {
                sap.m.MessageToast.show('Please select at least one or more rows');
                return;
            }

            if (sels > 5000) {
                sap.m.MessageToast.show("You cannot mass update more than 5000 records");
                return;
            }


            let oView = this.getView();

            if (!this._diaMassUpdate) {
                this._diaMassUpdate = Fragment.load({
                    id: oView.getId(),
                    name: "coa.annotation.rfidannotationui.Fragment.MassUpdate", //path to the fragment created
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);

                    oDialog.setModel(Base.appClientModel);
                    return oDialog;
                });
            }
            this._diaMassUpdate.then(function (oDialog) {
                Base.appClientModel.setProperty('/MassUpdateVal', {}); //Clear
                oDialog.open();
            })
        },

        applyUpdateChange: function () {
            const tab = this.getViewUI('tabSmartRFID').getTable();
            const aSelections = tab.getSelectedIndices();
            const aTabModel = tab.getModel();
            const oUserForm = Base.appClientModel.getProperty('/MassUpdateVal');



            aSelections.forEach(row => {
                let oRowObj = tab.getContextByIndex(row);
                let oRowData = oRowObj.getObject();


                oRowData.CarryOverAqid = oUserForm.CarryOverAqid ? oUserForm.CarryOverAqid : oRowData.CarryOverAqid;
                oRowData.CarryOverOldProgram = oUserForm.CarryOverOldProgram ? oUserForm.CarryOverOldProgram : oRowData.CarryOverOldProgram;
                oRowData.Override_LineId = oUserForm.Override_LineId ? oUserForm.Override_LineId : oRowData.Override_LineId;
                oRowData.LineType = oUserForm.LineType ? oUserForm.LineType : oRowData.LineType;
                oRowData.Uph = oUserForm.Uph ? oUserForm.Uph : oRowData.Uph;
                oRowData.Comments = oUserForm.Comments ? oUserForm.Comments : oRowData.Comments;

                aTabModel.setProperty(oRowObj.sPath, oRowData);
            });

            //Save As Draft
            CG.oControllerInstance.saveShapes('D');



        },

        copyCOValues: function () {

            MessageBox.warning("Do you want to proceed with copying all values of AQID, Program to CO AQID, CO Prgm respectively. This action can't be undone.", {
                title: "Copy Over AQID and Program",
                actions: ["Apply", "Cancel"],
                emphasizedAction: "Apply",
                onClose: (sAction) => {
                    if (sAction === 'Apply') {
                        const aTabData = Base.appClientModel.getProperty('/UiRFIDPoints');


                        let uData = aTabData.map(rec => {
                            rec.CarryOverAqid = rec.Aqid;
                            rec.CarryOverOldProgram = rec.Program;

                            return rec;
                        });

                        Base.appClientModel.setProperty('/UiRFIDPoints', uData);

                        sap.m.MessageToast.show("Records Copy Over successful");

                    }
                }
            })



        },


        closeUpdateChange: function () {
            if (this._diaMassUpdate) {
                this._diaMassUpdate.then(function (oDialog) {
                    oDialog.close();
                })
            }
        },

        clearRfidFilter: function () {
            this.getViewUI('tabSmartRFID').applyVariant({});

        },

        toggleLock: function (oEvent, sNavBack,lockFlag) {
            let toLock;
            let uiControl = this.getViewUI('switchViewMode');
            if(!lockFlag){
            if (oEvent) {
                toLock = !(oEvent.getParameters().state);
                uiControl.setState(toLock); //by default keep the original state, until the ajax call is completed
            } else {
                toLock = false;

            }
        }else{
            toLock = true;
        }
            const isMock = Base.appClientModel.getProperty('/IsMock');
            const oHdata = Base.appClientModel.getProperty('/ContainerAnnotate');

            if (!oHdata) {
                return;
            }

            const oReqData = JSON.stringify({
                "request": {
                    "CM": oHdata.CM,
                    "Site": oHdata.Site,
                    "Floor": oHdata.Floor,
                    "Building": oHdata.Building,
                    "Status": (lockFlag) ? "PUBLISH" : oHdata.Status,
                    "Lock": toLock
                }
            });
            if (!isMock) {
                $.ajax({
                    method: "POST",
                    url: `${Base.sRelativePath}/locking`,
                    headers: {
                        "appid": Base.sAuthAppID,
                        "Content-Type": "application/json"
                    },
                    data: oReqData,
                    success: () => {
                        Base.appClientModel.setProperty("/lockText","");
                        if (!sNavBack) {
                            uiControl.setState(!toLock)
                            this.toggleViewMode();
                        }
                    },
                    error: (err) => {
                        if (!sNavBack) {
                            uiControl.setState(toLock);
                            Base.appClientModel.setProperty("/lockText",`${err.responseJSON.error.message.value}.Please refresh the page`);
                            MessageBox.error(`${err.responseJSON.error.message.value}`, {
                                title: "Validation Error",
                                onClose: function (oAction) { 
                                    CNV.toMainScreen(lockFlag,this)
                                }.bind(this)
                            });
                        }

                        
                    }
                });
            } else {
                uiControl.setState(!toLock)
                this.toggleViewMode();

            }
        },
        beforeExportData: function (oEvent) {
            const uiTable = oEvent.getSource().getTable();
            let selItems = uiTable.getSelectedIndices();
            const fItems = uiTable.getBinding("rows").getContexts();
            let fData = [];

            if (selItems.length > 0) {
                fData = selItems.map(rec => {
                    return fItems[rec].getObject();
                })
            } else {
                fData = fItems.map(rec => {
                    return rec.getObject()
                });
            }
            oEvent.getParameters().exportSettings.dataSource.data = fData;

        },

        initialSmartRFID: function (oEvent) {
            const oTableCols = oEvent.getSource().getTable().getColumns();
            const custCols = ['Rfid', 'CarryOverAqid', 'CarryOverOldProgram', 'Override_LineId', 'LineType',"Line_Priority", 'Uph', 'Comments'];

            for (let col of oTableCols) {
                if (custCols.includes(col.mProperties.filterProperty)) {
                    continue;
                }
                let nPath = `Drawings>${col.mProperties.filterProperty}`;
                col.getTemplate().getBindingInfo('text').parts[0].path = nPath;
            }
        },

        closeShapeTable: function(oEvent){
            let visFlag = this.getView().byId("shapeTable").getVisible();
            if(visFlag){
                oEvent.getSource().setIcon("sap-icon://navigation-left-arrow");
                this.getView().byId("canvaLayout").setSize("100%");
                this.getView().byId("tableLayout").setSize("0%");
                $("#divWrapper").height("100vh");
                this.getView().byId("splitterAnnotation").removeStyleClass("noHeightSplitter");
            }else{
                oEvent.getSource().setIcon("sap-icon://navigation-right-arrow");
                this.getView().byId("canvaLayout").setSize("70%");
                this.getView().byId("tableLayout").setSize("30%");
                $("#divWrapper").height("56vh");
                this.getView().byId("splitterAnnotation").addStyleClass("noHeightSplitter");
            }
            this.getView().byId("shapeTable").setVisible(!visFlag);
            this.getView().byId("tabSmartRFID").setVisible(!visFlag);
        },

        
        noAssetDialogClose: function(oEvent){
        this._noAssetLogsPopover.close();
        },

        proceedToPublish: function(oEvent){
            this.getView().byId("btnPublish").firePress({fromPopUp: true});
            this._noAssetLogsPopover.close();
        }

    });
});
