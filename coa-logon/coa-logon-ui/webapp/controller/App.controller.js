sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("logon.coalogonui.controller.App", {
        onInit() {
            window.close();
        }
      });
    }
  );
  