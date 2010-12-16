/*!require: et.ui */
/*
Ctor: et.ui.base

base constructor for all ui components
*/
!function($){
	var ctor = function(options){
		
		this.opts = {};
        $.extend(this.opts, this._defaultOptions, options);
		
		// wrap target with jquery object
		if (this.opts && this.opts.target){
			this.opts.target = $(this.opts.target);
		}
		
		// create dom wrapper for current ui element
		this.dom = null;
		if (this._domType == 2){
			this.dom = $('<div></div>');
		}
		else{
			this.dom = $('<span></span>');
		}
	};
	var p = ctor.prototype;
	/*
		1 = inline
		2 = block
	*/
	p._domType = 2;
	p._defaultOptions = null;
	et.ui.base = ctor;
}(jQuery);