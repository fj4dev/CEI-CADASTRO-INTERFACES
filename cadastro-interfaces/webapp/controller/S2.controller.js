sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
	"sap/m/DialogType",
    "sap/ui/core/Fragment", 
    "sap/ui/model/Filter", 
	"sap/ui/model/FilterOperator",
    "sap/m/Token",
	"sap/m/SearchField",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
            Controller,
            Dialog,
            DialogType,
            Fragment,
            Filter,
            FilterOperator,
            Token,
            SearchField,
            MessageBox,
            History

        ) {
        "use strict";

        return Controller.extend("yellow.com.cadastrointerfaces.controller.S2", {
            onInit: function () {

                this._oRouter = this.getOwnerComponent().getRouter();

				// @type sap.ui.core.routing.Route
				var oRoute = this._oRouter.getRoute("DetalheInterface");
				oRoute.attachPatternMatched(this.onCallDetail, this);
                
            },
            onCallDetail: function (oEvent) {

                const sPath = "/" + oEvent.getParameters().arguments.sId;
                let oView = this.getView();
                let oModel = oView.getModel();
                oModel.metadataLoaded().then(  ()=> {

                    this.getView().bindElement({
                        path: sPath,
                        events: {
                            change:function(oEvent){
                                
                            },
                            dataRequested: function() {
                                oView.setBusy(true);
                            },
                            dataReceived: function(oData) {
                                oView.setBusy(false);
                            }
                        }
                    });

			    });
            },

            onPressEditButton: function(oEvent) {
                
                // @type sap.m.routing.Router
                let oRouter = this.getOwnerComponent().getRouter(); 
                oRouter.navTo("DetalheInterfaceEdit", { sId: this._CreateKey(oEvent) } );

            },

            _CreateKey: function(oEvent) {

                const oContext = this.getView().getBindingContext();
			    const sPath = oContext.getPath();
			    const oLine = oContext.getModel().getProperty(sPath);

                return this.getView().getModel().createKey("InterfaceSet",{
                    CompanyCode: oLine.CompanyCode,
                    IntId: oLine.IntId
                });
            },

            onPressExibirRfc: function(oEvent) {

                 // @type sap.m.routing.Router
                 let oRouter = this.getOwnerComponent().getRouter(); 
                 oRouter.navTo("DetalheRfc", { sId: this._CreateKey(oEvent) } );
                
            },

            onNavBack: function(oEvent) {
                var sPreviousHash = History.getInstance().getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.back();
                } else {
                    // Pressiona botão NavBack do shell
                    sap.ui.getCore().byId("backBtn").firePress();
                }
            },

            onPressEditSftp: function(oEvent) {

                const sPath = oEvent.getSource().getBindingContext().getPath(); 
                const oIntData = this.getView().getModel().getProperty(sPath);
                const sBaseUrl = window.location.origin;
                const sPathName = window.location.pathname;
                const sHash = `#interfaceSFTP-display&/Id/InterfacesViewSet(CompanyCode='${oIntData.CompanyCode}',IntId='IntId='${oIntData.IntId}')`;
                const url = sBaseUrl + sPathName + sHash;
                window.open(url, '_blank');


            }
           
        });
    });
