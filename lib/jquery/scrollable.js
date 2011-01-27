/*!require: */
!function($){
	var settings = {
		factor: 8
	};
	
	function handleScroll(evt){
		var self = $(this);
		var s = getSettings(self);
		
		if (s.pause) return;
		
		// TODO: move to new mousewheel plugin for jquery
		var evnt = evt.originalEvent;
		var delta = 0;
		if (evnt.wheelDelta) { /* IE/Opera. */
                delta = evnt.wheelDelta/120;
                /** In Opera 9, delta differs in sign as compared to IE.
                 */
                if ($.browser.opera)
                        delta = -delta;
        } else if (evnt.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -evnt.detail/3;
        }
		
		this.scrollTop = parseInt(this.scrollTop) - delta * s.factor;
		evt.preventDefault();
	};
	
	function handleTouchStart(evt) {
        var self = $(this);
        var cur = evt.originalEvent.touches[0].pageY;
        var s = getSettings(self);
        s._lastTouchPoint = cur;

        
    };

    function handleTouchMove(evt) {
        var self = $(this);
        var s = getSettings(self);
		
		if (s.pause) return;
		
        var cur = evt.originalEvent.touches[0].pageY;

        var diff = cur - s._lastTouchPoint;
        if (diff != 0) {
            this.scrollTop = parseInt(this.scrollTop) - diff;
            s._lastTouchPoint = cur;
        }

        evt.preventDefault();
    };

    function handleTouchEnd(evt) {
        
    };
	
	function getSettings(jObj){
		return jObj.data('jQuery.fn.scrollable.factor');
	};
	
	function setSettings(jObj, value){
		return jObj.data('jQuery.fn.scrollable.factor', value);
	};
	
	$.fn.scrollable = function(options){
		var s = {
			pause: false
		};
		$.extend(s, settings, options);
		
		setSettings(this, s);
		this.bind('DOMMouseScroll', handleScroll);
		this.bind('mousewheel', handleScroll);
		this.bind('touchstart', handleTouchStart);
		this.bind('touchmove', handleTouchMove);
		this.bind('touchend', handleTouchEnd);
		
	};
	
	$.fn.scrollablePause = function(){
		getSettings(this).pause = true;
	};
	
	$.fn.scrollableResume = function(){
		getSettings(this).pause = false;
	};
}(jQuery);