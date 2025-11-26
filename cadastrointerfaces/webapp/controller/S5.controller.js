sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/MessageBox",
    "sap/m/MessageToast",
	"sap/m/Button",
    "sap/m/ButtonType",
    "sap/ui/core/routing/History"
	
], function(
			Controller,
			Filter,
			FilterOperator,
			JSONModel,
			Dialog,
			DialogType,
			MessageBox,
			MessageToast,
			Button,
			ButtonType,
			History
			) {
	"use strict";

	return Controller.extend("yellow.com.cadastrointerfaces.controller.S5", {

		onInit: function () {

			this._oRouter = this.getOwnerComponent().getRouter();

			// @type sap.ui.core.routing.Route
			var oRoute = this._oRouter.getRoute("DetalheRfc");
			oRoute.attachPatternMatched(this.onCallRfcDisplay, this);
			
		},

		onCallRfcDisplay: function(oEvent) {

			this.ViewId = oEvent.getParameters().arguments.sId;

			
			const sPath = '/' + this.ViewId;
			const oModel = this.getView().getModel();		
			oModel.metadataLoaded().then(  ()=> {	

				//Esconder elementos em PRD
				this.getView().byId("ButtonImportar").setVisible(this.IsQualityEnv());
				this.DisplayTableTree(sPath);

			});
		},

		DisplayTableTree: function(sPath) {

			const oModel = this.getView().getModel();	
			this.getView().byId("oh1").bindElement(sPath);

			this.getView().setBusy(true);
			oModel.read("/RfcDetailSet", {
				filters: this.getFilterInterface(sPath),
				success: (oData, res) => {	

					let oTree = { type: []};
					const aImporting = oData.results.filter((oResult)=>{ return oResult.Paramtype === 'I' });
					if(aImporting.length > 0){
						oTree.type.push({
							name: 'Import',
							type: this._getDataParameters(aImporting)
						});
					}

					const exporting = oData.results.filter((oResult)=>{ return oResult.Paramtype === 'E' });
					if(exporting.length > 0){
						oTree.type.push({
							name: 'Export',
							type: this._getDataParameters(exporting)
						});
					}

					const changing = oData.results.filter((oResult)=>{ return oResult.Paramtype === 'C' });
					if(changing.length > 0){
						oTree.type.push({
							name: 'Chaging',
							type: this._getDataParameters(changing)
						});
					}
					

					const tables = oData.results.filter((oResult)=>{ return oResult.Paramtype === 'T' });
					if(tables.length > 0){
						oTree.type.push({
							name: 'Tables',
							type: this._getDataParameters(tables)
						});
					}
					
					
					var oModel = new JSONModel(oTree);
					this.getView().setModel(oModel,"Tree");
					this.getView().setBusy(false);
					this.getView().byId("treeTable").setVisibleRowCount(oData.results.length);
					this.getView().setBusy(false);
				},
				error: (error) => {
					let oResp = JSON.parse(error.responseText);
					this.getView().byId("treeTable").setNoData(oResp.error.message.value);
					this.getView().setBusy(false);
				}
			});
			
		},

		_getDataParameters: function(aList) {

			let aParam = [];
			let aStructData = [];
			for (let oList of aList) {

				aStructData = [];
				// Verifica se o campo pertence a uma estrutura
				if(oList.FieldFromStruc){
					continue;
				}

				// Se for uma estrucura recupera os campos 
				if(oList.StrucTypename){

					const aStruct = aList.filter((oImport)=>{ 
						return ( ( oImport.StrucTypename === oList.StrucTypename ) && 
								 ( oImport.FieldTypename !== oImport.StrucTypename) &&
								 ( oImport.FieldTypename !== oImport.TableTypename));
					});

					const aStructFields = aStruct.map((oStruct)=>{ 
						return {
							name: oStruct.Parameter,
							typing: oStruct.Typing,
							fieldType: oStruct.FieldTypename
						} 
					});

					// se for uma table type, preenche o tipo com os campos
					if (oList.TableTypename){

						aStructData.push({
							name: oList.TableTypename,
							typing: 'TYPE TABLE OF',
							fieldType: oList.StrucTypename,
							type: aStructFields
						});

						aParam.push({
							name: oList.Parameter,
							typing: oList.Typing,
							fieldType: oList.TableTypename,
							type: aStructData
						});

						continue;
					} else{

						// preenche com os campos da estrutura
						aParam.push({
							name: oList.Parameter,
							typing: oList.Typing,
							fieldType: oList.StrucTypename,
							type: aStructFields
						});

						continue;
					}

				} 

				// Pamâmetro simples
				aParam.push({
					name: oList.Parameter,
					typing: oList.Typing,
					fieldType: oList.FieldTypename
				});

			}

			return aParam;
			
		},

		getFilterInterface: function(sPath) {

			const regex = /CompanyCode='(\w+)',IntId='(\w+)'/;
			const [, CompanyCode, IntId] = sPath.match(regex);
			const aFilters = [];

			let oQuery = new Filter({
				path: "CompanyCode",
				operator: FilterOperator.EQ,
				value1: CompanyCode
			});
			
			aFilters.push(oQuery);

			oQuery = new Filter({
				path: "IntId",
				operator: FilterOperator.EQ,
				value1: IntId
			});
			
			aFilters.push(oQuery);
			
			return aFilters;
		
		},

		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.back();
                } else {
                    // Pressiona botão NavBack do shell
                    sap.ui.getCore().byId("backBtn").firePress();
                }
		},

		IsQualityEnv: function() {
			return window.location.hostname === 'vm04.4hub.cloud' ? true : false;
		},

		onPressButtonImportar: function(oEvent) {
			
			const sPath = '/' + this.ViewId;

			this.ImportarNovamente = new Dialog({
				type: sap.m.DialogType.Message,
				title: "Importar RFC",
				content: new sap.m.Text({
					text: "Deseja Realmente reimportar os parâmetros da RFC? Esta ação irá substituir os valores atuais."
				}),
				beginButton: new sap.m.Button({
					type: sap.m.ButtonType.Emphasized,
					text: "Confirmar",
					press: function () {

						this._ReimportarDadosRFC(sPath);
						this.ImportarNovamente.close();
						this.ImportarNovamente.destroy();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancelar",
					press: function () {
						this.ImportarNovamente.close();
						this.ImportarNovamente.destroy();
					}.bind(this)
				})
			});

			this.ImportarNovamente.open();

		},

		_ReimportarDadosRFC: function(sPath) {
			
			const oLine = this.getView().getModel().getProperty(sPath);
			const sPathRfc = this.getView().getModel().createKey("/RfcDetailSet",{
				CompanyCode: oLine.CompanyCode, 
				IntId: oLine.IntId
			});

			const mParameters = {
				groupId: "updateChanges",
				success: (odata, resp) => {
					
					this.oSuccessMessageDialog = new Dialog({
						type: DialogType.Message,
						title: "Success",
						state: "Success",
						content: new sap.m.Text({ text: "Dados da RFC foram atualizados com sucesso!" }),
						beginButton: new sap.m.Button({
							type: sap.m.ButtonType.Emphasized,
							text: "OK",
							press: function () {
								this.DisplayTableTree(sPath);
								this.oSuccessMessageDialog.close();
								this.oSuccessMessageDialog.destroy();
							}.bind(this)
						})
					});

					this.getView().setBusy(false);
					this.oSuccessMessageDialog.open();                       
					
				},

				error: (err) => {
					this.getView().setBusy(false);
					MessageBox.error(err.message);
				}
			};

			//Payload vazio, irá reimportar tudo de qualquer modo
			const oPayload = { Paramtype: ""};

			this.getView().setBusy(true);
			// update RfcDetailSet
			this.getView().getModel().update(sPathRfc,oPayload, mParameters);

		}

	});
});