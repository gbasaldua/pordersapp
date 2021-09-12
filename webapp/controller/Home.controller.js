sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/model/Sorter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, UIComponent, Filter, FilterOperator, Fragment, Sorter) {
		"use strict";

		return Controller.extend("com.porders.pordersapp.controller.Home", {
			onInit: function () {

			},

			onSearch: function (oEvent) {
				var aFilters = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery) {
					aFilters.push(new Filter("PODescription", FilterOperator.Contains, sQuery));
				}

				var oTable = this.byId("idPordersTable");
				var oBinding = oTable.getBinding("items");

				oBinding.filter(aFilters);
			},

			onSort: function () {
				// 1. get current view
				var oView = this.getView();

				// 2. load the fragment file
				if (!this.byId("sortDialog")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.porders.pordersapp.fragment.SortDialog",
						controller: this
					}).then(function (oDialog) {
						// 3. Open dialog
						// connect dialog to the root view of component (model, lifecycle)
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("sortDialog").open();
				}

			},

			onSortDialogConfirm: function (oEvent) {
				var oSortItem = oEvent.getParameter("sortItem");
				var sColumnPath = "PONumber";
				var bDescending = oEvent.getParameter("sortDescending");
				var aSorters = [];

				if (oSortItem) {
					sColumnPath = oSortItem.getKey();
				}

				aSorters.push(new Sorter(sColumnPath, bDescending));

				var oTable = this.byId("idPordersTable");
				var oBinding = oTable.getBinding("items");

				oBinding.sort(aSorters);
			},

			onPressItem: function (oEvent) {
				var oRouter = UIComponent.getRouterFor(this);
				var oItem = oEvent.getSource();

				oRouter.navTo("Detail", {
					PONumber: oItem.getBindingContext().getObject().PONumber
				});
			}

		});
	});
