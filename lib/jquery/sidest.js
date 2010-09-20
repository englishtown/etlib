/*!require:  */
/*
JQueryPlugin: jQuery.fn.widest

TODO: JQueryPlugin: jQuery.fn.thinnest

TODO: JQueryPlugin: jQuery.fn.tallest

TODO: JQueryPlugin: jQuery.fn.shortest

*/
(function($){
	var findMax = function(prop){
		var max = this.eq(0);
		this.each(function(i, dom){
			var el = $(dom);
			if (el[prop]() > max[prop]()){
				max = el;
			}else if(el[prop]() === max[prop]()){
				max.add(el);
			}
		});
		
		return max;
	}
	$.fn.extend({
		widest: function(){
			return findMax.apply(this, ['width']);
		}, 
		tallest: function(){
			return findMax.apply(this, ['height']);
		}
	});
	
})(jQuery);

