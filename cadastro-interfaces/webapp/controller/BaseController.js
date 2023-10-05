sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/routing/History",
        "sap/ui/core/UIComponent",
        "yellow/com/cadastrointerfaces/model/formatter",
        "sap/ui/model/json/JSONModel",
        "yellow/com/cadastrointerfaces/model/odataAPI",
        "sap/ui/model/Filter",
		    "sap/ui/model/FilterOperator"
    ],
    function(
      Controller, 
      History, 
      UIComponent, 
      formatter, 
      JSONModel,
       odataAPI, 
       Filter, 
       FilterOperator
       ) {
      "use strict";
  
      return Controller.extend("yellow.com.cadastrointerfaces.controller.BaseController", {

        getOdataModel: function () {
          if (!this._odata) {
            this._odata = new odataAPI(this.getModel());
          }
          return this._odata;
        },

        getModel: function (sName) {
          return this.getView().getModel(sName);
        }
        
      });
    }
  );
  