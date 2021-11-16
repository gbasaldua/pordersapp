sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/model/Sorter",
	"com/porders/pordersapp/model/formatter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, UIComponent, Filter, FilterOperator, Fragment, Sorter, formatter) {
		"use strict";

		return Controller.extend("com.porders.pordersapp.controller.Home", {

			formatter: formatter,

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

			onGroup: function () {
				// 1. get current view
				var oView = this.getView();

				// 2. load the fragment file
				if (!this.byId("groupDialog")) {
					Fragment.load({
						id: oView.getId(),
						name: "com.porders.pordersapp.fragment.GroupDialog",
						controller: this
					}).then(function (oDialog) {
						// 3. Open dialog
						// connect dialog to the root view of component (model, lifecycle)
						oView.addDependent(oDialog);
						oDialog.open();
					});
				} else {
					this.byId("groupDialog").open();
				}

			},

			onGroupDialogConfirm: function (oEvent) {
				var oSortItem = oEvent.getParameter("groupItem");
				var sColumnPath = "PONumber";
				var bDescending = oEvent.getParameter("groupDescending");
				var aSorters = [];
				var bGroupEnabled = false;

				if (oSortItem) {
					sColumnPath = oSortItem.getKey();
					bGroupEnabled = true;
				}

				aSorters.push(new Sorter(sColumnPath, bDescending, bGroupEnabled));

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
			},

			onCopy: function (oEvent) {
				var oRouter = UIComponent.getRouterFor(this);
				var oItem = this.getView().byId("idPordersTable").getSelectedItem();

				oRouter.navTo("New", {
					PODescription: oItem.getBindingContext().getObject().PODescription,
					CompanyCode: oItem.getBindingContext().getObject().CompanyCode,
					Vendor: oItem.getBindingContext().getObject().Vendor
				});
			},

			onRefresh: function() {
				var oTable = this.getView().byId("idPordersTable");
				oTable.getModel().refresh(true);
				console.log(oTable);
			}

		});
	});
