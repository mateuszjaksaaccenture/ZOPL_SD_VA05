var This = {};

sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/commons/DatePicker"
], function (Controller, MessageToast, JSONModel, Filter, FilterOperator) {
   "use strict";
   return Controller.extend("sap.ui.zopl_sd_va05.controller.Panel", {
      
		inputId : '',
    	table1: {},
		oODataJSONModel: {},
		filterIndex: null,
		sorter : [
			{name:"Maktx", order: 0},
			{name:"Matnr", order: 0},
			{name:"Werks", order: 1}
		],
		aFilters: [],
		_oBundle: {},
	
		onLoad : function(){
			
//			console.log("***** onLoad started *****");
			var inputWidth = window.getComputedStyle(document.getElementById("__xmlview1--shopId")).width;
			This.getView().byId("ordId").setProperty("width", inputWidth);
			This.getView().byId("materialId").setProperty("width", inputWidth);
			This.getView().byId("ordSerNum").setProperty("width", inputWidth);
//			console.log("***** onLoad finished *****");
		},

//=======================
		floatComparator:  function(value1, value2) {
		  if ((value1 == null || value1 === undefined || value1 === '') &&
				(value2 == null || value2 === undefined || value2 === ''))  {
					return 0;
				}
		  if ((value1 == null || value1 === undefined || value1 === '')) {
		  	return -1;
		  }
		  if ((value2 == null || value2 === undefined || value2 === '')) {
		  	return 1;
		  }
		  if(parseFloat(value1) < parseFloat(value2)) {
		  	return -1;
		  }
		  if(parseFloat(value1) === parseFloat(value2)) {
		  	return 0;
		  }
		  if(parseFloat(value1) > parseFloat(value2)) {
		  	return 1;
		  }
		},
		
		addColumnSorterAndFilter : function(oColumn, comparator) {
			var oTable = oColumn.getParent();
			var oCustomMenu = new sap.ui.commons.Menu();
   
		    oCustomMenu.addItem(new sap.ui.commons.MenuItem({
                text: 'Sortowanie rosnąco',
                // icon:"/sap.ui.zopl_sd_va05/resources/sap/ui/table/themes/sap_goldreflection/img/ico12_sort_asc.gif",
				// icon: "../../../../../../UI5/sap/ui/commons/themes/base/img/datepicker/icon_cal.png",
				icon: "sap-icon://sort-ascending",
                select:function() {
                 var oSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), false);
                 oSorter.fnCompare=comparator;
                 oTable.getBinding("rows").sort(oSorter);
                
                 for (var i=0;i<oTable.getColumns().length; i++) {
                 	oTable.getColumns()[i].setSorted(false);                
                 }
                 oColumn.setSorted(true);
                 oColumn.setSortOrder(sap.ui.table.SortOrder.Ascending);
                }
			    }));
		    oCustomMenu.addItem(new sap.ui.commons.MenuItem({
			    text: 'Sortowanie malejąco',
				icon: "sap-icon://sort-descending",
			    select:function(oControlEvent) {
		             var oSorter = new sap.ui.model.Sorter(oColumn.getSortProperty(), true);
		             oSorter.fnCompare=comparator;
		             oTable.getBinding("rows").sort(oSorter);
		                
		             for (var i=0;i<oTable.getColumns().length; i++) {
		             	oTable.getColumns()[i].setSorted(false);
		             }
		             oColumn.setSorted(true);
		             oColumn.setSortOrder(sap.ui.table.SortOrder.Descending);
			    }
			    }));
   
		    oCustomMenu.addItem(new sap.ui.commons.MenuTextFieldItem({
				  text: 'Filtr',
						icon: "sap-icon://filter",
				  select: function(oControlEvent) {
				      var filterValue = oControlEvent.getParameters().item.getValue();
				      var filterProperty = oControlEvent.getSource().getParent().getParent().mProperties.sortProperty;
				      var filters = [];
				      var oFilter1 = {};
				      if (filterValue.trim() !== '') {
				      	// if(oControlEvent.getSource().getParent().getParent().getProperty("filterProperty") == "OrdLineGross"){
					    oFilter1 = new sap.ui.model.Filter(filterProperty, sap.ui.model.FilterOperator.EQ, parseFloat(filterValue));
						oControlEvent.getSource().getParent().getParent().setFiltered(true);
				      	// }else{
					    //oFilter1 = new sap.ui.model.Filter(filterProperty, sap.ui.model.FilterOperator.EQ, filterValue);
				      	// }
					      filters = [oFilter1];   
				      } else {
						oControlEvent.getSource().getParent().getParent().setFiltered(false);
				      }
					oTable.getBinding("rows").filter(filters, sap.ui.model.FilterType.Application);
				  }
			    }));
   
		    oColumn.setMenu(oCustomMenu);
		    return oColumn;
		},
//=========================

		onInit : function() {
//		onAfterRendering : function() {
//			console.log("***** onInit started *****");
			var oController = this.getView().getController();
			this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.table1 = this.getView().byId("PozycjeLista");      
			this.oODataJSONModel =  new JSONModel();	
			var sText = this._oBundle.getText("PROCESSING");
			
			oController._setInitialValues(oController);
			this._oBusyDialog = new sap.m.BusyDialog({
				busyIndicatorDelay: 3000,
				text: sText
			});
			//var myThis = this;
			
/*			//this.table1.setShowColumnVisibilityMenu(false);
				var columns = this.table1.getColumns();
				this.addColumnSorterAndFilter(columns[16], this.floatComparator);
				this.addColumnSorterAndFilter(columns[17], this.floatComparator);
				this.addColumnSorterAndFilter(columns[19], this.floatComparator);
				
			   this.table1.addEventDelegate({                        //Table onAfterRendering event
			      onAfterRendering: function() {      
//			      	console.log('=================== afterRendering');
			        var oBinding = this.getBinding("rows");      //Get hold of binding aggregation "row"
			        oBinding.attachChange(function(oEvent) {     //Attach 'binding' change event which fires on filter / sort
			          var oSource = oEvent.getSource();
			          var oLength = oSource.getLength();
			          console.log("Filtered Length: " + oLength);
   		            		var totAmount = 0;
   		            		var totValue = 0.0;
   		            		
   		            		This.filterIndex = oSource.aIndices;
   		            		for(var i = 0; i < oSource.aIndices.length; i++) {
   		            			totAmount += Number.parseFloat(oSource.oList[oSource.aIndices[i]].OrdAmount);
   		            			totValue += Number.parseFloat(oSource.oList[oSource.aIndices[i]].OrdLineGross);
   		            		}
				This.getView().byId("totalValue").setValue(totValue.toFixed(2));
				This.getView().byId("totalAmount").setValue(totAmount);
				This.getView().byId("totalRows").setValue(oSource.aIndices.length);
   		            		//setTimeout(function(){myThis.oODataJSONModel.setData({totalAmount:totAmount, totalValue:totValue.toFixed(2)});},1);
            	 // myThis.getView().invalidate();
			        });
			      }
			    }, this.table1);
			
			This = this;
			window.onload = this.onLoad;

			setTimeout(function(){
			try {
				var el = document.getElementById("__xmlview1--shopId");
//				console.log("*** element: " + el);
				var inputWidth = window.getComputedStyle(el).width;
				This.getView().byId("ordId").setProperty("width", inputWidth);
				This.getView().byId("materialId").setProperty("width", inputWidth);
				This.getView().byId("ordSerNum").setProperty("width", inputWidth);
			} catch(e) {
				console.log("***** onInit exception ***** " + e);
			}
			}, 1);
			
			console.log("***** onInit finished *****");*/
		},
		
		_setInitialValues: function(oController){
			var today = oController.formatDateToBackend(new Date()).toISOString().substring(0,10);
			var yesterday = oController.formatDateToBackend(new Date());
			yesterday.setDate(yesterday.getDate() - 7);
		
//			Default filter by date [AWi 26.03.2019]
			this.aFilters.push(new sap.ui.model.Filter("OrdDate", "BT", yesterday, new Date()));
			this.byId("dateFrom").setValue(yesterday.toISOString().substring(0,10));
			this.byId("dateTo").setValue(today);
			this.byId("vbShowFilter").setVisible(false);
			
			this.byId("totalRows").setValue(0);
			this.byId("totalValue").setValue(0);
			this.byId("totalAmount").setValue(0);
			
		},
	   
/*	   onShowHello : function () {
         // read msg from i18n model
         var oBundle = this.getView().getModel("i18n").getResourceBundle();
         var sRecipient = this.getView().getModel().getProperty("/recipient/name");
         var sMsg = oBundle.getText("startMsg", [sRecipient]);
         // show message
         MessageToast.show(sMsg);
      },*/

      onShowFilter: function() {
    	  this.byId("vbFilter").setVisible(true);
    	  this.byId("vbShowFilter").setVisible(false);
      },
      
      onOpenPositions: function() {
     var SearchButton = this.byId("SearchButton");
     SearchButton.setEnabled(false);
    	  var bMatnr = this._findFilterObject("MatNr"),//this.aFilters.find(o => o.sPath === "MatNr"),
    	  	bSalesMan = this._findFilterObject("SalMan"),//this.aFilters.find(o => o.sPath === "SalMan"),
    	  	bWerks = this._findFilterObject("Werks"),//this.aFilters.find(o => o.sPath === "Werks"),
    	  	bOrdId = this._findFilterObject("OrdId"), //this.aFilters.find(o => o.sPath === "OrdID"),
    	  	sMsg;
  /* CR_P2S_236  */	 
    	  if(!bOrdId){
    		  if(!bWerks){
    			  sMsg = "Aby wyszuka\u0107 dane podaj numer zlecenia albo podaj zak\u0142ad";
    		  }
    		  
    		/*  sMsg = "Aby wyszuka\u0107 dane podaj materia\u0142, zak\u0142ad lub numer zlecenia. Wybór zleceniodawcy jest wymagany.";//this.getResourceBundle().getText("SALESMAN_REQU");
    	  } else if(!bMatnr && !bOrdId && !bWerks){
    		  sMsg = "Aby wyszukać dane podaj materiał, zakład lub numer zlecenia.";*/
    	  }
    
    	  /* CR_P2S_236 */
    	  if(sMsg){
    		  MessageToast.show(sMsg); 
    	   SearchButton.setEnabled(true);
    	  } else {
    		  var that = this;
    		  this.table1.getBinding("rows").filter(this.aFilters).attachDataReceived(function(){
    	  SearchButton.setEnabled(true);
    			  var oContext = that.table1.getBinding("rows").getContexts();
    			  that._setAmounts(that);
    			  if(oContext && oContext.length > 0){
        			  that.byId("vbFilter").setVisible(false);
    		          that.byId("vbShowFilter").setVisible(true);    				  
    			  } else {
    				  MessageToast.show("Brak danych w systemie. Zmień kryteria wyszukiwania."); 
    			  }
		          that.table1.getColumns()[0].setProperty("width", "111px");
    		});
    	  }
    	  
      },
      
      _setAmounts: function(oController){
		  var oContext = oController.table1.getBinding("rows").getContexts(),
	  	  oObject,
	  	  sPath,
	  	  sRowSum = 0,
	  	  totValue = 0,
	  	  totAmount = 0,
	  	  oView = oController.getView();
		  if(oContext[0]){
			 sPath = oContext[0].getPath();
			 oObject = oController.getView().getModel().getObject(sPath);
			 sRowSum = oObject.RowSum.trim();
			 totValue = oObject.GrossSum.trim();
			 totAmount = oObject.AmountSum.trim();
		  } 
		  oView.byId("totalRows").setValue(sRowSum);
		  oView.byId("totalValue").setValue(totValue);
		  oView.byId("totalAmount").setValue(totAmount);
      },
      
      _findFilterObject: function(sName){
    	  var oObject = this.aFilters.find(function(o){
		    		 return o.sPath === sName;
		    	  });
    	  return oObject;
      },
      
/*      onOpenPositions: function() {
    	  var url = this.getOwnerComponent().getModel("MMmodel");
    	  if ((!this.byId("shopId").getValue()  && !this.byId("materialId").getValue()  && !this.byId("ordId").getValue()) || (!this.byId("salMan").getValue())){
	  		if( this.byId("salMan").getValue()) {
    		  MessageToast.show("Aby wyszukać dane podaj materiał, zakład lub numer zlecenia."); 
	  		} else {
    	  	MessageToast.show("Aby wyszukać dane podaj materiał, zakład lub numer zlecenia. Wybór zleceniodawcy jest wymagany.");
	  		}
    		  this.getView().setModel(this.oODataJSONModel,"PozycjeModel");
    	  }
    	  else{
    		  var aSorter = [];
    		  for (var i = 1; i < this.sorter.length; i++){
    			  if(this.sorter[i].order !== 0){
            		  aSorter.push(new sap.ui.model.Sorter(this.sorter[i].name, this.sorter[i].order === -1, null));		  
    			  } 
    		  }
    		  
    		  var aFilter =[];
    		  var bFilter=[];
    		  

  			if(this.byId("shopId").getValue()) {
  				// aFilter.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.byId("shopId").getValue()));
  				var hValue = this.byId("shopId").getValue();
  				if(hValue.match(";") != null) {
  					var hList = hValue.split(";");
  					var hFilterList = [];
  					for(var h2 = 0; h2 < hList.length; h2++) {
  						hFilterList.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, hList[h2]));
  					}
  					aFilter.push(new sap.ui.model.Filter({sPath:"Werks", aFilters:hFilterList, bAnd:false, _bMultiFilter:true}));
  				} else {
  					aFilter.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, hValue));
  				}
  			}
  			// test filtra zleceniodawcy
  			if(this.byId("salMan").getValue()) {
  				// aFilter.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.byId("shopId").getValue()));
  				var jValue = this.byId("salMan").getValue();
  				if(jValue.match(";") != null) {
  					var jList = jValue.split(";");
  					var jFilterList = [];
  					for(var j2 = 0; j2 < jList.length; j2++) {
  						jFilterList.push(new sap.ui.model.Filter("SalMan", sap.ui.model.FilterOperator.EQ, jList[j2]));
  					}
  					aFilter.push(new sap.ui.model.Filter({sPath:"SalMan", aFilters:jFilterList, bAnd:false, _bMultiFilter:true}));
  				} else {
  					aFilter.push(new sap.ui.model.Filter("SalMan", sap.ui.model.FilterOperator.EQ, jValue));
  				}
  			}

  			aFilter.push(new sap.ui.model.Filter("OrdDate", sap.ui.model.FilterOperator.BT, this.byId("dateFrom").getValue(), this.byId("dateTo").getValue()));
  			
  			if(this.byId("materialId").getValue()) {
  				aFilter.push(new sap.ui.model.Filter("MatNr", sap.ui.model.FilterOperator.EQ, this.byId("materialId").getValue()));
  			}
  			if(this.byId("ordSerNum").getValue()) {
  				aFilter.push(new sap.ui.model.Filter("OrdSerNum", sap.ui.model.FilterOperator.EQ, this.byId("ordSerNum").getValue()));
  			}
  			if(this.byId("ordId").getValue()) {
  				aFilter.push(new sap.ui.model.Filter("OrdId", sap.ui.model.FilterOperator.EQ, this.byId("ordId").getValue()));
  			}
			
  			if(this.byId("posType").getValue()) {
  				//aFilter.push(new sap.ui.model.Filter("PosType", sap.ui.model.FilterOperator.EQ, this.byId("posType").getValue()));
  				var kValue = this.byId("posType").getValue();
  				if(kValue.match(";") != null) {
  					var kList = kValue.split(";");
  					var kFilterList = [];
  					for(var i3 = 0; i3 < kList.length; i3++) {
  						kFilterList.push(new sap.ui.model.Filter("PosType", sap.ui.model.FilterOperator.EQ, kList[i3]));
  					}
  					aFilter.push(new sap.ui.model.Filter({sPath:"PosType", aFilters:kFilterList, bAnd:false, _bMultiFilter:true}));
  				} else {
  					aFilter.push(new sap.ui.model.Filter("PosType", sap.ui.model.FilterOperator.EQ, kValue));
  				}
  			}
  			if(this.byId("ordType").getValue()) {
  				var iValue = this.byId("ordType").getValue();
  				if(iValue.match(";") != null) {
  					var iList = iValue.split(";");
  					var iFilterList = [];
  					for(var i1 = 0; i1 < iList.length; i1++) {
  						iFilterList.push(new sap.ui.model.Filter("OrdType", sap.ui.model.FilterOperator.EQ, iList[i1]));
  					}
  					aFilter.push(new sap.ui.model.Filter({sPath:"OrdType", aFilters:iFilterList, bAnd:false, _bMultiFilter:true}));
  				} else {
  					aFilter.push(new sap.ui.model.Filter("OrdType", sap.ui.model.FilterOperator.EQ, iValue));
  				}
  			}
  			if(this.byId("ordStatus").getValue()) { // && this.byId("ordStatus").getValue() !== "-") {
  				aFilter.push(new sap.ui.model.Filter("OrdStatus", sap.ui.model.FilterOperator.EQ, this.byId("ordStatus").getValue()));
  			}
  			if(this.byId("dlvStatus").getValue()) { // && this.byId("dlvStatus").getValue() !== "-") {
  				aFilter.push(new sap.ui.model.Filter("DlvStatus", sap.ui.model.FilterOperator.EQ, this.byId("dlvStatus").getValue()));
  			}
  			if(this.byId("invStatus").getValue()) { // && this.byId("invStatus").getValue() !== "-") {
  				aFilter.push(new sap.ui.model.Filter("InvStatus", sap.ui.model.FilterOperator.EQ, this.byId("invStatus").getValue()));
  			}
  			if(this.byId("ordOwn").getSelected()) {
  				aFilter.push(new sap.ui.model.Filter("OrdOwn", sap.ui.model.FilterOperator.EQ, "X"));
  			}
  			if(this.byId("incomplete").getSelected()) {
  				aFilter.push(new sap.ui.model.Filter("Incomplete", sap.ui.model.FilterOperator.EQ, "X"));
  			}
    	  
  			var oModel = new sap.ui.model.odata.ODataModel(url.sServiceUrl,true);
    		var myThis = this;

//    		this.table1.setModel(this.oODataJSONModel);
    
//    		sap.ui.core.BusyIndicator.show();
//    		this.table1.getBinding("rows").filter([new sap.ui.model.Filter("Werks", "EQ", "2006")]);
//    		this.table1.getBinding("rows").applyFilter([new sap.ui.model.Filter("Werks", "EQ", "2006")]);
//			this.table1.getBinding("rows").filter([], sap.ui.model.FilterType.Application);

			bFilter.push(new sap.ui.model.Filter(aFilter, true));
			
    		oModel.read("/OrderLineSet", {
             filters: bFilter,
             sorters: aSorter,
             success: function(odata){
            	  myThis.getView().invalidate();
         		sap.ui.core.BusyIndicator.hide();
				This.filterIndex = null;   		            		
            	if(odata.results.length === 0){
	            		MessageToast.show("Brak danych w systemie. Zmień kryteria wyszukiwania.");
	            		myThis.oODataJSONModel.setData({pozycje:odata.results});
   		            	}
   		            	else{
   		            		var totAmount = 0,
   		            			totValue = 0.0,
   		            			oItem;
							for (var j = 0; j < odata.results.length; j++) {
								oItem = odata.results[j];
   		            			// totAmount += Number.parseFloat(oItem.OrdAmount);
   		            			totAmount += Number.parseFloat(oItem.OrdTotalAmount);
   		            			totValue += Number.parseFloat(oItem.OrdLineGross);
//   		            			var name1 = oItem.CustomerName1;
//   		            			var name2 = oItem.CustomerName2;
//   		            			var city =  oItem.CustomerCity1;
//   		            			var postcode =  oItem.CustomerPostCode;
//   		            			var street = oItem.CustomerStreet;
   		            			if(!oItem.CustomerName1 || oItem.CustomerName1 === "") {
//   		            			if (name1 == null || name1 === undefined || name1 === "") {
   		            				oItem.CustomerName1 = "brak nazwy";	
   		            			} else {
//   		            				if(!(name2 == null || name2 === undefined || name1 === "")) {
   		            				if(!oItem.CustomerName2 || oItem.CustomerName2 === ""){
   		            					oItem.CustomerName1 = oItem.CustomerName1 + " " + oItem.CustomerName2;
   		            				} 
   		            			}
//   		            			if(city == null || city === undefined || city === "") {
   		            			if(!oItem.CustomerCity1 || oItem.CustomerCity1 === ""){
   		            				oItem.CustomerCity1 = "brak adresu";
   		            			} else {
   		            				if(!oItem.CustomerPostCode || oItem.CustomerPostCode === ""){
//   		            				if(!(postcode == null || postcode === undefined || postcode === "")) {
   		            					oItem.CustomerCity1 = oItem.CustomerPostCode + " " + oItem.CustomerCity1;
   		            				}
   		            				if(!oItem.CustomerStreet || oItem.CustomerStreet === "") {
//   		            				if(!(street == null || street === undefined || street === "")) {
   		            					oItem.CustomerCity1 = oItem.CustomerCity1 + " " + oItem.CustomerStreet;
   		            				}
   		            			}
   		            			oItem.CustomerInfo = oItem.CustomerName1 + "\n" + oItem.CustomerCity1;
   		            		}
							myThis.getView().byId("totalValue").setValue(totValue.toFixed(2));
							myThis.getView().byId("totalAmount").setValue(totAmount);
							myThis.getView().byId("totalRows").setValue(odata.results.length);

//   		            		myThis.oODataJSONModel.setData({pozycje:odata.results});
   		            		myThis.byId("vbFilter").setVisible(false);
   		            		myThis.byId("vbShowFilter").setVisible(true);
   		            		myThis.table1.getColumns()[0].setProperty("width", "111px");
   		            		}  
             },
    		error: function(error) {
        		sap.ui.core.BusyIndicator.hide();
    		}
	           
			});
			

    
    	  }  
   },*/
   
   onExport: function() {
/*		var table2 = this.getView().byId("PozycjeLista");
		var data = this._setDataToExport();//table2.getModel().getData("pozycje").pozycje;
	    var stuff = [];
	    var dLength = data.length;
	    // dobrać się do aIndices i jesli nie null - zastosować podczas eksportu
	    if (This.filterIndex != null) {
	    	dLength = This.filterIndex.length;	
	    } */
	   	this._oBusyDialog.open();
	   	var fnSuccess = function(oData){
	   		this._processDataAfterRead(oData);
	   		this._oBusyDialog.close();
	   	}.bind(this),
	   		fnError = function(oError){
	   		this._oBusyDialog.close();
	   	}.bind(this);
	   	
		this.getView().getModel().read("/OrderLineSet", {
			filters: this.aFilters,
			success: function(oData) {
				if (typeof fnSuccess === "function") {
					fnSuccess(oData.results);
				}
			},
			error: function(oError) {
				if (typeof fnSuccess === "function") {
					fnError(oError);
				}
			} 
		});

   },
   
   _processDataAfterRead: function(oData){
	var stuff = [],
		oBund = this._oBundle;
	for(var i = 0; i < oData.length; i++) {
       var d = (this.filterIndex == null) ? oData[i] : oData[this.filterIndex[i]];
       stuff[i] = [
           d.OrdId,
           d.OrdPosNr,
           d.OrdNumber,
           d.PosType,
           d.MatName,
           d.MatNr,
           d.Werks,
           d.OrdType,
           this.toDateString(d.OrdDate),
           this._formatStatusText(d.OrdStatus),
           d.OrdAuthor,
           this.toDateString(d.DlvDate),
           this._formatStatusText(d.DlvStatus),
           d.DlvAuthor,
           this.toDateString(d.InvDate),
           this._formatStatusText(d.InvStatus),
           d.InvAuthor,
           Number.parseFloat(d.OrdTotalAmount),
           Number.parseFloat(d.OrdLineGross),
           d.Customer,
           this._getCustomerInfo(d),
           d.CustomerPersId,
           d.CustomerTaxNr,
           d.OrdSerNumList,
           d.OrdLock,
           d.InvNumber,
		   d.ZZKSEFID, //P2S-KSEF-SD: [KSEF_1_GAP_12]  Zmiany w apps Fiori dla eFakt startmj {}
           d.DlvNumber,
           d.RcpNumber,
           d.OrdKorNum,
           d.BillAccount,
           d.LgOrt
           ];
   }


   var basicReport = new ExcelBuilder.Template.BasicReport();
   var myFormat = basicReport.stylesheet.createFormat({format: "$ #,##0.00;$ #,##0.00;-", font: {color: "FFE9F50A"}});
   var columns = [
       {id: 'OrdId', name: "Nr Zlecenia", type: 'string', width: 12},
       {id: 'OrdPosNr', name:"Nr Pozycji", type: 'string', width: 8},
       {id: 'OrdNumber', name: "Nr Zamówienia", type: 'string', width: 30},
       {id: 'PosType', name:"B. Sprzedaży", type: 'string', width: 8},
       {id: 'MatName', name: "Nazwa Materiału", type: 'string', width: 40},
       {id: 'MatNr', name: "Nr Materiału", type: 'string', width: 20},
       {id: 'Werks', name: "Zakład", type:  'string', width: 6},
       {id: 'OrdType', name: "Rodz. Zlec.", type: 'string', width: 6},
       {id: 'OrdDate', name: "Data Zlec.", type: 'string', width: 11},
       {id: 'OrdStatus', name: "St. Zlec.", type: 'string', width: 6},
       {id: 'OrdAuthor', name: "Autor Zlec.", type: 'string', width: 12},
       {id: 'DlvDate', name: "Data Dost.", type: 'string', width: 11},
       {id: 'DlvStatus', name: "St. Dost.", type: 'string', width: 6},
       {id: 'DlvAuthor', name: "Autor Dost.", type: 'string', width: 12},
       {id: 'InvDate', name: "Data Fakt.", type: 'string', width: 11},
       {id: 'InvStatus', name: "St. Fakt.", type: 'string', width: 5},
       {id: 'InvAuthor', name: "Autor Fakt.", type: 'string', width: 11},
       // {id: 'OrdAmount', name: "Ilość", type: 'number', width: 11},
       {id: 'OrdTotalAmount', name: "Ilość", type: 'number', width: 11},
       {id: 'OrdLineGross', name: "Brutto", type: 'number', width:10},
       {id: 'Customer', name: "Klient", type: 'string', width: 11},
       {id: 'CustomerInfo', name: "Dane klienta", type: 'string', width: 11},
       {id: 'Pesel', name: "PESEL", type: 'string', width: 11},
       {id: 'Nip', name: "NIP", type: 'string', width: 11},
       {id: 'OrdSerNumList', name: "Nr-y Ser.", type: 'string', width: 18},
       {id: 'OrdLock', name: "Blok.", type: 'string', width: 5},
       {id: 'InvNumber', name: "Nr Fakt.", type: 'string', width: 11},
	   {id: 'ZZKSEFID', name: "Nr Ksef", type: 'string', width: 41}, //P2S-KSEF-SD: [KSEF_1_GAP_12]  Zmiany w apps Fiori dla eFakt startmj {}
       {id: 'DlvNumber', name: "Nr Dost.", type: 'string', width: 11},
       {id: 'RcpNumber', name: "Nr Parag.", type: 'string', width: 11},
       {id: 'OrdKorNum', name: "Nr Zlec. Kor.", type: 'string', width: 11},
       {id: 'BillAccount', name: "Nr Konta", type: 'string', width: 11},
       {id: 'LgOrt', name: "Skład", type: 'string', width: 6}
   ];

   var worksheetData = [
       [
       	{value: "Nr Zlecenia", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Nr Pozycji", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Nr Zamówienia", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "B. Sprzedaży", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Nazwa Materiału", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Nr Materiału", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Zakład", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Rodz. Zlec.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Data Zlec.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "St. Zlec.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Autor Zlec.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Data Dost.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "St. Dost.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Autor Dost.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
       	{value: "Data Fakt.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
      		{value: "St. Fakt.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 
      		{value: "Autor Fakt.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}},
      		{value: "Ilość", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 	
     		{value: "Brutto", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 	
     		{value: "Klient", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 	
     		{value: "Dane klienta", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 	
     		{value: "Pesel", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 	
     		{value: "NIP", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 	
     		{value: "Nr-y Ser.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 	
     		{value: "Blok.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 	
     		{value: "Nr Fakt.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 
			{value: "Nr Ksef", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, //P2S-KSEF-SD: [KSEF_1_GAP_12]  Zmiany w apps Fiori dla eFakt startmj {}
     		{value: "Nr Dost.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 
     		{value: "Nr Parag.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 
     		{value: "Nr Zlec. Kor.", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 
     		{value: "Nr Konta", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}, 
     		{value: "Skład", metadata: {style: basicReport.predefinedFormatters.header.id, type: 'string'}}
       ]
   ].concat(stuff);

   basicReport.setHeader([
       {bold: true, text: "Raport Zleceń"}, "", ""
   ]);
   basicReport.setData(worksheetData);
   basicReport.setColumns(columns);

   var worksheet = basicReport.getWorksheet();

   var sheetView = new ExcelBuilder.SheetView;
   worksheet.sheetView = sheetView;

   ExcelBuilder.Builder.createFile(basicReport.prepare(), {
       type: 'uint8array'
   }).then(function (data) {
		var today = (new Date()).toISOString().substr(0,19).replace(/-/g,"").replace(/:/g,"");
       var filename = "POS_Orders_" + today + ".xlsx" ;
       var blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
       saveAs(blob, filename);
   }).catch(function (e) {
       console.error(e);
   });
   },
   
   _getCustomerInfo: function(oItem){
	   var sText = this.formatCustomer(oItem.CustomerName1, oItem.CustomerName2, oItem.CustomerPostCode, oItem.CustomerCity1, oItem.CustomerStreet);
	   return sText;
   },
   
   	_setDataToExport: function(){
	   var oContexts = this.table1.getBinding("rows").getContexts(),
	   	   aData = [];
	   for(var i = 0; i < oContexts.length; i++){
		   aData.push(this.getView().getModel().getObject(oContexts[i].getPath()));
	   }
	   return aData;
   	},

   	toDateString: function(d) {
   		
   		try {
   			return d.toISOString().substr(0,10);
   		} catch(e) {
   			return ' ';
   		}
   	},
   	
// JDN: rezygnacja z kolumny GRUPA MATERIALOWA - handler do likwidacji
      onOpenGrupyMatDialog: function() {

    	  var url = this.getOwnerComponent().getModel("MMmodel");
			this.inputId = "groupId";
  			var oModel = new sap.ui.model.odata.ODataModel(url.sServiceUrl,true);
  			var oODataJSONModel =  new JSONModel();	
  				oModel.read("/MaterialGroupSet", null,null,true,function(odata){
  					odata.results.sort(function(a,b) {return (a.Matkl.localeCompare(b.Matkl));});
  		            oODataJSONModel.setData(odata);
 					});
  	            this.oDialog = this.getView().byId("GrupyMatDialog");
  	            if (!this.oDialog) {
  	               this.oDialog = sap.ui.xmlfragment( "sap.ui.zopl_sd_va05.view.DialogGrupyMat",this);
  	               this.getView().addDependent(this.oDialog);
  	            }
  				 this.getView().setModel(oODataJSONModel);
  		            this.oDialog.open();
      },

      onOpenOrdTypeDialog: function(evt) {
    	  this.inputId = "ordType";
          if (!this._oOrderTypeDialog) {
          	this._oOrderTypeDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.OrdTypeDialog", this);
	        this.getView().addDependent(this._oOrderTypeDialog);
	      }
		  this._oOrderTypeDialog.open();
/*    	  var url = this.getOwnerComponent().getModel("MMmodel");
			this.inputId = "ordType";
    	  
    	  
  			var oModel = new sap.ui.model.odata.ODataModel(url.sServiceUrl,true);

  			var oODataJSONModel =  new JSONModel();	
 				oModel.read("/SalesDocTypeSet", null,null,true,function(odata){
//  					odata.results.sort(function(a,b) {return (a.Auart.localeCompare(b.Auart));});
  		            oODataJSONModel.setData(odata);
  						});
// 				this.oDialog = this.getView().byId("OrdTypeDialog");
  	            if (!this._oOrdTypeDialog) {
  	               this._oOrdTypeDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.OrdTypeDialog", this);
  	               this.getView().addDependent(this._oOrdTypeDialog);
  	            }
  				 this.getView().setModel(oODataJSONModel);
  		         this._oOrdTypeDialog.open();*/
      },
      
      onOpenSalManDialog: function(evt) {
    	  this.inputId = "salMan";
          if (!this._oSalManDialog) {
          	this._oSalManDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.SalManDialog", this);
	        this.getView().addDependent(this._oSalManDialog);
	      }
		  this._oSalManDialog.open();
/*			var url = this.getOwnerComponent().getModel("MMmodel");
			var oModel = new sap.ui.model.odata.ODataModel(url.sServiceUrl,true);
			this.inputId = "salMan";

			var oODataJSONModel =  new JSONModel();	
			
			var aFilter =[];

			oModel.read("/SalManSet",  {
	             filters: aFilter,
	             success: function(odata){
	            oODataJSONModel.setData(odata);
	             }});
            this.oDialog = this.getView().byId("SalManDialog");
            if (!this.oDialog) {
               this.oDialog = sap.ui.xmlfragment( "sap.ui.zopl_sd_va05.view.fragment.SalManDialog",this);
               this.getView().addDependent(this.oDialog);
               
            }
			 this.getView().setModel(oODataJSONModel);
	            this.oDialog.open();   */
      },
      
      onOpenPosTypeDialog: function(evt) {
    	  this.inputId = "posType";
          if (!this._oPostTypeDialog) {
            	this._oPostTypeDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.PosTypeDialog", this);
  	        this.getView().addDependent(this._oPostTypeDialog);
  	      }
  		  this._oPostTypeDialog.open();
/*    	  var url = this.getOwnerComponent().getModel("MMmodel");
			this.inputId = "posType";
    	  
    	  
  			var oModel = new sap.ui.model.odata.ODataModel(url.sServiceUrl,true);

  			var oODataJSONModel =  new JSONModel();	
  				oModel.read("/PosTypeSet", null,null,true,function(odata){
  					odata.results.sort(function(a,b) {return (a.vkbur.localeCompare(b.vkbur));});
  		            oODataJSONModel.setData(odata);
  						});
  	            this.oDialog = this.getView().byId("PosTypeDialog");
  	            if (!this.oDialog) {
  	               this.oDialog = sap.ui.xmlfragment( "sap.ui.zopl_sd_va05.view.fragment.PosTypeDialog",this);
  	               this.getView().addDependent(this.oDialog);
  	               
  	            }
  				 this.getView().setModel(oODataJSONModel);
  		            this.oDialog.open();*/
    	  
      },
      
      onOpenStatusDialog: function(evt) {
    	  this.inputId = evt.getSource().data("mydata");
          if (!this._oStatusDialog) {
            	this._oStatusDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.StatusDialog", this);
  	        this.getView().addDependent(this._oStatusDialog);
  	      }
  		  this._oStatusDialog.open();
/*			var url = this.getOwnerComponent().getModel("MMmodel");
			this.inputId = evt.getSource().data("mydata");   	  
    	  
  			var oModel = new sap.ui.model.odata.ODataModel(url.sServiceUrl,true);

  			var oODataJSONModel =  new JSONModel();	
  				oModel.read("/StatusListSet", null,null,true,function(odata){
  					//odata.results.sort(function(a,b) {return (a.Status.localeCompare(b.Status));});
  		            oODataJSONModel.setData(odata);
  						});
  	            this.oDialog = this.getView().byId("StatusDialog");
  	            if (!this.oDialog) {
  	               this.oDialog = sap.ui.xmlfragment( "sap.ui.zopl_sd_va05.view.fragment.StatusDialog",this);
  	               this.getView().addDependent(this.oDialog);
  	               
  	            }
  				 this.getView().setModel(oODataJSONModel);
  		            this.oDialog.open();*/
    	  
      },
      
      onMaterialDialogOpen: function(oEvent){
    	  var sShopID = this.byId("shopId").getValue();
    	  this.inputId = "materialId";
    	  
    	  var sMsg = sShopID ? undefined : this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("NO_PLANT_SELECTED");
    	  
    	  if(sMsg){
    		  MessageToast.show(sMsg);
    		  return;
    	  }
    	  
          if (!this._oMatDialog) {
          	this._oMatDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.MaterialDialog", this);
	               this.getView().addDependent(this._oMatDialog);
	               
	               this._oMatDialog._oDialog.attachEventOnce("afterOpen", function(oEvent) {
	             	  var aDialogContent = oEvent.getSource().getContent(); //[1].getMetadata().getElementName()
	             	  for(var i = 0; i < aDialogContent.length; i++) {
	             		  if(aDialogContent[i].getMetadata().getElementName() === "sap.m.List"){
	             			  var aFilters = [],
	             			  	  oLineItemsTemplate = new sap.ui.xmlfragment("sap.ui.zopl_sd_va05.view.fragment.MatItemTemplate", this);
	             			  
	             			  aFilters.push(new sap.ui.model.Filter("ShopId", sap.ui.model.FilterOperator.EQ,
	             					  this.byId("shopId").getValue()));
	             			  
	             			  aDialogContent[i].bindItems({
	             					path: "/Materials",
	             					filters: aFilters,
	             					template: oLineItemsTemplate
	             			   });
	             		  }
	             	  }
	     		  }.bind(this));
	        }
          
          
			
		  this._oMatDialog.open();
      },
      
      onOpenWerksDialog: function (evt) {
    	  	this.inputId = "shopId";
            if (!this._oWerksDialog) {
            	this._oWerksDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.ShopDialog", this);
	               this.getView().addDependent(this._oWerksDialog);
	        }
		    this._oWerksDialog.open();
/*			var url = this.getOwnerComponent().getModel("MMmodel");
			var oModel = new sap.ui.model.odata.ODataModel(url.sServiceUrl,true);
			this.inputId = "shopId";

			var oODataJSONModel =  new JSONModel();	
			
			var aFilter =[];

			oModel.read("/ShopSet",  {
	             filters: aFilter,
	             success: function(odata){
	            oODataJSONModel.setData(odata);
	             }});
            this.oDialog = this.getView().byId("ZakladyDialog");
            if (!this.oDialog) {
               this.oDialog = sap.ui.xmlfragment( "sap.ui.zopl_sd_va05.view.fragment.ShopDialog",this);
               this.getView().addDependent(this.oDialog);
               
            }
			 this.getView().setModel(oODataJSONModel);
			 //oDialog.addButton(oButton);
	            this.oDialog.open();   */
    	  

       },
       
       onFilterMaterials: function(oEvent){
    	   var query = oEvent.getParameter("value"),
    	   	   sShopID = this.byId("shopId").getValue(),
    	   	   aFilters = [];
    	   
    	   aFilters.push(new Filter("SearchValue", FilterOperator.Contains, query));
    	   aFilters.push(new Filter("ShopId", FilterOperator.EQ, sShopID));
    	   
//			var aFilter = new Filter({
//							filters:[
//								new Filter("SearchValue", FilterOperator.Contains, query),
//								new Filter("ShopId", FilterOperator.EQ, sShopID)
//								],
//								and: true
//				
//			});
			oEvent.getSource().getBinding("items").filter(aFilters);
       },
       
       onFilterMiasta: function(oEvent) {
			var query = oEvent.getParameter("value");
			var aFilter = new Filter({
							filters:[
								new Filter("Ort01", FilterOperator.Contains, query)
								],
								and: false
				
			});
			oEvent.getSource().getBinding("items").filter(aFilter);
       },
       
       onFilterWerks : function (oEvent) {
			var query = oEvent.getParameter("value");
/*			var aFilter = new Filter({
				filters: [
					new Filter("Ort01", FilterOperator.Contains, query),
					new Filter("Name2", FilterOperator.Contains, query),
					new Filter("Werks", FilterOperator.Contains, query)
					],
				and: false
			});*/
			var aFilter = [ new Filter("SearchWerks", "EQ", query)];
			oEvent.getSource().getBinding("items").filter(aFilter);
		},

       onFilterSalMan : function (oEvent) {
			var query = oEvent.getParameter("value");
/*			var aFilter = new Filter({
				filters: [
					new Filter("SalManId", FilterOperator.Contains, query),
					new Filter("SalManName", FilterOperator.Contains, query)
					],
				and: false
			});*/
			var aFilter = [ new Filter("SalManName", "EQ", query) ];
			oEvent.getSource().getBinding("items").filter(aFilter);
		},

		onFilterGrupyMat : function (oEvent) {
			var query = oEvent.getParameter("value");
			var aFilter = new Filter({
				filters: [
					new Filter("Matkl", FilterOperator.Contains, query),
					new Filter("Wgbez", FilterOperator.Contains, query),
					new Filter("Wgbez60", FilterOperator.Contains, query)],
				and: false
			});
			oEvent.getSource().getBinding("items").filter(aFilter);
		},

		onFilterOrdType : function (oEvent) {
			var query = oEvent.getParameter("value");
/*			var aFilter = new Filter({
				filters: [
					new Filter("Auart", FilterOperator.Contains, query),
					new Filter("Bezei", FilterOperator.Contains, query)
					],
				and: false
			});*/
			var aFilter = [ new Filter("Bezei", "EQ", query) ];
			oEvent.getSource().getBinding("items").filter(aFilter);
		},

		onFilterPosType : function (oEvent) {
			var query = oEvent.getParameter("value");
/*			var aFilter = new Filter({
				filters: [
					new Filter("vkbur", FilterOperator.Contains, query),
					new Filter("bezei", FilterOperator.Contains, query)
					],
				and: false
			});*/
			var aFilter = [ new Filter("bezei", "EQ", query) ];
			oEvent.getSource().getBinding("items").filter(aFilter);
		},

		onFilterStatus : function (oEvent) {
			var query = oEvent.getParameter("value");
/*			var aFilter = new Filter({
				filters: [
					new Filter("Status", FilterOperator.Contains, query),
					new Filter("StatusName", FilterOperator.Contains, query)
					],
				and: false
			});*/
			var aFilter = [ new Filter("StatusName", "EQ", query) ];
			oEvent.getSource().getBinding("items").filter(aFilter);
		},

		onShowSerial: function(evt) {
    	  
			var ordId = evt.getSource().data("ordId");
			var ordPosNr = evt.getSource().data("ordPosNr");
			var url = this.getOwnerComponent().getModel("MMmodel");
			var oModel = new sap.ui.model.odata.ODataModel(url.sServiceUrl,true);

			var oODataJSONModel =  new JSONModel();	
			
			var aFilter =[];
			aFilter.push(new sap.ui.model.Filter("OrdId", sap.ui.model.FilterOperator.EQ, ordId));
			aFilter.push(new sap.ui.model.Filter("OrdPosNr", sap.ui.model.FilterOperator.EQ, ordPosNr));
			
				oModel.read("/SerialNumberSet",  {
		             filters: aFilter,
		             success: function(odata){
		            oODataJSONModel.setData(odata);
		             }});
	            this.oDialog = this.getView().byId("SerialDialog");
	            if (!this.oDialog) {
	               this.oDialog = sap.ui.xmlfragment( "sap.ui.zopl_sd_va05.view.DialogSerial",this);
	               this.getView().addDependent(this.oDialog);
	               
	            }
				 this.getView().setModel(oODataJSONModel);
				 //oDialog.addButton(oButton);
		            this.oDialog.open();   
       },

		_handleValueHelpClose : function (evt) {
			var oSelectedList = evt.getParameters("selectedItems").selectedItems,
				oItem,
				sName,
				itemList = "";
					sName = this._getNameById(this.inputId);
					this.removeSpecificFilter(sName);
			if(this.inputId === "ordStatus" || this.inputId === "dlvStatus" || this.inputId === "invStatus" || this.inputId === "ordType" ){
				
				//PBI000000184468  raport zlecen startmj{
				if(oSelectedList[0].getTitle()==="Otwarte"){
					this.aFilters.push(new sap.ui.model.Filter(sName, "NE", "C"));
				}else if(oSelectedList[0].getTitle()==="Zakończona"){
					this.aFilters.push(new sap.ui.model.Filter(sName, "EQ", "C"));
				}else if(oSelectedList[0].getTitle()==="Sprzedażowe"){
					this.aFilters.push(new sap.ui.model.Filter(sName, "EQ", "ZOR"));
				}else if(oSelectedList[0].getTitle()==="Zwrotne"){
					this.aFilters.push(new sap.ui.model.Filter(sName, "NE", "ZOR")); //}
				}
					if(itemList !== ""){
						itemList = itemList + ";" + oSelectedList[0].getTitle();
					} else {
						itemList = oSelectedList[0].getTitle();
					}
			}
			else if(oSelectedList && this.inputId !== "materialId"){
			
				for(var i = 0; i < oSelectedList.length; i++){
					oItem = oSelectedList[i];
					this.aFilters.push(new sap.ui.model.Filter(sName, "EQ", oSelectedList[i].getTitle()));
					if(itemList !== ""){
						itemList = itemList + ";" + oSelectedList[i].getTitle();
					} else {
						itemList = oSelectedList[i].getTitle();
					}
				}
			} else if(this.inputId === "materialId"){
				var aPathes = evt.getSource()._list.getSelectedContextPaths(),
					aPathDetails, MatId;

				for(var m = 0; m < aPathes.length; m++){
					aPathDetails = aPathes[m].split("'");
					
					MatId = aPathDetails[1];
					
					this.aFilters.push(new sap.ui.model.Filter(sName, "EQ", MatId));
					if(itemList !== ""){
						itemList = itemList + ";" + MatId;
					} else {
						itemList = MatId;
					}
				}
				
			}

			var productInput = this.getView().byId(this.inputId);
			productInput.setValue(itemList);

		},
		
		_getNameById: function(sId){
//	Get property name by id
			var sName;
			switch(sId){
			case "ordType":
				sName = "OrdType";
				break;
			case "shopId":
				sName = "Werks";
				break;
			case "salMan":
				sName = "SalMan";
				break;
			case "ordStatus":
				sName = "OrdStatus";
				break;
			case "dlvStatus":
				sName = "DlvStatus";
				break;
			case "invStatus":
				sName = "InvStatus";
				break;
			case "posType":
				sName = "PosType";
				break;	
			case "ordSerNum":
				sName = "OrdSerNum";
				break;
			case "ordId":
				sName = "OrdId";
				break;
			case "materialId":
				sName = "MatNr";
				break;
			}
			
			return sName;
		},

		handleChange: function (oEvent) {
			var oDP = oEvent.oSource;
		
			var bValid = oEvent.getParameter("valid");
			var dateFrom = this.byId("dateFrom").getProperty("dateValue"),
				dateTo = this.byId("dateTo").getProperty("dateValue");

			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
				dateFrom = this.formatDateToBackend(dateFrom);
				dateTo = this.formatDateToBackend(dateTo);
				this.removeSpecificFilter("OrdDate");
				this.aFilters.push(new sap.ui.model.Filter("OrdDate", "BT", dateFrom, dateTo));
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
				MessageToast.show("Nieprawidłowy format daty.");
			}
		},

		onResetValue : function (evt) {
			var id = evt.getSource().data("mydata"),
				sName = this._getNameById(id);
			if(id === "shopId"){
            	this.byId("shopId").setEnabled(true);
            	if(this._oWerksDialog){
            		this._oWerksDialog._list.removeSelections();
            		this._oWerksDialog._oList._aSelectedPaths = [];
            		this._oWerksDialog.getBinding("items").filter([]);
            	}
			} else if(id === "dateFrom" || id === "dateTo") {
				var today = (new Date()).toISOString().substring(0,10);
				this.byId(id).setValue(today);
			} else if(id === "salMan") {
				if(this._oSalManDialog){
            		this._oSalManDialog._list.removeSelections();
            		this._oSalManDialog._oList._aSelectedPaths = [];
            		this._oSalManDialog.getBinding("items").filter([]);
				}
				this.byId(id).setValue("");
			} /*else if(id === "ordType"){
				if(this._oOrderTypeDialog){
            		this._oOrderTypeDialog._list.removeSelections();
            		this._oOrderTypeDialog._oList._aSelectedPaths = [];
            		this._oOrderTypeDialog.getBinding("items").filter([]);
				}
				this.byId(id).setValue("");
			} */
			else if(id === "posType") {
				if(this._oPostTypeDialog){
            		this._oPostTypeDialog._list.removeSelections();
            		this._oPostTypeDialog._oList._aSelectedPaths = [];
            		this._oPostTypeDialog.getBinding("items").filter([]);					
				}
			
				this.byId(id).setValue("");
			} 
			
			if(id !== "dateFrom" && id !== "dateTo"){
				this.byId(id).setValue("");
			}
			this.removeSpecificFilter(sName);
		},
		onChangeValue: function(evt){
			var id = evt.getSource().getId(),
				sName,
				sFilterVal = evt.getSource().getValue();
			if(id.includes("materialId")){
				sName = "MatNr";
			} else if(id.includes("ordId")){
				sName = "OrdId";
			} else if(id.includes("ordSerNum")){
				sName = "OrdSerNum";
			} 
			this.removeSpecificFilter(sName);
			if(sFilterVal && sFilterVal !== ""){
				this.aFilters.push(new sap.ui.model.Filter(sName, "EQ", sFilterVal));
			}
			
		},
		onCheckBoxSelect: function(evt){
			var id = evt.getSource().getId(),
				sName,
				bSelected = evt.getSource().getSelected();
			if(id.includes("ordOwn")){
				sName = "OrdOwn";
			} else if(id.includes("incomplete")){
				sName = "Incomplete";
			}
			this.removeSpecificFilter(sName);
			if(bSelected){
				this.aFilters.push(new sap.ui.model.Filter(sName, "EQ", bSelected));
			}
		},
	    formatCustomer : function (Name1, Name2, PostCode, City, Street) {
	    	  var sFormatted = "";
	    	  if(!Name1 && !Name2){
	    		  sFormatted = "brak nazwy";
	    	  } else if(Name1 && Name2){
	    		  sFormatted = Name1 + " " + Name2;
	    	  } else if(Name1 || Name2){
	    		  sFormatted = Name1 + Name2;
	    	  }
	    	  if(!PostCode && !City && !Street){
	    		  sFormatted = sFormatted + "\nbrak adresu";
	    	  } else if(PostCode && City && Street){
	    	  	sFormatted = sFormatted + " \n" + Street + ",\n" + PostCode + " " + City;
	    	  } else {
	    		  if(!Street && !City){
	    			  sFormatted = sFormatted + " \n" + PostCode;
	    		  } else if(!City && !PostCode){
	    			  sFormatted = sFormatted + " \n" + Street;
	    		  } else if(!Street && !PostCode){
	    			  sFormatted = sFormatted + " \n" + City;
	    		  } else if(!City){
	    			  sFormatted = sFormatted + " \n" + Street + ",\n" + PostCode; 
	    		  } else if(!Street){
	    			  sFormatted = sFormatted + " \n" + PostCode + " " + City;
	    		  } else if(!PostCode){
	    			  sFormatted = sFormatted + " \n" + Street + ",\n" + City;
	    		  }
	    	  } 
	    	  
	    	  return sFormatted;
		},
		
		openSNDialog: function(oEvent){
			var aFilter = [],
				oModel = this.getView().getModel(),
				oSource = oEvent.getSource(),
				sPath = oSource.getBindingContext().getPath(),
				oData = oModel.getObject(sPath),
				sOrdId = oData.OrdId,
				sOrdPosNr = oData.OrdPosNr;
		
			
			aFilter.push(new sap.ui.model.Filter("OrdId", "EQ", sOrdId));
			aFilter.push(new sap.ui.model.Filter("OrdPosNr", "EQ", sOrdPosNr));
			oModel.read("/SerialNumberSet",  {
	             filters: aFilter,
	             success: function(oData){
	            	 this.getView().getModel("SN").setData({ 
	            		 								"SN": oData.results, 
	            		 								"OrdId": sOrdId,
	            		 								"OrdPosNr": sOrdPosNr });
		     	        if (!this._oSNDialog) {
		    	        	this._oSNDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.SNDialog", this);
		    	  	        this.getView().addDependent(this._oSNDialog);
		    	  	    }
		    	  		this._oSNDialog.open();
	             }.bind(this), error: function(oError){
	            	 
	             }.bind(this)});
		}, 
		onCloseDialogSN: function(){
			this._oSNDialog.close();
		},
		
		openCorrNoDialog: function(oEvent){
			var aFilter = [],
				oModel = this.getView().getModel(),
				oSource = oEvent.getSource(),
				sPath = oSource.getBindingContext().getPath(),
				oData = oModel.getObject(sPath),
				sOrdId = oData.OrdId,
				sOrdPosNr = oData.OrdPosNr;
		
			
			aFilter.push(new sap.ui.model.Filter("OrdId", "EQ", sOrdId));
			aFilter.push(new sap.ui.model.Filter("OrdPosNr", "EQ", sOrdPosNr));
			oModel.read("/OrderCorrectionSet",  {
	             filters: aFilter,
	             success: function(oData){
	            	 this.getView().getModel("CorrNo").setData({ 
	            		 								"CorrNo": oData.results, 
	            		 								"OrdId": parseInt(sOrdId, 10).toString(),
	            		 								"OrdPosNr": sOrdPosNr });
		     	        if (!this._oCorrNoDialog) {
		    	        	this._oCorrNoDialog = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.zopl_sd_va05.view.fragment.CorrNoDialog", this);
		    	  	        this.getView().addDependent(this._oCorrNoDialog);
		    	  	    }
		    	  		this._oCorrNoDialog.open();
	             }.bind(this), error: function(oError){
	            	 
	             }.bind(this)});
		}, 
		onCloseDialogCorrNo: function(){
			this._oCorrNoDialog.close();
		},
		formatDateToBackend: function(oDate) {
			var oDateOff,
				nUserOffset;
	
			if (oDate) {
				nUserOffset = oDate.getTimezoneOffset() * 60 * 1000;
				oDateOff = new Date(oDate.getTime() - nUserOffset);
	
				var oFormatOptions = {
						vJSDate: Date,
						bUTC: false
					},
					oConstraints = {
						nullable: true
					},
					oDate2 = new sap.ui.model.odata.type.Date(oFormatOptions, oConstraints);
			return oDate2.formatValue(oDateOff, "any");
			}
		},
		removeSpecificFilter: function(sName){
			this.aFilters = this.aFilters.filter(function(o){
				return o.sPath !== sName;
			});
		},
		
		_formatStatusText: function(sInvStatus){
			if(!sInvStatus) {
				return "";
			} else {
				var sText = sInvStatus === "C" ? "FINISHED_A" : "OPEN_A";
				return this._oBundle.getText(sText);
			}
		}
   });
});