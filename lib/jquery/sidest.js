/*
JQueryPlugin: jQuery.fn.widest

TODO: JQueryPlugin: jQuery.fn.thinnest

TODO: JQueryPlugin: jQuery.fn.tallest

TODO: JQueryPlugin: jQuery.fn.shortest

*/
(function($){
	$.fn.extend({
		widest: function(){
			var max = this.eq(0);
			this.each(function(i, dom){
				var el = $(dom);
				if (el.width() > max.width()){
					max = el;
				}else if(el.width() === max.width(){
					max.add(el);
				}
			});
			
			return max;
		}
	});
	
})(jQuery);