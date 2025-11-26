sap.ui.define([
    "./BaseController",
    "sap/m/Dialog",
	"sap/m/DialogType",
    "sap/ui/core/Fragment", 
    "sap/ui/model/Filter", 
	"sap/ui/model/FilterOperator",
    "sap/m/Token",
	"sap/m/SearchField",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (
            BaseController,
            Dialog,
            DialogType,
            Fragment,
            Filter,
            FilterOperator,
            Token,
            SearchField,
            MessageBox,
            History,
            JSONModel

        ) {
        "use strict";

        return BaseController.extend("yellow.com.cadastrointerfaces.controller.S6", {
            onInit: function () {

                this._oRouter = this.getOwnerComponent().getRouter();

				// @type sap.ui.core.routing.Route
				var oRoute = this._oRouter.getRoute("Mapping");
				oRoute.attachPatternMatched(this.onCallMapping, this);
                
            },

            onCallMapping: function(oEvent){

                if (oEvent){
                    this.ViewId = oEvent.getParameters().arguments.sId;
                }    

                // Dados de entrada
                this.getMappingData("/InboundSet","InboundData");

                //Dados de Saida
                this.getMappingData("/OuboundSet","OutboundData");

                //Nome do arquivo importado
                this.getFileName();

                
            },

            getMappingData: function(sPath,sModel) {

                let mParameters = {
                    filters: this.getFilters(this.ViewId)
                };

                this.getOdataModel().read(sPath, mParameters)
                .then((data) => {       

                    const oData = []
                    data.results.forEach((obj)=>{ 
                        oData.push({ 
                            NodeId: obj.NodeId, 
                            HierarchyLevel: obj.HierarchyLevel,
                            ParentNodeId: obj.ParentNodeId,  
                            NodeGuid: obj.NodeGuid,
                            ParentGuid: obj.ParentGuid,
                            NodePath: obj.NodePath,
                            IsMapped: obj.IsMapped
                        });    
                    });

                    // Criar Arvore JSON
                    const oTree = this.BuildJsonTreeTable(oData);
                    var oModel = new JSONModel(oTree);       
                    this.getView().setModel(oModel,sModel);   
                });

            },

            BuildJsonTreeTable: function(Tree, HierarchyLevel, ParentNodeId  ) {

                var result = [];
                var nextHierarchyLevel;
                const currentParent = !ParentNodeId ? "" : ParentNodeId;

                if (typeof HierarchyLevel === 'undefined' || HierarchyLevel === '') {
                    // Se HierarchyLevel for undefined ou vazio, defina nextHierarchyLevel como '00'
                    nextHierarchyLevel = '00';
                } else {
                    // Caso contrário, converta para número, adicione 1 e formate como string
                    var nivelNumerico = parseInt(HierarchyLevel);
                    nivelNumerico += 1;
                    nextHierarchyLevel = nivelNumerico.toString().padStart(2, '0');
                }

                const hierarchyNode = Tree.filter( item=> item.HierarchyLevel  === nextHierarchyLevel && item.ParentNodeId === currentParent );

                for ( let node of hierarchyNode){


                    if (this.hasNextLevelNode(Tree, node.HierarchyLevel, node.NodeId )){
                        result.push({
                            Name: node.NodeId,
                            NodeGuid: node.NodeGuid,
                            ParentGuid: node.ParentGuid,  
                            NodePath: node.NodePath,
                            IsMapped: node.IsMapped,
                            Node: this.BuildJsonTreeTable(Tree, node.HierarchyLevel, node.NodeId )
                        });
                    } else {
                        result.push({
                            Name: node.NodeId,
                            NodeGuid: node.NodeGuid,
                            ParentGuid: node.ParentGuid,
                            NodePath: node.NodePath,
                            IsMapped: node.IsMapped
                        });
                    }

                }

                return result;
                
            },

            hasNextLevelNode: function(Tree, HierarchyLevel, ParentNodeId  ) {

                var nextHierarchyLevel;
                const currentParent = !ParentNodeId ? "" : ParentNodeId;

                if (typeof HierarchyLevel === 'undefined' || HierarchyLevel === '') {
                    // Se HierarchyLevel for undefined ou vazio, defina nextHierarchyLevel como '00'
                    nextHierarchyLevel = '00';
                } else {
                    // Caso contrário, converta para número, adicione 1 e formate como string
                    var nivelNumerico = parseInt(HierarchyLevel);
                    nivelNumerico += 1;
                    nextHierarchyLevel = nivelNumerico.toString().padStart(2, '0');
                }

                const hierarchyNode = Tree.filter( item=> item.HierarchyLevel  === nextHierarchyLevel && item.ParentNodeId === currentParent );

                return hierarchyNode.length > 0 ? true : false;

            },
            

            getFilters: function(sPath) {

                const regex = /CompanyCode='(\w+)',IntId='(\w+)'/;
			    const [, sCompanyCode, sIntId] = sPath.match(regex);
                let aFilters = [];
                
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

                return aFilters;
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

            onUploadFile:function(){

                const sPath = '/' + this.ViewId;
                const regex = /CompanyCode='(\w+)',IntId='(\w+)'/;
			    const [, sCompanyCode, sIntId] = sPath.match(regex);
                const oModel = this.getView().getModel();	
                const oFileUpload = this.getView().byId("fileUploaderFS");
                const domRef = oFileUpload.getFocusDomRef();
                const fileType = oFileUpload.getValue().split(".")[1];
                const file = domRef.files[0];
                const that = this;
                //this.getView().setBusy(true); 
                const mParameters = {
                    groupId: "updateChanges",
                    success: (odata, resp) => {
                        MessageBox.success("Arquivo salvo com sucesso!");

                        // Dados de entrada
                        this.getMappingData("/InboundSet","InboundData");

                        //Dados de Saida
                        this.getMappingData("/OuboundSet","OutboundData");

                        this.getView().setBusy(false);           
                    },
                    
    
                    error: (err) => {
                        this.getView().setBusy(false);
                        MessageBox.error(JSON.parse(err.responseText).error.message.value);
                    }
                };
             
                const reader = new FileReader();

                reader.onload = function (e) {
                    const vContent = e.currentTarget.result;
                    const sFile = atob(vContent.substring(29));
                    const oJsonFile = JSON.parse(sFile);

                    const oPayload = {
                        CompanyCode : sCompanyCode,
                        IntId : sIntId,
                        FileType : fileType,
                        FileData : sFile,
                        FileName: oFileUpload.getValue(),
                        to_filetree: that.buildHierarchy(oJsonFile)
                    }

                    oModel.create("/ExternalFileSet",oPayload, mParameters);

                }
                reader.readAsDataURL(file);
            },

            buildHierarchy: function (json, parentNodeID = null, hierarchyLevel = 0, isArray = false) {
                const hierarchy = [];

                for (const key in json) {
                  if (json.hasOwnProperty(key)) {
                    const nodeID = isArray ? `${parentNodeID}[${key}]` : key;
                    let sParentNodeId = "";
                    if(!!parentNodeID && isArray){
                        sParentNodeId = `${parentNodeID}[]`;
                    } else{
                        sParentNodeId = parentNodeID;
                    }
                    const currentNode = json[key];
                    const isCurrentArray = Array.isArray(currentNode);
                    const currentNodeInfo = {
                      NodeId: isCurrentArray ? `${nodeID}[]` : nodeID,
                      HierarchyLevel: hierarchyLevel.toString(),
                      ParentNodeId: !sParentNodeId ? "": sParentNodeId,
                    };
              
                    hierarchy.push(currentNodeInfo);
              
                    if (typeof currentNode === 'object' && currentNode !== null) {
                      const subHierarchy = this.buildHierarchy(currentNode, nodeID, hierarchyLevel + 1, isCurrentArray);
                      hierarchy.push(...subHierarchy);
                    }
                  }
                }
              
                return hierarchy;
            },
            
            onDrop: function(oEvent){

                var dataMapping = [];
                const sElement  = oEvent.getParameter('dragSession').getDragControl().getCells()[0].getProperty("text");
                const sNodeGuid  = oEvent.getParameter('dragSession').getDragControl().getCells()[1].getProperty("text");
                const sNodePath  = oEvent.getParameter('dragSession').getDragControl().getCells()[3].getProperty("text");
                const dropPath = oEvent.getParameter('dragSession').getDragControl().getParent().getId().split('-');
                const dropSource = dropPath[dropPath.length - 1];
                
                const oModelMapping = this.getView().getModel("Mapping");
                if(oModelMapping){
                    dataMapping = oModelMapping.getData();
                }

                switch(dropSource){
                    case 'TreeInbound':

                        if (dataMapping.length > 0 && !dataMapping[0].SourceName){

                            dataMapping[0].SourceName = sElement;
                            dataMapping[0].SourceGuid = sNodeGuid;
                            dataMapping[0].SourceNodePath= sNodePath;

                        } else {
                            dataMapping.push({
                                SourceName: sElement,
                                SourceGuid: sNodeGuid,
                                SourceNodePath: sNodePath
                            });  
                        }          
                        break;

                    case 'TreeOutBound':
                        dataMapping = dataMapping.length > 0 ? dataMapping : [{}];
                        dataMapping[0].TargetName =  sElement;
                        dataMapping[0].TargetGuid = sNodeGuid;
                        dataMapping[0].TargetNodePath = sNodePath;
                        break;
                    
                    default:
                        break;
                }

                const oModel = new JSONModel(dataMapping);       
                this.getView().setModel(oModel,"Mapping");    

            },

            onCellClick: function(oEvent){
                
                const clickPath  = oEvent.getSource().getId().split('-');
                const sourceTable = clickPath[ clickPath.length - 1 ];
                const rows = this.getView().byId(sourceTable).getRows();
                const selectedId = oEvent.getParameter("cellControl").getParent().getId();
                const row = rows.find(line=> line.getId() === selectedId);
                const guid = row.getCells()[1].getText();

                let aFilters = [];
                
                aFilters.push(new Filter({
                    path: "MappingGuid",
                    operator: FilterOperator.EQ,
                    value1: guid
                }));

                const mParameters = {
                    filters: aFilters
                };

                //read binding
                this.getOdataModel().read("/MappingSet",mParameters)
                .then((oData) => {

                    const oModel = new JSONModel(oData.results);       
                    this.getView().setModel(oModel,"Mapping"); 

                });

            },

            onDelete: function(oEvent) {

                const oModel = this.getModel("Mapping");
                if (!oModel) return;
                const oMapp = oModel.getData()[0];
                if (!oMapp) return;

                const sPath = this.getView().getModel().createKey("/MappingSet",{
                    MappingGuid: oMapp.MappingGuid,
                    SourceGuid: oMapp.SourceGuid,
                    TargetGuid: oMapp.TargetGuid
                });

                this.getOdataModel().delete(sPath)
                .then((oData)=>{


                    //rebuild view
                    this.onCallMapping();

                    //clear table   
                    const aMapping = [];
                    const oModel = new JSONModel(aMapping);       
                    this.getView().setModel(oModel,"Mapping"); 

                });


            },

            onReject: function(oEvent) {

                //clear table
                const aMapping = [];
                const oModel = new JSONModel(aMapping);       
                this.getView().setModel(oModel,"Mapping"); 

            },

            onAccept: function(oEvent) {
                const oMappingData = this.getView().getModel("Mapping").getData()[0];

                const oMapping = {
                    SourceGuidIn: oMappingData.SourceGuid,
                    SourceName: oMappingData.SourceName,
                    TargetGuidIn: oMappingData.TargetGuid,
                    TargetName: oMappingData.TargetName,
                    SourceNodePath: oMappingData.SourceNodePath,
                    TargetNodePath: oMappingData.TargetNodePath
                };

                this.getOdataModel().create("/MappingSet",oMapping)
                .then((oData)=>{

                    this.onCallMapping();

                    //Limpar area de mappings
                    this.onReject();

                });

            },

            getFileName: function( ) {

                const sViewPath = '/' + this.ViewId;
                const regex = /CompanyCode='(\w+)',IntId='(\w+)'/;
			    const [, sCompanyCode, sIntId] = sViewPath.match(regex);

                const sPath = this.getView().getModel().createKey("/ExternalFileSet",{
                    CompanyCode: sCompanyCode,
                    IntId: sIntId
                });

                this.getOdataModel().read(sPath)
                .then((odata) => {
                    this.getView().byId("fileUploaderFS").setValue(odata.FileName);
                });

            },
        });
    });
