/*
Namespace: hacks

Below are extension methods for native types in JavaScript.
*/
// hacks
(function () {
    /*
    Method: String.prototype.macro
            
    Replaces asp.net style placeholder (<%=sample %>) with specified value

    Parameters:
    macro - Specify the name of the macro
    value - The value to replace the macro.
    */
    String.prototype.macro || (String.prototype.macro = function (macro, value) {
        var re = new RegExp("<%=" + macro + " %>", "g");
        return this.replace(re, value);
    });

	/*
	Method: String.prototype.trim
	
	Trim specified chars at the start and the end of current string.
	*/
	String.prototype.trim || (String.prototype.trim = function(aChar) {
		if (aChar == null)
			aChar = '\\s';
		var re = new RegExp('(^' + aChar + '*)|(' + aChar + '*$)', 'g');
		return this.replace(re, "");
	});
		
    /*
    Method: Function.prototype.bind

    Binds function execution context to specified obj, locks its execution scope to an object.

    Parameters:
    Context - The context to bind to.
    */
    Function.prototype.bind || (Function.prototype.bind = function (context) {
        var __method = this;
        return function () {
            return __method.apply(context, arguments);
        }
    });

})();