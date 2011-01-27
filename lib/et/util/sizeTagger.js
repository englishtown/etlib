/*!require: et.util */
/*
Tag the root element when window resized to specified size range
*/
!function($){

	// ***********
	// * Variables
	// ***********
	var defaultSettings = {
		before: '.et_tags_screen_small',
		width: 1184,
		after: '.et_tags_screen_large',
		status: 0
	};
	
	var settings = [];
	
	var root = $(document.documentElement);
	
	// ***********
    // * Handlers
    // ***********
    function handleWinResize() {
        var box = getWinSize();
        for (var l = settings.length; l--; ) {
            var s = settings[l];
            if (s.width < box.clientWidth) {
                if (s.status == 1) continue;
                s.status = 1;
                root.addClass(s.after).removeClass(s.before);
            }
            else {
                if (s.status == 2) continue;
                s.status = 2;
                root.addClass(s.before).removeClass(s.after);
            }
        }
    };
	
	function getWinSize(){
		var clientWidth = 0,
			clientHeight = 0;
		var html = document.documentElement;
		if (typeof (window.innerWidth) == 'number') {
			//Non-IE
			clientWidth = window.innerWidth;
			clientHeight = window.innerHeight;
		} else if (html && (html.clientWidth || html.clientHeight)) {
			//IE 6+ in 'standards compliant mode'
			clientWidth = html.clientWidth;
			clientHeight = html.clientHeight;
		} 
		
		return {
			clientWidth: clientWidth,
			clientHeight:clientHeight
		};

	};
	
	
	// ***********
	// * Attach Event Handler
	// ***********
	$(window).resize(handleWinResize);
	
	
	et.util.sizeTagger = {
		addSizeMonitor : function(opts){
			if (!opts) return;
			var s = $.extend(s, defaultSettings, opts);
			settings.push(s);
			
			handleWinResize();
		}
	};
}(jQuery);