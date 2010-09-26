/*!require: et.util , jquery.dropTo */
/*
Method: initAlignmentHelper

Helps to automatcailly positioning for elements which has an et_js_vmiddle or et_js_vbottom class to corresponding vertical middle or bottom position.
*/
(function(et, $){
	// et_interior_section_img_top et_interior_section_img_middle et_interior_section_img_bottom
	var tSelector = '.et_interior_section_img_top', mSelector = '.et_interior_section_img_middle', bSelector = '.et_interior_section_img_bottom';
	
	function reposition(dom, func){
		var el = $(dom);
		var target = el.siblings().tallest();
		
		el
			.siblings()
				.css({
					'position': 'relative'
				})
				.end()
			.parent().css('position', 'relative');
			
		if ($.browser.msie && $.browser.version < 7){
			el.siblings.css({
				'float': 'none' // clear float otherwise ie6 will calcuate wrong position when el is absoluted
			});
		}
		var left = el.position().left;
		el.dropTo(target)[func]().css('left', left);
	}
	
	et.util.initAlignmentHelper = function(){
		var tel = $(tSelector), mel = $(mSelector), bel = $(bSelector);
		
		tel.each(function(i, dom){
			reposition(dom, 'innerTop');
		});
		
		mel.each(function(i, dom){
			reposition(dom, 'atMiddle');
		});
		bel.each(function(i, dom){
			reposition(dom, 'innerBottom');
		});
	};
	
})(et, jQuery);