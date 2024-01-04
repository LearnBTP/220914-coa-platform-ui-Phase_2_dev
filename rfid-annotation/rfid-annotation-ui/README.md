## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Wed Jul 27 2022 18:29:37 GMT+0000 (Coordinated Universal Time)|
|**App Generator**<br>@sap/generator-fiori-freestyle|
|**App Generator Version**<br>1.6.7|
|**Generation Platform**<br>SAP Business Application Studio|
|**Floorplan Used**<br>simple|
|**Service Type**<br>None|
|**Service URL**<br>N/A
|**Module Name**<br>rfid-annotation-ui|
|**Application Title**<br>App Title|
|**Namespace**<br>coa.annotation|
|**UI5 Theme**<br>sap_fiori_3|
|**UI5 Version**<br>1.102.1|
|**Enable Code Assist Libraries**<br>False|
|**Add Eslint configuration**<br>False|

## rfid-annotation-ui

Annotations

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  In order to launch the generated app, simply run the following from the generated app root folder:

```
    npm start
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)

   {
      /**
                 * 
                         _threshholdCheck(a, b) {

            var diff = Math.abs(a) - Math.abs(b);

            return diff > -10 && diff < 10 ? true : false;
        },
                
                                //Check if all lines are connected to for a shape
                                var bothPointsOfLineAreConnected = 0;
                                for (var c = 0; c < CG.polygonVertices.length; c++) {
                                    var selectedLine = CG.polygonVertices[c];
                                    var remainingLines = JSON.parse(JSON.stringify(CG.polygonVertices));
                                    remainingLines.splice(c, 1);
                
                                    if (remainingLines.length > 1) {
                                        //Direction 1
                                        var pointA = remainingLines.some(currentLine => {
                                            return ((this._threshholdCheck(selectedLine.LX, currentLine.LX) && this._threshholdCheck(selectedLine.LY, currentLine.LY)) ||
                                                (this._threshholdCheck(selectedLine.LX, currentLine.EX) && this._threshholdCheck(selectedLine.LY, currentLine.EY)))
                
                                        });
                
                                        //Direction 2
                                        var pointB = remainingLines.some(currentLine => {
                                            return ((this._threshholdCheck(selectedLine.EX, currentLine.LX) && this._threshholdCheck(selectedLine.EY, currentLine.LY)) ||
                                                (this._threshholdCheck(selectedLine.EX, currentLine.EX) && this._threshholdCheck(selectedLine.EY, currentLine.EY)))
                                        });
                                        if (pointA && pointB) {
                                            bothPointsOfLineAreConnected++;
                                        } else {
                                            //Lines have missing connections. Therefore it doesn't form a shape.
                                            break;
                                        }
                                    }
                                }
                
                                //Shape is complete 
                                if (bothPointsOfLineAreConnected === CG.polygonVertices.length) {
                
                                    let finalPolyDrawing = {
                                        Shape_Vertices: JSON.parse(JSON.stringify(CG.polygonVertices)),
                                        Shape_Guid: this.createUUID(),
                                        Shape_Color: CG.drawingColor,
                                        Shape_Type: CG.drawingShape
                                    };
                
                                    CG.Shapes.unshift(finalPolyDrawing);
                                    this.UpdateUITables(CG.Shapes);
                
                                    //Clear temp variables
                                    CG.polygonVertices = [];
                                    CG.LineTempShapes = [];
                                }
                // */}

/**
 *
 *  /**
* Draft -> Publish
Delete all Draft records + Check if any Published already exist => If exist then Update Publish record (OR) if NOT exist => Create Publish Record
* Publish -> Draft
Delete all Draft records + Create New Draft records
* Publish -> Publish
Update Change records
* Draft -> Draft
Update Changed records
*/


            // sap.ui.core.BusyIndicator.show(0);

            // if (CG.bCreateDraftFromPublishPressed) {
            //     mode = 'C';
            // }

            // let counterCreate = 0, counterUpdate = 0, counterDelete = 0;
            // let headerData = Base.appClientModel.getProperty('/ContainerAnnotate');
            // let allRfidData = Base.appClientModel.getProperty('/ContainerRFIDPoints');

            // let shapesData = Base.appClientModel.getProperty('/UiShapes');
            // let rfidDataUI = Base.appClientModel.getProperty('/UiRFIDPoints');

            // if (shapesData.length === 0) { return; }

            // var sNewStatus = (mode === 'P') ? 'PUBLISH' : 'DRAFT';
            // var sGroupAction = (mode === 'P') ? 'ACT_PUBLISH' : 'ACT_DRAFT';

            // let bPublishedRecordExist = false;

            // if (mode === 'P') {
            //     bPublishedRecordExist = await new Promise((resolve, rej) => {
            //         Base.appODataModel.read('/HeaderAnnotation/$count', {
            //             filters: [
            //                 new Filter('Building', sap.ui.model.FilterOperator.EQ, headerData.Building),
            //                 new Filter('Site', sap.ui.model.FilterOperator.EQ, headerData.Site),
            //                 new Filter('Floor', sap.ui.model.FilterOperator.EQ, headerData.Floor),
            //                 new Filter('CM', sap.ui.model.FilterOperator.EQ, headerData.CM),
            //                 new Filter('Status', sap.ui.model.FilterOperator.EQ, headerData.Status)
            //             ],
            //             success: (result) => {
            //                 (Number(result) > 0) ? resolve(true) : resolve(false)
            //             }
            //         });


            //     });
            // }


            // //Common Key fields for all tables
            // var headObj = {
            //     Floor: headerData.Floor,
            //     Site: headerData.Site,
            //     CM: headerData.CM,
            //     Building: headerData.Building,
            //     Status: sNewStatus//headerData.Status
            // };
            // var queryParamerters = `Floor='${headObj.Floor}',Site='${headObj.Site}',CM='${headObj.CM}',Building='${headObj.Building}'`;

            // // Base.appODataModel.setDeferredGroups(['SHAPES', 'RFID_SHAPES']);

            // /**
            //  * HEADER
            //  */

            // if (mode === 'P') {
            //     Base.appODataModel.setDeferredGroups(['ACT_PUBLISH']);

            //     //Create Header Records
            //     var otherHeaderObj = {
            //         Image_FileId: headerData.Image_FileId,
            //         Alderaan_Site: headerData.Alderaan_Site,
            //         Alderaan_CM: headerData.Alderaan_CM,
            //         Scan_Start_Date: headerData.Scan_Start_Date,
            //         Scan_End_Date: headerData.Scan_End_Date,
            //         Area: headerData.Area,
            //         Image_FileName: headerData.Image_FileName,
            //         Origin_X: headerData.Origin_X,
            //         Origin_Y: headerData.Origin_Y,
            //         Scale_X: headerData.Scale_X,
            //         Scale_Y: headerData.Scale_Y,
            //         Orientation_X: headerData.Orientation_X,
            //         Orientation_Y: headerData.Orientation_Y,
            //         Line: headerData.Line
            //     };

            //     let headerQuery = `(${queryParamerters},Status='DRAFT')`;
            //     //remove all Draft records
            //     Base.appODataModel.remove(`/T_COA_3DV_HEADER${headerQuery}`, {
            //         groupId: 'ACT_PUBLISH',
            //         changeSetId: 'PUBLISH_MODE'
            //     });

            //     if (bPublishedRecordExist) {
            //         headerQuery = `(${queryParamerters},Status='PUBLISH')`;
            //         Base.appODataModel.update(`/T_COA_3DV_HEADER${headerQuery}`, otherHeaderObj, {
            //             groupId: 'ACT_PUBLISH',
            //             changeSetId: 'PUBLISH_MODE'
            //         });
            //     } else {
            //         otherHeaderObj = {
            //             ...headObj,
            //             ...otherHeaderObj
            //         }
            //         Base.appODataModel.create('/T_COA_3DV_HEADER', otherHeaderObj, {
            //             groupId: 'ACT_PUBLISH',
            //             changeSetId: 'PUBLISH_MODE'
            //         });
            //     }




            // } else if (mode === 'D') {
            //     //Do Nothing
            //     Base.appODataModel.setDeferredGroups(['ACT_DRAFT']);
            // }

            // /**
            //  * SHAPES & SHAPE VERTICES
            //  */


            // for (var s = 0; s < shapesData.length; s++) {
            //     var rec = shapesData[s];
            //     //Delete the Shapes irrespective of mod
            //     let shapeBody = {
            //         Shape_Color: rec.Shape_Color,
            //         Shape_Type: rec.Shape_Type,
            //         Shape_Name: rec.Shape_Name,
            //         LineId: rec.LineId,
            //         LineType: rec.LineType,
            //         Uph: Number(rec.Uph),
            //         Shape_Vertices: {
            //             results: rec.Shape_Vertices.results.map(points => {
            //                 return {
            //                     Vertices_X: points.Vertices_X,
            //                     Vertices_Y: points.Vertices_Y,
            //                     Sequence_No: points.Sequence_No,
            //                     Shape_Guid: rec.Shape_Guid,
            //                     Status: sNewStatus
            //                 }
            //             })
            //         }
            //     };


            //     //Create Published records and Delete Draft records
            //     let shapeQuery = `(${queryParamerters},Status='DRAFT',Shape_Guid='${rec.Shape_Guid}')`;
            //     if (mode === 'P') {
            //         Base.appODataModel.remove(`/GetShapes${shapeQuery}`, {
            //             groupId: 'ACT_PUBLISH',
            //             changeSetId: 'PUBLISH_MODE'
            //         });

            //         if ((rec.isNew || rec.isUpd) && rec.toDel === false) {
            //             if (bPublishedRecordExist) {
            //                 shapeQuery = `(${queryParamerters},Status='PUBLISH',Shape_Guid='${rec.Shape_Guid}')`;
            //                 Base.appODataModel.update(`/GetShapes${shapeQuery}`, shapeBody, {
            //                     groupId: 'ACT_PUBLISH',
            //                     changeSetId: 'PUBLISH_MODE'
            //                 });
            //                 counterUpdate++;
            //                 continue;
            //             } else {
            //                 shapeBody = {
            //                     Shape_Guid: rec.Shape_Guid,
            //                     ...headObj,
            //                     ...shapeBody
            //                 };
            //                 Base.appODataModel.create('/GetShapes', shapeBody, {
            //                     groupId: 'ACT_PUBLISH',
            //                     changeSetId: 'PUBLISH_MODE'
            //                 });
            //                 counterCreate++;
            //                 continue;
            //             }

            //         }
            //     } else if (mode === 'D') {
            //         if (rec.isNew === true && rec.toDel === false) {
            //             counterCreate++;
            //             shapeBody = {
            //                 Shape_Guid: rec.Shape_Guid,
            //                 ...headObj,
            //                 ...shapeBody
            //             };
            //             Base.appODataModel.create('/GetShapes', shapeBody, {
            //                 groupId: 'ACT_DRAFT',
            //                 changeSetId: 'DRAFT_MODE'
            //             });
            //             continue;
            //         } else if (rec.toDel === true && rec.isNew === false) {
            //             counterDelete++;
            //             Base.appODataModel.remove(`/GetShapes${shapeQuery}`, {
            //                 groupId: 'ACT_DRAFT',
            //                 changeSetId: 'DRAFT_MODE'
            //             });
            //             continue;
            //         } else if (rec.toUpd === true && rec.isNew === false) {
            //             counterUpdate++;
            //             delete shapeBody.Shape_Vertices;
            //             Base.appODataModel.update(`/GetShapes${shapeQuery}`, shapeBody, {
            //                 groupId: 'ACT_DRAFT',
            //                 changeSetId: 'DRAFT_MODE'
            //             });
            //             continue;
            //         }

            //     }
            //    
            //     
            //      */
