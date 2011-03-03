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
        // jQuery will get the width from documentElement
        // the width is not including scrollbar width
        // do not use window.innerWidth as it includes scrollbar
        var viewPortWidth = $(window).width();
        for (var l = settings.length; l--; ) {
            var s = settings[l];
            if (s.width < viewPortWidth) {
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