/*!require: */

/**
 * @namespace jQuery.support
 * Containing additional feature detection results and code.
 */

!function($){ 
    var spt = jQuery.support;
    
    // containing all detection functions
    var testers = {
        html5Video: function() {
            var elem = doc.createElement('video'),
                bool = !!elem.canPlayType;
            
            if (bool){  
                bool      = new Boolean(bool);  
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"');
                
                // Workaround required for IE9, which doesn't report video support without audio codec specified.
                //   bug 599718 @ msft connect
                var h264 = 'video/mp4; codecs="avc1.42E01E';
                bool.h264 = elem.canPlayType(h264 + '"') || elem.canPlayType(h264 + ', mp4a.40.2"');
                
                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"');
            }
            return bool;
        },
        cssFixed: function canFix(){
            var ret = false;
            var container = $(document.body), el = $('<div />');
            var elementTop, originalHeight, originalScrollTop;
            
            if (!el.get(0).getBoundingClientRect) return false;
                
            el.html ('x')
                .css({
                    position:'fixed',
                    top:100
                })
                .appendTo(container);

            originalHeight = container.height(),
                originalScrollTop = container.scrollTop();

            container.height('3000')
                .scrollTop(500);

            elementTop = el.get(0).getBoundingClientRect().top;
            
            // revert to original state
            container.height(originalHeight)
                .scrollTop(originalScrollTop);
            el.remove();
            
            ret = (elementTop === 100);
            
            return ret;
        }
    };
    
    /**
     * @property html5Video
     * True to indicate current browser supports html5video
     */
    spt.html5Video || (spt.html5Video = testers.html5Video);
    
    // contains detection that need to be delayed 
    $(function(){
        
        /**
         * @property fixed
         * true to indicate current brower supports the css 'position: fixed', otherwise false
         */
        spt.positionFixed || (spt.positionFixed = testers.cssFixed());
    });

}(jQuery);
