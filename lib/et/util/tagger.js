/*!require: et.util */
/*
	Ctor: tagger
	tagger adds classes such as browser name, version, country, language to body element, helper properly styling when page display in different browse
*/
!function($){
	// ************
	// * Variables
	// ************
	var KEY_COUNTRY = 'ctr';
	var KEY_LANG = 'lng';
	var KEY_DEBUG = 'debug';
	var KEY_PARTNER = 'p';
	
	// ************
	// * Private Functions
	// ************
	
	function compareKey(key1, key2){
		if (!key1) return false;
		return key1.trim().toUpperCase() == key2.toUpperCase();
	};
	
	// get country, language, partner info from cookie
	function getCookieInfo(){
		var ret = {};
		var cPair = document.cookie.toString().split(';');
		for(var i in cPair){
			
			var kv = cPair[i].split('=');
			
			if (kv.length <= 0) continue;
			
			var key = kv[0].trim();
			if (compareKey(key, KEY_COUNTRY)){
				kv.splice(0,1);
				ret[KEY_COUNTRY] = kv.join('=');
			}
			else if (compareKey(key, KEY_LANG)){
				kv.splice(0,1);
				ret[KEY_LANG] = kv.join('=');
			}
			else if (compareKey(key, KEY_DEBUG)){
				// looking into for debug section
				kv.splice(0,1);
				var value = kv.join('=');
				var debugs = value.split('|');
				for(var i = debugs.length; i--;){
					if (debugs[i].indexOf(':') < 0) continue;
					var debugkv = debugs[i].split(':');
					
					// if it is key value pair
					if (debugkv.length > 1){
						if (compareKey(debugkv[0], KEY_PARTNER)){
							debugkv.splice(0, 1);
							ret[KEY_PARTNER] = debugkv.join(':');
						}
					}
				}
			}
		}
		
		return ret;
		
	};
	
	
	et.util.tagger = {
		tag: function(options){
			var s = {
				more: false
			};
			
			s = $.extend(s, options);
			
			var target = $(document.documentElement);
			
			var binfo = $.uaMatch(navigator.userAgent);
			var browser = binfo.browser;
			
			// add basic browser name
			target.addClass(browser);
			
			// class is used for css styling not js handling, so lets use documentMode rather then version.
			if (binfo.browser == 'msie' && document.documentMode) binfo.version = document.documentMode + '';
			
			var major = Math.floor(binfo.version);
			// get major when there is a dot
			if (binfo.version.indexOf('.') >= 0){
				major = Math.floor(binfo.version.substring(0, binfo.version.indexOf('.')));
			}
			
			browser += major;
			target.addClass(browser);
			
			if (s.more){
				// add country info and language info to root element
				var etInfo = getCookieInfo();
				target.addClass('et_ctr_' + etInfo.ctr);
				target.addClass('et_lng_' + etInfo.lng);
			}
		}
	};
}(jQuery);