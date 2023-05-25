sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
	"sap/m/DialogType",
    "sap/ui/core/Fragment", 
    "sap/ui/model/Filter", 
	"sap/ui/model/FilterOperator",
    "sap/m/Token",
	"sap/m/SearchField",
    "sap/m/MessageBox"
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
            MessageBox

        ) {
        "use strict";

        return Controller.extend("yellow.com.cadastrointerfaces.controller.S1", {
            onInit: function () {
                
                this._oRouter = this.getOwnerComponent().getRouter();

				// @type sap.ui.core.routing.Route
				var oRoute = this._oRouter.getRoute("home");
				oRoute.attachPatternMatched(this.onCallHome, this);

            },

            IsQualityEnv: function() {
                return window.location.hostname === 'vm04.4hub.cloud' ? true : false;
            },

            onCallHome: function (oEvent) {

                let oModel = this.getView().getModel();

                oModel.metadataLoaded()
                .then((data) => {

                    //Esconder elementos em PRD
                    //this.getView().byId("IdCreateButton").setVisible(this.IsQualityEnv());

                });

            },

            onReset: function(oEvent) {

                this.getView().byId("ComboBoxCompany").setValue("");
                this.getView().byId("InputValueHelpInterface").setValue("");

                let oView = this.getView();

                this.getView().byId("TableInterfaces").bindElement({
                    path: "/InterfaceSet",
                    events: {
                        change:function(oEvent){
                        },
                        dataRequested: (oEvent)=> {
                            oView.setBusy(true);
                        },
                        dataReceived: (oData) =>{
                            oView.setBusy(false);
                        }
                    }
                });
                                
            },

            onSearch: function(oEvent) {

                let aFilters = [];
                 const sCompanyCode = this.getView().byId("ComboBoxCompany").getSelectedKey();
                const sInterfaceId= this.getView().byId("InputValueHelpInterface").getValue();
                const sInterfaceName= this.getView().byId("InputItemInterfaceIntfName").getValue();
                const sRfcCliente= this.getView().byId("InputemInterfaceRfcCliente").getValue();

                aFilters.push(new Filter({
                    path: "CompanyCode",
                    operator: FilterOperator.EQ,
                    value1: sCompanyCode
                }));

                aFilters.push(new Filter({
                    path: "IntId",
                    operator: FilterOperator.EQ,
                    value1: sInterfaceId
                }));

                aFilters.push(new Filter({
                    path: "IntName",
                    operator: FilterOperator.EQ,
                    value1: sInterfaceName
                }));

                aFilters.push(new Filter({
                    path: "RfcExt",
                    operator: FilterOperator.EQ,
                    value1: sRfcCliente
                }));

                let oList = this.getView().byId("TableInterfaces");
                let oBinding = oList.getBinding("items");

                oBinding.filter(aFilters);
                this.getView().getModel().refresh(true);
                
            },

            openInterfaceVH: function(oEvent) {
                
                let sPath = jQuery.sap.getModulePath("yellow.com.cadastrointerfaces", "/model/vh/Interface.json");
                let oColModel = new sap.ui.model.json.JSONModel(sPath);
                let aCols = oColModel.getData().cols;
                let oFilter = {};
                let oModel = this.getView().getModel();


                Fragment.load({
					name: "yellow.com.cadastrointerfaces.view.fragments.InterfaceFilter",
					controller: this })
                .then(function (oFragment) {

                    this._oValueHelpDialog = oFragment;
					this.getView().addDependent(this._oValueHelpDialog);
                    let oFilterBar = this._oValueHelpDialog.getFilterBar();
					oFilterBar.setFilterBarExpanded(true);

                    this._oValueHelpDialog.getTableAsync().then(function(oTable) {

                        oTable.setModel(oModel);
						oTable.setModel(oColModel, "columns");
						oTable.setProperty("enableBusyIndicator", true);

                        if (oTable.bindRows) {
							oTable.bindAggregation("rows", {
								path: '/InterfaceVHSet',
								filters: oFilter
							});
						}

                        if (oTable.bindItems) {
							oTable.bindAggregation("items", {
								path: '/InterfaceVHSet',
								filters: oFilter
							}, function () {
								return new ColumnListItem({
									cells: aCols.map(function (column) {
										return new Label({
											text: "{" + column.template + "}"
										});
									})
								});
							});
						}
                        this._oValueHelpDialog.update();
                    }.bind(this));
                    this._oValueHelpDialog.open();
                }.bind(this));
            },

            onFilterBarSearch: function (e) {
                var aSelectionSet = e.getParameter("selectionSet");
    
                var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                    if (oControl.getValue()) {
                        aResult.push(new Filter({
                            path: oControl.getName(),
                            operator: FilterOperator.EQ,
                            value1: oControl.getValue()
                        }));
                    }
                    return aResult;
                }, []);
    
                this._filterTable(aFilters);
            },
    
            _filterTable: function (aFilters) {
                var oValueHelpDialog = this._oValueHelpDialog;
    
                oValueHelpDialog.getTableAsync().then(function (oTable) {
                    if (oTable.bindRows) {
                        oTable.getBinding("rows").filter(aFilters);
                    }
    
                    if (oTable.bindItems) {
                        oTable.getBinding("items").filter(aFilters);
                    }
                    oValueHelpDialog.update();
                });
            },
            onValueHelpOkPress: function (oEvent) {
                
                const sTokenText = oEvent.getParameter("tokens")[0].getProperty("text");
                const regex = /(\w+)\s*\((\d+)\)/;
                const matches = sTokenText.match(regex);
                const sCompanyCode = matches[1];    
                const sIntId = matches[2];   
                const sPath = this.getView().getModel().createKey("/InterfaceSet",{
                    CompanyCode: sCompanyCode,
                    IntId: sIntId
                });

                const oInterface = this.getView().getModel().getProperty(sPath);


                var aFilters = [];
                aFilters.push(new Filter({
                    path: "CompanyCode",
                    operator: FilterOperator.EQ,
                    value1: sCompanyCode
                }));

                aFilters.push(new Filter({
                    path: "IntId",
                    operator: FilterOperator.EQ,
                    value1: sIntId
                }));

                let oList = this.getView().byId("TableInterfaces");
                let oBinding = oList.getBinding("items");

                oBinding.filter(aFilters);
                this.getView().getModel().refresh(true);
                this.getView().byId("InputValueHelpInterface").setValue(sIntId);
                this.getView().byId("ComboBoxCompany").setSelectedKey(sCompanyCode);
              
                this._oValueHelpDialog.destroy();
            },

            onValueHelpCancelPress: function(oEvent) {
                this._oValueHelpDialog.destroy();
            },

            onValueHelpAfterClose: function(oEvent) {
                this._oValueHelpDialog.destroy();
            },

            onItemPress: function(oEvent) {

                // @type sap.m.routing.Router
                let oRouter = this.getOwnerComponent().getRouter(); 
                oRouter.navTo("DetalheInterface", { sId: this._CreateKey(oEvent) } );

                
            },

            environmentVisibility: function(oEvent) {

                return window.location.hostname === 'https://vm04.4hub.cloud:44303' ? true : false;

            },

            onChangeCompany: function(oEvent) {

                let oDummy = {};
                this.onSearch(oDummy);
            },

            _CreateKey: function(oEvent) {

                const sPath = oEvent.getParameters().listItem.getBindingContextPath();
			    const oLine = this.getView().getModel().getData(sPath);

                return this.getView().getModel().createKey("InterfaceSet",{
                    CompanyCode: oLine.CompanyCode,
                    IntId: oLine.IntId
                });

            },

            onPressCreate: function(oEvent) {

                // @type sap.m.routing.Router
                let oRouter = this.getOwnerComponent().getRouter(); 
                oRouter.navTo("CreateInterface");
                             
            },

            onEnterFilterField: function(oEvent) {

                const oDummy = {};
                this.onSearch(oDummy);
                
            }
        });
    });
