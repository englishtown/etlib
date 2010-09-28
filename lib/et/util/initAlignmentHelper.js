/*!require: et.util , jquery.dropTo */
/*
Method: initAlignmentHelper

Helps to automatcailly positioning for elements which has an et_js_vmiddle or et_js_vbottom class to corresponding vertical middle or bottom position.

Known issue: when the container has layer is in ie 7, left will wrong.
*/
(function(et, $){
	// et_interior_section_img_top et_interior_section_img_middle et_interior_section_img_bottom
	var tSelector = '.et_interior_section_img_top', mSelector = '.et_interior_section_img_middle', bSelector = '.et_interior_section_img_bottom';
	var uncoverSelector = '.et_interior_section_uncover';
	
	function reposition(dom, func){
		var el = $(dom);
		var target = el.siblings().tallest();
		var minHeightProp = 'min-height';
		
		el
			.siblings()
				.css({
					'position': 'relative'
				})
				.end()
			.parent().css({
				'position': 'relative'
			});
		var left = 0;
		
		left += el.position().left;
		
		if ($.browser.msie && $.browser.version < 7){
			el.css({
				'float': 'none'
			});
			minHeightProp = 'height';
		}
		
		el.dropTo(target)[func]().css('left', left);
		if (el.parent().outerHeight(true) <= el.outerHeight(true)){
			var css = {};;
			css[minHeightProp] = el.outerHeight(true);
			// expand parent high
			el.parent().css(css);
		}
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
		
		$(uncoverSelector).css('position', 'relative');
	};
	
})(et, jQuery);