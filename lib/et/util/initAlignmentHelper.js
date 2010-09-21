/*!require: et.util , jquery.dropTo */
/*
Method: initAlignmentHelper

Helps to automatcailly positioning for elements which has an et_js_vmiddle or et_js_vbottom class to corresponding vertical middle or bottom position.
*/
(function(et, $){
	// et_interior_section_img_top et_interior_section_img_middle et_interior_section_img_bottom
	var mSelector = '.et_interior_section_img_middle', bSelector = '.et_interior_section_img_bottom';
	
	function reposition(dom, func){
		var el = $(dom);
		var parent = el.parent();
		el.siblings().css('position', 'relative');
		el.dropTo(parent)[func]();
	}
	
	et.util.initAlignmentHelper = function(){
		var mel = $(mSelector), bel = $(bSelector);
		
		mel.each(function(i, dom){
			reposition(dom, 'atMiddle');
		});
		bel.each(function(i, dom){
			reposition(dom, 'innerBottom');
		});
	};
	
})(et, jQuery);