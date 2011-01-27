/*!require: */

/**
 * @namespace support
 * Containing additional feature detection results and code.
 */

!function($){ 
    var spt = jQuery.support;
    
    $(function(){
        function canFix(){
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
        };
        
        /**
         * @property fixed
         * true to indicate current brower supports the css 'position: fixed', otherwise false
         */
        spt.positionFixed = canFix();
    });

}(jQuery);
