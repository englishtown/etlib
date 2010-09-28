/*!require: et.ui.lightbox , et.util */
/*
Method: et.util.initVideoLinks

Start to initialize all video links under '.et_interior_top_videolink'.
When link was clicked, an lightbox will be poped up and starting to play video.
Note: Currently only supports youtube links.

Parameters:
contentRef - A jQuery style selector which referenced to a wrapper element, the wrapper element will be inserted into lightbox.
any element that in wrapper element has a class named 'et_util_video_container' will be replaced with flash player.
*/
(function (et, $) {
    var uniqueTempId = '__this_is_a_very_long_id_that_should_be_unique';
    var videoContainerClass = 'et_util_video_container'
    // hardcoded video container class name
    var containerSelector = '.et_interior_top_videolink a, a.et_videolink';

    et.util.initVideoLinks = function (contentRef) {
        var callHandleReady = function () {
            handleReady($(contentRef));
        };

        if (!$.isReady) {
            $(callHandleReady);
        }
        else {
            callHandleReady();
        }
    };

    function handleReady(ref) {
        $(containerSelector).each(function (i, el) {
            var target = $(el);
			
            // skip links that not containing youtube
            if (!target.attr('href').indexOf('youtube') < 0) return;

            target.data('et.util.lightBoxContentSelector', ref);
            target.click(handleLinkClick);
        });
    }

    function handleLinkClick(evt) {
        var target = $(this);
        var ref = target.data('et.util.lightBoxContentSelector');

        // tipref contains the selector to lightbox content
        var tipref = $(target.attr('tipref'));

        if (tipref.length < 1 && ref.length > 0) {
            tipref = ref;
        }
        else if (tipref.length < 1 && ref.length < 1) {
            // create an empty container
            tipref = $('<div><object type="application/x-shockwave-flash" class="' + videoContainerClass + '"></object></div>').hide().appendTo(document.body);
        }

        // find video container
        var videoContainer = tipref.find('.' + videoContainerClass);

        var idbakup = videoContainer.attr('id');

        // give it a temp id so that swfobject.embedSWF can work
        videoContainer.attr('id', uniqueTempId);

        // TODO: refactor swfVideoPlayer
        swfVideoPlayer(uniqueTempId, target.attr('href'));

        // remove the temp id
        videoContainer.attr('id', idbakup);

        // create lightbox
        var lightbox = new et.ui.lightbox({
            customName: 'et_js_lightbox_video',
            target: tipref,
            onHide: function () {
                // dispose when lightbox closed
                lightbox.dispose();
            }
        });
        lightbox.show();
		
        evt.preventDefault();
        evt.returnValue = false;
    }
})(et, jQuery);