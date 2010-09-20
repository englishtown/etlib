/*!require: et , et.util */
/*
Method: initMvcAdditionalEvents

This hack will attach a window.onValidationFail event on Sys.Mvc.FieldContext.prototype.validate
Fire an event when validation fail.
*/
(function(){
	et.util.initMvcAdditionalEvents = function(){
		// hack, hook to FieldContext.validate, fire an event when validation fail
		if (Sys == null ||
		Sys.Mvc == null ||
		Sys.Mvc.FieldContext == null){
			// fail silently if mvc is not enabled.
			return;
		}
		
		var baseValidate = Sys.Mvc.FieldContext.prototype.validate;
		Sys.Mvc.FieldContext.prototype.validate = function(){
			var errs = baseValidate.apply(this, arguments);

			var callbackName = 'onValidationFail';

			// fire global event: onValidationFail
			if (typeof window[callbackName] != 'undefined') {
				try{
					window[callbackName].call(this, errs);
				}
				catch(ex){
				}
			}
			
			return errs;
		};
	};
})();