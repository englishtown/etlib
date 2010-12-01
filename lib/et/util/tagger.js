/*!require: et.util */
/*
	Ctor: tagger
	tagger adds classes such as browser name, version, country, language to body element, helper properly styling when page display in different browse
*/
!function($){
	et.util.tagger = {
		tag: function(){
			var binfo = $.uaMatch(navigator.userAgent);
			var browser = binfo.browser;
			$(document.body).addClass(browser);
			
			// class is used for css styling not js handling, so lets use documentMode rather then version.
			if (binfo.browser == 'msie' && document.documentMode) binfo.version = document.documentMode;
			
			browser += Math.floor(binfo.version);
			$(document.body).addClass(browser);
		}
	};
}(jQuery);