/*!require: et.util */
/*
	Ctor: tagger
	tagger adds classes such as browser name, version, country, language to body element, helper properly styling when page display in different browse
*/
!function($){
	et.util.tagger = {
		tag: function(options){
			var s = {
				more: false
			};
			
			s = $.extend(s, options);
			var binfo = $.uaMatch(navigator.userAgent);
			var browser = binfo.browser;
			
			// add basic browser name
			$(document.documentElement).addClass(browser);
			
			// class is used for css styling not js handling, so lets use documentMode rather then version.
			if (binfo.browser == 'msie' && document.documentMode) binfo.version = document.documentMode + '';
			
			var major = Math.floor(binfo.version);
			// get major when there is a dot
			if (binfo.version.indexOf('.') >= 0){
				major = Math.floor(binfo.version.substring(0, binfo.version.indexOf('.')));
			}
			
			browser += major;
			$(document.documentElement).addClass(browser);
			
			if (s.more){
				// add country info and language info to body
				
			}
		}
	};
}(jQuery);