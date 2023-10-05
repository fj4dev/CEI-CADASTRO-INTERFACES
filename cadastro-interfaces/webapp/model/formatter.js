sap.ui.define([], function () {
    "use strict";
    return {

        FormatSuccess: function (inValor) {
			
			return inValor > 0 ? "Success" : "None";

		},

        formatHighlightBinding: function (IsMapped) {

            return IsMapped ? "Success" : "None";

        }
                
    };
});