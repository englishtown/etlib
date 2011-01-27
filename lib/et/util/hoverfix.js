/*!require: et.util */
!function($){
	
	function init(){
		
		// work around ie6 hover
		$('a').live('mouseover', function () {
			var self = $(this);
			if (self.attr('href')) return;
			$(this).attr('href', '#_self');
		}).live('mouseout', function () {
			var self = $(this);
			if (self.attr('href') != '#_self') return;
			$(this).removeAttr('href');
		});
	}
	
	et.util.hoverfix = $.browser.msie && $.browser.version <= 6 ? init : $.noop;
	
}(jQuery);

