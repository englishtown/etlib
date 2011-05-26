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
	Method: String.prototype.isNOE
	
	Return true if current string is null or empty
	*/
	String.isNOE || (String.isNOE = function(str) {
		if (str == null || str == '')
			return true;
		return false;
	});
		
    /*
    Method: Function.prototype.bind

    Binds function execution context to specified obj, locks its execution scope to an object.

    Parameters:
    Context - The context to bind to.
    */
    Function.prototype.bind || (Function.prototype.bind = function (context) {
        var slice = Array.prototype.slice;
        var __method = this, args = slice.call(arguments);
        args.shift();
        return function () {
            return __method.apply(context, args.concat(slice.call(arguments)));
        };
    });
	
	/*
	Method: Number.prototype.toCurrency
	
	Return a string that with commas seperated every 3 numbers.
	*/
	Number.prototype.toCurrency || (Number.prototype.toCurrency = function(){
		var formated = this.toFixed(2);
		var floatIndex = formated.indexOf('.');
		var chars = formated.split('');

		for(var i = 0; i < chars.length; i++){
			if (i >= floatIndex - 1){
				break;
			}

			if ((floatIndex - 1 - i) % 3 == 0)
				chars[i] = chars[i] + ',';
		}

		formated = chars.join('');
		return formated;
	});

    /*
     * @function Array.prototype.indexOf
     * ECMAScript 5 compatible hacks for array
     */
    Array.prototype.indexOf || (Array.prototype.indexOf = function(searchElement /*, fromIndex */){
        "use strict";

        if (this === void 0 || this === null)
          throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0)
          return -1;

        var n = 0;
        if (arguments.length > 0)
        {
          n = Number(arguments[1]);
          if (n !== n) // shortcut for verifying if it's NaN
            n = 0;
          else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }

        if (n >= len)
          return -1;

        var k = n >= 0
              ? n
              : Math.max(len - Math.abs(n), 0);

        for (; k < len; k++)
        {
          if (k in t && t[k] === searchElement)
            return k;
        }
        return -1;
    });
    
})();
