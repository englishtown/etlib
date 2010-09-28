/*!require: et , et.util */
/*
Method: initMvcAdditionalEvents

This hack will attach a window.onValidationFail event on Sys.Mvc.FieldContext.prototype.validate
Fire an event when validation fail.
*/
(function(et, $){
	var inited = false;
	
	function fireEvent(errs){
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
	}
	et.util.initMvcAdditionalEvents = function(){
		// original mvc validation hook
		if (window.Sys){
			// hack, hook to FieldContext.validate, fire an event when validation fail
			if (window.Sys == null ||
			Sys.Mvc == null ||
			Sys.Mvc.FieldContext == null ||
			inited === true){
				// fail silently if mvc is not enabled.
				return;
			}
			
			var baseValidate = Sys.Mvc.FieldContext.prototype.validate;
			Sys.Mvc.FieldContext.prototype.validate = function(){
				var errs = baseValidate.apply(this, arguments);

				fireEvent(errs);
				
				return errs;
			};
		}
		// check if we are using jQuery validator
		else if ($.validator){
			// for backward compatibility
			jQuery('form').each(function(){
				var validator = $(this).validate();
				validator.settings.showErrors = function(errorMap, errorList){
					this.defaultShowErrors();
					fireEvent(errorList);
				};
			});
		}
		else return;
		
		inited = true;
	};
})(et, jQuery);