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

        return Controller.extend("yellow.com.cadastrointerfaces.controller.S4", {
            onInit: function () {

                this._oRouter = this.getOwnerComponent().getRouter();

				// @type sap.ui.core.routing.Route
				var oRoute = this._oRouter.getRoute("CreateInterface");
				oRoute.attachPatternMatched(this.onCallCreate, this);
                
            },

            onCallCreate: function(oEvent){

                this.ViewId = "";
            },

            onPressReject: function(oEvent) {

                let that = this;
                this.oCancelarOperacao= new Dialog({
                    type: DialogType.Message,
                    title: "Cancelar",
                    content: new sap.m.Text({ text: "Deseja realmente sair? Os dados informados serão perdidos." }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Confirmar",
                        press: function () {
                            that.CancelarOperacao();
                            this.oCancelarOperacao.close();
                            this.oCancelarOperacao.destroy();
                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        type: ButtonType.Ghost,
                        press: function () {
                            this.oCancelarOperacao.close();
                            this.oCancelarOperacao.destroy();
                        }.bind(this)
                    })
                });
    
                this.oCancelarOperacao.open();               
            },

            CancelarOperacao: function(){

                this.getView().byId("ComboBoxCompany").setSelectedKey("");
                this.getView().byId("IdTextInterfaceCEI").setText("");
                this.getView().byId("IdTextDescricaoInterfaceCEI").setValue("");
                this.getView().byId("IdTextFGroupInterfaceCEI").setText("");
                this.getView().byId("IdTextFGroupDescrInterfaceCEI").setValue("");
                this.getView().byId("IdTextLimiteTempoInterfaceCEI").setValue("");
                this.getView().byId("IdTextAreaInterfaceCEI").setValue("");
                this.getView().byId("IdTextInterfaceCliente").setValue("");
                this.getView().byId("IdTextDestlInterfaceCliente").setText("");
                this.getView().byId("IdTextEndpoint").setValue("");


                this.getView().unbindElement("");
			    this.getOwnerComponent().getRouter().navTo("home");


            },

            onPressAccept: function(oEvent) {
                
                let that = this;
                this.oApproveDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Confirmação",
                    content: new sap.m.Text({ text: "Confirma alteração dos dados?" }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Confirmar",
                        press: function () {
                            that.CriarInterface();
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

            CriarInterface: function() {

                const sCompanyCode = this.getView().byId("ComboBoxCompany").getSelectedKey();
                const sIntName = this.getView().byId("IdInputNomeInterfaceCEI").getValue();
                const sIntDesc = this.getView().byId("IdInputDescInterfaceCEI").getValue();
                const sRfcInt = this.getView().byId("IdTextInterfaceCEI").getText();
                const sRfcDesc = this.getView().byId("IdTextDescricaoInterfaceCEI").getValue();
                const sRfcFgroup = this.getView().byId("IdTextFGroupInterfaceCEI").getText();
                const sRfcFgroupDesc = this.getView().byId("IdTextFGroupDescrInterfaceCEI").getValue();
                const sIntLimiteTemp = this.getView().byId("IdTextLimiteTempoInterfaceCEI").getValue();
                const sIntfArea = this.getView().byId("IdTextAreaInterfaceCEI").getValue();
                const sRfcdest = this.getView().byId("IdTextDestlInterfaceCliente").getText();
                const sRfcExt = this.getView().byId("IdTextInterfaceCliente").getValue();
                const sEndpoint = this.getView().byId("IdTextEndpoint").getValue();
                const sOrigem= this.getView().byId("ComboBoxOrigem").getSelectedKey();
                const sDestino= this.getView().byId("ComboBoxDestino").getSelectedKey();
                const sProject= this.getView().byId("IdTextlProject").getValue();
                const sOauthUser= this.getView().byId("IdTextoAuthUser").getValue();
                const sPassword= this.getView().byId("IdTextoPassword").getValue();
                const sTokenUrl= this.getView().byId("IdTextoAuthLinkTokenCode").getText();
                const sOauthToken= this.getView().byId("IdTextoTokenCode").getValue();

                
                const oPayload = {
                    CompanyCode : sCompanyCode,
                    IntName : sIntName,
                    IntDesc : sIntDesc,
                    RfcExt : sRfcExt,
                    RfcInt : sRfcInt,
                    RfcDesc : sRfcDesc,
                    RfcFgroup : sRfcFgroup,
                    RfcFgroupDesc: sRfcFgroupDesc,
                    IntLimiteTemp: sIntLimiteTemp,
                    IntfArea : sIntfArea,
                    Endpoint : sEndpoint,
                    Rfcdest : sRfcdest,
                    Origem: sOrigem,
                    Destino: sDestino,
                    Project: sProject,
                    OauthUser: sOauthUser,
                    Password: sPassword,
                    TokenUrl: sTokenUrl,
                    OauthToken: sOauthToken
                }

                var mParameters = {
					success: (odata, resp) => {
                        
                        this.oSuccessMessageDialog = new Dialog({
                            type: DialogType.Message,
                            title: "Success",
                            state: "Success",
                            content: new sap.m.Text({ text: "Interface Criada com sucesso!" }),
                            beginButton: new Button({
                                type: ButtonType.Emphasized,
                                text: "OK",
                                press: function () {
                                    this.oSuccessMessageDialog.close();
                                    this.oSuccessMessageDialog.destroy();
                                    // Sair da tela
                                    this.CancelarOperacao();
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
                this.getView().getModel().create("/InterfaceSet",oPayload,mParameters);
                
            },

            onChangeLImiteTempo: function(oEvent) {

                const regex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
                const sNewValue = oEvent.getParameter("newValue");

                if (!regex.test(sNewValue)){

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

            onChangeCompanyCode: function(oEvent) {
                
                const sCompanyCode = this.getView().byId("ComboBoxCompany").getSelectedKey();
                const sPath = this.getView().getModel().createKey("/CompanySet",{
                    CompanyCode: sCompanyCode
                });

                // Atribuir Destination da Empresa
                const oCompanyData = this.getView().getModel().getProperty(sPath);
                this.getView().byId("IdTextDestlInterfaceCliente").setText(oCompanyData.Rfcdest);

                //Buscar nome da RFC padrão CEI
                const oParameters = {
                    CompanyCode: sCompanyCode
                };

                this.getView().setBusy(true);

                this.getView().getModel().callFunction("/BuscarNovaRfcCei", {
                    method: "GET",
                    urlParameters: oParameters,

                    success: (oData, res) => {

                        this.getView().setBusy(false);
                        if(oData.Type==="E"){
                            MessageBox.error(oData.Message);
                            return;
                        }

                        const sFunctionModule = oData.Message;
                        const sFunctionGroup = oData.Message.replace(oData.Message[2], "G");


                        this.getView().byId("IdTextInterfaceCEI").setText(sFunctionModule);
                        this.getView().byId("IdTextFGroupInterfaceCEI").setText(sFunctionGroup);

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
