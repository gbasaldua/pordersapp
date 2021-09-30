sap.ui.define([

], function () {
    'use strict';

    return {

        formatStatus: function (sValue) {
            switch (sValue) {
                case "R": return sap.ui.core.ValueState.Success; break;
                default: return sap.ui.core.ValueState.None; break;
            }
        }

    };

});