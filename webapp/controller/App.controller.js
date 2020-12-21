sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Input",
	"sap/ui/core/ValueState",
//	"sap/m/Dialog",
//	"sap/m/DialogType",
//	"sap/m/Button",
	"sap/m/MessageToast"
//	"sap/m/ButtonType"

], function (Controller, JSONModel, Input, MessageToast) {
	"use strict";

	return Controller.extend("smc.AB_testing.controller.App", {
		onInit: function () {},
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			//	var sMessage = this.getResourceBundle().getText("newObjectCreated", [oProduct.Name]);
		},
		/*
		_onSuccessInteraction: function (oGUID) {
			if (!this.oSuccessMessageDialog) {
				this.oSuccessMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Success",
					state: ValueState.Success,
					content: new Text({ text: "One of the keys to success is creating " + oGUID+ " realistic." }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							this.oSuccessMessageDialog.close();
						}.bind(this)
					})
				});
			}

			this.oSuccessMessageDialog.open();
		},
		*/
		_postAbandonedBasket: function(oInteractionModel){
		var oView =this.getView();
			oView.setBusy(true);
	//	var that = this;
	        var token;
            var sUrl = "/API_MKT_INTERACTION_SRV"; 
			var oSettings = {
					"url": sUrl,
					"method": "GET", 
				 	"headers": {
						"X-CSRF-Token": "Fetch"
					},
					"dataType": "json",
					"contentType": "application/json"
				};
				
				$.ajax(oSettings)
				.done(function(results, textStatus, XMLHttpRequest){
					token =XMLHttpRequest.getResponseHeader('X-CSRF-Token');
				    sap.m.MessageToast.show("token received " + token, {
						duration:600
					});
					var sUrlToInsert = "/API_MKT_INTERACTION_SRV/Interactions";
					var oSettingsToInsert ={
						"url": sUrlToInsert,
						"method" : "POST",
						"headers": {
							"X-CSRF-Token": token
						},
						"dataType":"json",
						"contentType":"application/JSON",
						"data": JSON.stringify(oInteractionModel)
					};
						$.ajax(oSettingsToInsert)
							.done(function(results,textStatus, XMLHttpRequest){
					      		oView.setBusy(false);
								// show guid of the interaction
								var guid = results.d.InteractionContactUUID;
								if (guid!=="00000000-0000-0000-0000-000000000000"){
									sap.m.MessageToast.show("Interaction with GUID " + guid + " was created", {
											duration: 6000
									});
					//			that._onSuccessInteraction(guid);
								} else {
									sap.m.MessageToast.show("Data sent. Interesction is not created. Check parameters of AB", {
											duration: 6000
										});
								}
							})
							.fail(function(err){
								oView.setBusy(false);
								if (err !== undefined) {
										var oErrorStatus = $.parseJSON(err.status);
										MessageToast.show("Error with status " + oErrorStatus, {
											duration: 6000
										});
									} else {
										MessageToast.show("Unknown error!");
									}
							});
					
				})	
		 		.fail(function(err){
						if (err !== undefined) {
						var oErrorStatus = $.parseJSON(err.status);
							MessageToast.show("Error with status " + oErrorStatus, {
								duration: 6000
							});
						} else {
							MessageToast.show("Unknown error!");
						}
				});
				},	
				
		 _validateEmail: function(){
		 	var email = this.getView().byId("email").getValue();
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (!mailregex.test(email)) {
              MessageToast.show( email + " is not valid.Input correct email address",{
				duration:600
			});
               this.getView().byId("email").setValueState(sap.ui.core.ValueState.Error);
			}
		 },
		 
		 onTypeNavigation: function(){
		 	if (this.byId("navigation").getProperty("valueState")==="Error"){
		     	this.byId("navigation").setValueState(sap.ui.core.ValueState.None);
		     }else{
		    //do nothing
		     }
		 },
	     onTypeEmail  : function(){
		     if (this.byId("email").getProperty("valueState")==="Error"){
		     	this.byId("email").setValueState(sap.ui.core.ValueState.None);
		     	this._validateEmail();
		     }else{
		    	this._validateEmail();
		     }
	     },	
		 onPressAddRow: function(){
		    	var oTable = this.getView().byId("ProdTable");
		    	var oLength = oTable.getItems().length; 
		   	    if (oLength<5){
		    	//create and new row
		    	var ListItemNewLine = new sap.m.ColumnListItem({
		    		   type: sap.m.ListType.Inactive,
					   unread: false,
					   vAlign: "Middle",
					   cells: [
					     // add created controls to item
					     new Input({ type: "Text"}),
					     new sap.m.Input({ type: "Text"}),
					     new sap.m.Input({ type: "Text"}),
					     new sap.m.Input({ type: "Text"}),
					     new sap.m.Input({ type: "Text"}),
					     new sap.m.Input({ type: "Text"}),
					     new sap.m.Input({ type: "Text"}),
					     new sap.m.Input({ type: "Text"}),
					     new sap.m.Input({ type: "Text"})
					     ]
		    	});
		    	oTable.addItem(ListItemNewLine);
	    	    } else{
	    	    	MessageToast.show('No more then 5 items in AB allowed', {
								duration: 6000
							});
	    	    }	
		    },
			onPressDeleteRow: function(event){
					var oTable = this.getView().byId("ProdTable"); 
					var oModel = oTable.getModel();
					var aRows = oModel.getData().ABProducts;
					var aContexts =oTable.getSelectedContexts();
			
				 	if(aContexts.length>0){
					for(var i = aContexts.length -1; i>=0;i--){
					var oThisObj = aContexts[i].getObject();
					var index = $.map(aRows, function(obj, index){
						if(obj===oThisObj){
							return index;
						}
					});
					aRows.splice(index,1);
					}
					oModel.setData({
							ABProducts: aRows});
					oTable.removeSelections(true);
					MessageToast.show('is removed');
					} else{
						MessageToast.show('Please select a row');		
					}
			},
	
			// POST request
			onPostAB: function(oInteractionModel){
			var	sRecipient,sCurrency, sLocale, sSource, sDomain, sNavigation;
			//check all mandatory fields Email is filled
			if(this.byId("email").getValue()===""){
				 this.byId("email").setValueState(sap.ui.core.ValueState.Error);
					MessageToast.show("insert email",{
				duration:600
				});
		    }else{
		    	if(this.byId("navigation").getValue()===""){
		    		this.byId("navigation").setValueState(sap.ui.core.ValueState.Error);
					MessageToast.show("insert navigation",{
				duration:600
					});
		    	}else{
		 	sRecipient = this.byId("email").getValue();
			sCurrency = this.byId("currency").getSelectedItem().getKey();
			sLocale = this.byId("locale").getSelectedItem().getKey();
			sSource = this.byId("source").getSelectedItem().getKey();
			sDomain = this.byId("domain").getSelectedItem().getKey();
			sNavigation = this.byId("navigation").getValue();
			var today = new Date();
			//get array of rows in table
	        var oPrTable = this.byId("ProdTable");
	        var rows = oPrTable.getItems();
			var oInteractionModel = {
				  "InteractionUUID": "00000000-0000-0000-0000-000000000000",
				  "InteractionContactOrigin": "EMAIL",
				  "InteractionContactId": sRecipient,
				  "CommunicationMedium": "ONLINE_SHOP",
				  "InteractionType": "SHOP_CART_ABANDONED",
				  "InteractionLanguage": sDomain,
				  "InteractionTimeStampUTC": new Date(),
				  "InteractionSourceObject": sSource,  
				  "InteractionReason": "REGISTERED_CUSTOMERS",
				  "InteractionIsAnonymous": false,
				  "InteractionAmount":  "30.00",
				  "InteractionCurrency": sCurrency,
				  "InteractionSourceDataURL": sNavigation,
				  "InteractionSourceTimeStampUTC": new Date(),
				  "YY1_PRICE_LIST_LOCALE_MIA":sLocale,
				  "InteractionAdditionalObjects": {
				    "results": [
				      {
				        "InteractionUUID": "00000000-0000-0000-0000-000000000000",
			        	"MarketingObjectType": "Email",
				        "MarketingObject": sRecipient
				      }
				    ]
					},
					
				  "InteractionProducts": {
				        "results": [
				        ]
					}, 
					
				   "InteractionProductCategories": {
    					"results": [
    					]
					 }
		 	};
		 	for ( var i = 0; i < rows.length; i++ ) {
			oInteractionModel.InteractionProducts.results.push({
		        InteractionProductUUID: "00000000-0000-0000-0000-000000000000",
		        ProductOrigin: "EXTERNAL_01",
		        Product: rows[i].getCells()[0].getProperty("value"),
		        YY1_SIZE_MIP: rows[i].getCells()[6].getProperty("value"),
		        YY1_COLOUR_MIP: rows[i].getCells()[5].getProperty("value"),
		        InteractionProductAmount: rows[i].getCells()[3].getProperty("value"),
		        InteractionProductQuantity: rows[i].getCells()[4].getProperty("value"),
            });
           oInteractionModel.InteractionProductCategories.results.push({
            	InteractionUUID: "00000000-0000-0000-0000-000000000000",
		        ProductCategoryHierarchy: "ATG",
		        ProductCategory: rows[i].getCells()[2].getProperty("value"),   
            });
            } //  END get array of rows in table
	       		this._postAbandonedBasket(oInteractionModel);
		    	} // end of inner if/else
			 }//end of outer IF/ELSE
		}
	});
});