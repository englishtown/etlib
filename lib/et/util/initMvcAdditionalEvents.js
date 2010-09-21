/*!require: et , et.util */
/*
Method: initMvcAdditionalEvents

This hack will attach a window.onValidationFail event on Sys.Mvc.FieldContext.prototype.validate
Fire an event when validation fail.
*/
(function(et, $){
	var inited = false;
	et.util.initMvcAdditionalEvents = function(){
		// hack, hook to FieldContext.validate, fire an event when validation fail
		if (Sys == null ||
		Sys.Mvc == null ||
		Sys.Mvc.FieldContext == null ||
		inited === true){
			// fail silently if mvc is not enabled.
			return;
		}
		
		var baseValidate = Sys.Mvc.FieldContext.prototype.validate;
		Sys.Mvc.FieldContext.prototype.validate = function(){
			var errs = baseValidate.apply(this, arguments);

			var callbackName = 'onValidationFail';

			// fire global event: onValidationFail
			if (typeof window[callbackName] != 'undefined' && errs != null && errs.length > 0) {
				try{
					window[callbackName].call(this, errs);
				}
				catch(ex){
				}
				$(window).trigger('validationFail');
			}
			
			return errs;
		};
		
		inited = true;
	};
})(et, jQuery);