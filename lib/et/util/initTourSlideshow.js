/*!require: jquery.comments , et.ui.lightbox , et.ui.slide , et.util , et.util.initVideoLinks */
/*
Method: et.util.initTourSlideshow

Start to initialize all video links under '.et_interior_top_videolink'.
When link was clicked, an lightbox will be poped up and starting to play video.
Note: Currently only supports youtube links.

Parameters:
contentRef - A jQuery style selector which referenced to a wrapper element, the wrapper element will be inserted into lightbox.
any element that in wrapper element has a class named 'et_util_video_container' will be replaced with flash player.
*/
(function (et, $) {
	var bInit = false;
	var singleton = null;
    function init(contentRef) {
		if (bInit) return;
		var template = $('#et_tour_wrap_template').comments().html()
		var slideDom = $(template);
        var slide = new et.ui.slide({
            target: slideDom,
            slideSelector: '.et_tour_item',
            indicatorSelector: '.et_tour_oper_dots > ol > li',
            indicatorActiveClass: 'active',
			indicatorInteractable: false,
            nextSelector: '.et_slideshow_btn_next',
            lastSelector: '.et_slideshow_btn_last'
        });
        var lightbox = new et.ui.lightbox({
            target: slide._dom,
            customName: 'et_js_lightbox_largest',
			indicatorInteractAction: "click"
            //onHide: function(){
            //    lightbox.dispose();
            //}
        });
        slide.show();
        lightbox.slide = slide;
        bInit = true;
        return lightbox;
    }
	et.util.initTourSlideshow = function(){
		return {
			show: function(){
				// singleton and lazyload
				if (singleton)
					singleton.show();
				else{
					singleton = init();
					singleton.show();
				}
			}
		}
	};

})(et, jQuery);
