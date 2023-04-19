sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
	"sap/m/DialogType",
    "sap/ui/core/Fragment", 
    "sap/ui/model/Filter", 
	"sap/ui/model/FilterOperator",
    "sap/m/Token",
    "sap/m/Button",
    "sap/m/ButtonType",
	"sap/m/SearchField",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
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
            Button,
            ButtonType,
            SearchField,
            MessageBox,
            MessageToast,
            History

        ) {
        "use strict";

        return Controller.extend("yellow.com.cadastrointerfaces.controller.S3", {
            onInit: function () {

                this._oRouter = this.getOwnerComponent().getRouter();

				// @type sap.ui.core.routing.Route
				var oRoute = this._oRouter.getRoute("DetalheInterfaceEdit");
				oRoute.attachPatternMatched(this.onCallEdit, this);
                
            },

            onCallEdit: function (oEvent) {

                this.ViewId = oEvent.getParameters().arguments.sId;
                const sPath = "/" + this.ViewId;
                let oView = this.getView();
                let oModel = oView.getModel();
                
                oModel.metadataLoaded().then(  ()=> {

                    this.getView().bindElement({
                        path: sPath,
                        events: {
                            change:function(oEvent){
                                const oContext = oView.getBindingContext();
                                const sPath = oContext.getPath();
                                const oLine = oContext.getModel().getProperty(sPath);
                                oView.byId("ComboBoxOrigem").setSelectedKey(oLine.Origem);
                                oView.byId("ComboBoxDestino").setSelectedKey(oLine.Destino);
                            },
                            dataRequested: function() {
                                oView.setBusy(true);
                            },
                            dataReceived: (oData)=> {

                                oView.setBusy(false);
                                const oContext = this.getView().getBindingContext();
                                const sPath = oContext.getPath();
                                const oLine = oContext.getModel().getProperty(sPath);
                                this.getView().byId("ComboBoxOrigem").setSelectedKey(oLine.Origem);
                                this.getView().byId("ComboBoxDestino").setSelectedKey(oLine.Destino);

                            }
                        }
                    });

			    });
            },

            onPressReject: function(oEvent) {

                this.getView().unbindElement("");
			    this.getOwnerComponent().getRouter().navTo("DetalheInterface", {
                     sId: this.ViewId
                     });

                
            },

            onPressAcept: function(oEvent) {
                
                let that = this;
                this.oApproveDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Confirmação",
                    content: new sap.m.Text({ text: "Confirma alteração dos dados?" }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Confirmar",
                        press: function () {
                            that.AlterarDadosInterface();
                            this.oApproveDialog.close();
                            this.oApproveDialog.destroy();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        type: ButtonType.Ghost,
                        press: function () {
                            this.oApproveDialog.close();
                            this.oApproveDialog.destroy();
                        }.bind(this)
                    })
                });
    
                this.oApproveDialog.open();
                
            },

            AlterarDadosInterface: function() {

                const oContext = this.getView().getBindingContext();
			    const sPath = oContext.getPath();
			    const oLine = oContext.getModel().getProperty(sPath);
                const sIntLimiteTemp = this.getView().byId("IdTextLimiteTempoInterfaceCEI").getValue();
                const sArea = this.getView().byId("IdTextAreaInterfaceCEI").getValue();
                const sRfcExt = this.getView().byId("IdTextInterfaceCliente").getValue();
                const sEndpoint = this.getView().byId("IdTextEndpoint").getValue();
                const sOrigem= this.getView().byId("ComboBoxOrigem").getSelectedKey();
                const sDestino= this.getView().byId("ComboBoxDestino").getSelectedKey();
                const sProject= this.getView().byId("IdTextlProject").getValue();
                const sOauthUser= this.getView().byId("IdTextoAuthUser").getValue();
                const sPassword= this.getView().byId("IdTextoPassword").getValue();
                const sTokenUrl= this.getView().byId("IdTextoAuthLinkTokenCode").getText();
                const sOauthToken= this.getView().byId("IdTextoTokenCode").getValue();
                const sIntName= this.getView().byId("IdLabelTextInterfaceName").getValue();
                const sIntDesc= this.getView().byId("IdTextDescricaoInterface").getValue();

                const oPayload = {
                    IntLimiteTemp: sIntLimiteTemp,
                    IntfArea: sArea,
                    RfcExt: sRfcExt,
                    Origem: sOrigem,
                    Destino: sDestino,
                    Project: sProject,
                    OauthUser: sOauthUser,
                    Password: sPassword,
                    TokenUrl: sTokenUrl,
                    OauthToken: sOauthToken,
                    Endpoint: sEndpoint,
                    IntName: sIntName,
                    IntDesc: sIntDesc
                }

                const sPathToUpdate = this.getView().getModel().createKey("/InterfaceSet",{
                    CompanyCode: oLine.CompanyCode,
                    IntId: oLine.IntId
                });

                var mParameters = {
					groupId: "updateChanges",
					success: (odata, resp) => {
                        
                        this.oSuccessMessageDialog = new Dialog({
                            type: DialogType.Message,
                            title: "Success",
                            state: "Success",
                            content: new sap.m.Text({ text: "Dados atualizados com sucesso!" }),
                            beginButton: new Button({
                                type: ButtonType.Emphasized,
                                text: "OK",
                                press: function () {
                                    this.oSuccessMessageDialog.close();
                                    this.oSuccessMessageDialog.destroy();
                                    this.getView().unbindElement("");
                                    this.UpdateFormModel(oPayload,oLine);
                                    this.getOwnerComponent().getRouter().navTo("DetalheInterface", {
                                        sId: this.ViewId
                                    });
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

                this.getView().setBusy(true);
                this.getView().getModel().update(sPathToUpdate,oPayload,mParameters);
                
            },

            UpdateFormModel: function(oPayload, oLine) {

                oLine.IntLimiteTemp = oPayload.IntLimiteTemp;
                oLine.IntfArea = oPayload.IntfArea;
                oLine.RfcExt = oPayload.RfcExt; 
                oLine.Origem = oPayload.Origem; 
                oLine.Destino = oPayload.Destino; 
                oLine.Project = oPayload.Project; 
                oLine.OauthUser = oPayload.OauthUser; 
                oLine.Password = oPayload.Password; 
                oLine.TokenUrl = oPayload.TokenUrl;
                oLine.OauthToken = oPayload.OauthToken; 
                oLine.Endpoint = oPayload.Endpoint; 
                oLine.IntName = oPayload.IntName; 
                oLine.IntDesc = oPayload.IntDesc; 
                oLine.Payload =  this.getView().byId("idTextAreaPayload").getValue( );
                
            },

            onChangeLImiteTempo: function(oEvent) {

                const oContext = this.getView().getBindingContext();
			    const sPath = oContext.getPath();
			    const oLine = oContext.getModel().getProperty(sPath);
                const regex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
                const sNewValue = oEvent.getParameter("newValue");

                if (!regex.test(sNewValue)){

                    this.getView().byId("IdTextLimiteTempoInterfaceCEI").setValue(oLine.IntLimiteTemp);
                    this.getView().byId("IdTextLimiteTempoInterfaceCEI").setValueState("Error");
                    this.getView().byId("IdTextLimiteTempoInterfaceCEI").setValueStateText("Valor informado deve seguir o padrão 'hh:MM:ss'");
                } else {   

                    this.getView().byId("IdTextLimiteTempoInterfaceCEI").setValueState("Success");
                    this.getView().byId("IdTextLimiteTempoInterfaceCEI").setValueStateText("");

                };

            },

            onChangeInterfaceCliente: function(oEvent) {

                const sNewValue = oEvent.getParameter("newValue");
                const sDestination = this.getView().byId("IdTextDestlInterfaceCliente").getText();
                const oParameters = {
                    RfcExt: sNewValue,
                    Rfcdest: sDestination
                };

                this.getView().setBusy(true);

                this.getView().getModel().callFunction("/ConfirmarRfc", {
                    method: "GET",
                    urlParameters: oParameters,

                    success: (oData, res) => {

                        this.getView().setBusy(false);
                        if(oData.Type==="E") MessageBox.error(oData.Message);
                    },
                    error: (err) => {

                        MessageBox.information(err.message);
                        this.getView().setBusy(false);
                        
                    }
                });
                
            },

            onChangeOauthUser: function(oEvent) {

                const sProject= this.getView().byId("IdTextlProject").getValue();
                const sOauthUser= oEvent.getParameters().newValue;
                
                this._GetUrlToken(sProject,sOauthUser);
                
            },

            onChangeProject: function(oEvent) {

                const sProject= oEvent.getParameters().newValue;
                const sOauthUser= this.getView().byId("IdTextoAuthUser").getValue();

                this._GetUrlToken(sProject,sOauthUser);
                
            },

            _GetUrlToken: function(sProject,sOauthUser){
                
                const sPassword= this.getView().byId("IdTextoPassword").getValue();
                const oView = this.getView();
                const sPath = oView.getModel().createKey("/UrlTokenSet",{
                    Project : sProject,
                    OauthUser:  sOauthUser
                });

                  let mParameters = {
                    success: (oData, res) => {
                        
                        oView.byId("IdTextoAuthLinkTokenCode").setText(oData.TokenUrl);
                        oView.byId("IdTextoAuthLinkTokenCode").setHref(oData.TokenUrl);

                        // atualizar payload
                        this._getOauthPayload(sProject,sOauthUser,sPassword)
                        oView.setBusy(false);
                        
                    },
                    error: (err) => {

                        MessageBox.information(err.message);
                        oView.setBusy(false);
                    }
                }

                oView.setBusy(true);
                oView.getModel().read(sPath,mParameters);


            },

            _getOauthPayload: function(sProject, sOauthUser, sPassword) {
                
                const oView = this.getView();
                const sPath = oView.getModel().createKey("/OauthPayloadSet",{
                    Project : sProject,
                    OauthUser:  sOauthUser,
                    Password:  sPassword,
                });

                let mParameters = {
                    success: (oData, res) => {
                        
                        oView.byId("idTextAreaPayload").setValue(oData.Payload);
                        oView.setBusy(false);
                        
                    },
                    error: (err) => {

                        MessageBox.information(err.message);
                        oView.setBusy(false);
                    }
                }

                oView.setBusy(true);
                oView.getModel().read(sPath,mParameters);

            },

            onChangePassWord: function(oEvent) {

                const sPassWord= oEvent.getParameters().newValue;
                const sProject= this.getView().byId("IdTextlProject").getValue();
                const sOauthUser= this.getView().byId("IdTextoAuthUser").getValue();

                this._getOauthPayload(sProject,sOauthUser,sPassWord)

                
            },

            onNavBack: function(oEvent) {
                var sPreviousHash = History.getInstance().getPreviousHash();

                if (sPreviousHash !== undefined) {
                    window.history.back();
                } else {
                    this.getOwnerComponent().getRouter().navTo("DetalheInterface");
                }
            }

        });
    });
