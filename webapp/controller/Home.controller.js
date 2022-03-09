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
				jQuery.sap.require("sap.ui.core.util.File"); //se agrega para poder guardar archivos al generar PDF, CSV, etc
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

			onRefresh: function () {
				var oTable = this.getView().byId("idPordersTable");
				oTable.getModel().refresh(true);
				console.log(oTable);
			},

			onDownload: function (oEvent) {
				var oItems = this.getView().byId("idPordersTable").getSelectedItems();
				var oModelPDF = new sap.ui.model.odata.ODataModel(
					this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri
				);

				oItems.forEach(function (oItem) {
					var itemData = oItem.getBindingContext().getObject();
					var poNumber = itemData.PONumber;
					var uriPDFSet = "HeaderSet('" + poNumber + "')/$value";

					oModelPDF.read(uriPDFSet, {
						success: function (oData, response) {
							var file = response.requestUri;
							window.open(file);
						},
						error: function () {
							alert("Download Error");
						}
					});
				});
			},

			onDownloadZip: function () {
				var oItems = this.getView().byId("idPordersTable").getSelectedItems();
				var zipFile = new JSZip();
				var oModelPDF = new sap.ui.model.odata.ODataModel(
					this.getOwnerComponent().getManifestObject().getEntry("/sap.app").dataSources.mainService.uri
				);

				oItems.forEach(function (oItem) {
					var itemData = oItem.getBindingContext().getObject();
					var poNumber = itemData.PONumber;
					var uriPDFSet = "PdfSet('" + poNumber + "')";

					oModelPDF.read(uriPDFSet, {
						success: function (oData, response) {
							const pdfHex = response.data.File;
							let binary = new Array();

							for (var j=0; j<pdfHex.length/2; j++) {
								var h = pdfHex.substr(j*2, 2);
								binary[j] = parseInt(h,16);        
							}
							
							const bin = new Uint8Array(binary);

							zipFile.file(response.data.FileName, bin);

							zipFile.generateAsync({
								type: "blob"
							}).then(function (content) {
								sap.ui.core.util.File.save(content, "download " + new Date().getTime(), "zip");
							});
						},
						error: function () {
							alert("ZIP Download Error");
						}
					});
				});
			},

			hextob64: function (str) {
				var targetStr = str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "");
				targetStr = targetStr.split(" ");
				targetStr = new Uint8Array(targetStr).reduce(function (data, byte) {
					return data + String.fromCharCode(byte);
				}, '');
				targetStr = btoa(targetStr);
				return targetStr;
			}

		});
	});
