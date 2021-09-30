sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"com/porders/pordersapp/model/formatter"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, History, UIComponent, formatter) {
		"use strict";

		return Controller.extend("com.porders.pordersapp.controller.Details", {

			formatter: formatter,

			onInit: function () {
				var oRouter = UIComponent.getRouterFor(this);

				oRouter.getRoute("Detail").attachPatternMatched(this.onRouteMatched, this);
			},

			onRouteMatched: function (oEvent) {
				var poN = oEvent.getParameter("arguments").PONumber;

				var sPath = this.getView().getModel().createKey("HeaderSet", {
					PONumber: poN
				});

				this.getView().bindElement("/" + sPath);
			},

			onNavBack: function () {
				var oHistory, sPreviousHash;

				oHistory = History.getInstance();
				sPreviousHash = oHistory.getPreviousHash();

				if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					this.getRouter().navTo("Home", {}, true /*no histpry*/);
				}
			}

		});
	});
