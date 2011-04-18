/*!require: et.ui.lightbox , et.util , et.util.config , jquery.support */
/*
Method: et.util.initVideoLinks

Start to initialize all video links under '.et_interior_top_videolink'.
When link was clicked, an lightbox will be poped up and starting to play video.
Also when querystring contains video information display the relavent video on page load.
Note: Currently only supports youtube links.

Parameters:
contentRef - A jQuery style selector which referenced to a wrapper element, the wrapper element will be inserted into lightbox.
any element that in wrapper element has a class named 'et_util_video_container' will be replaced with flash player.
*/
(function (et, $) {
    var uniqueTempId = '__this_is_a_very_long_id_that_should_be_unique';
    var videoContainerClass = 'et_util_video_container'
    // hardcoded video container class name
    var containerSelector = '.' + et.util.config.classes.video.container + ' a, a.' + et.util.config.classes.video.link;

    et.util.initVideoLinks = function (contentRef, noFlashRef) {
        var content = $(contentRef);
        var noFlash = $(noFlashRef);
        var callHandleReady = function () {
            handleReady(content, noFlash);
        };
        
        if (!$.isReady) {
            $(callHandleReady);
            $(window).load(function(){
                handleQueryString(content, noFlash);
            });
        }
        else {
            callHandleReady();
        }
    };
    
    // get video content from the querystring and display the video popup.
    function handleQueryString(content, noFlash){
        var qs = new Querystring();
        videoObject.site = qs.get("vsite", "").toLowerCase();
        videoObject.para1 = qs.get("vpara1", "");
        videoObject.para2 = qs.get("vpara2", "");

        if (videoObject.site !== "" && videoObject.para1 !== "") {

            showVideo(content, noFlash);
            
            trackOmniture("Salespages:Video:System");

        }
    }

    function handleReady(ref, noFlash) {
        $(containerSelector).each(function (i, el) {
            var target = $(el);
            
            // skip links that not containing youtube
            if (!target.attr('href').indexOf('youtube') < 0) return;

            target.data('et.util.lightBoxContentSelector', ref);
            target.data('et.util.lightBoxNoFlashSelector', noFlash);
            target.click(handleLinkClick);
        });
    }
    
    function showVideo(content, noFlash, link){
        if (content.comments().length > 0){
            content.html(content.comments().html());
        }

        var videoIframe, videoId;
        // find video container
        var videoContainer = content.find('.' + videoContainerClass);
        
        var idbakup = videoContainer.attr('id');

        // give it a temp id so that swfobject.embedSWF can work
        videoContainer.attr('id', uniqueTempId);
        
        // if it is youtube, then we can use its html5 api
        if (swfobject.getFlashPlayerVersion().major > 0 ||
            (jQuery.support.html5Video && link.indexOf('youtube.com') > 0)){
            
            if (jQuery.support.html5Video){
                var pAutoplay = (window.orientation != null? '': 'autoplay=1');
                // todo: refactor getURLValue
                // caveat: swfVideoPlayer will call into it also
                if ((videoId == null || videoId == false) && window.videoObject && videoObject.para1){
                    videoId = videoObject.para1;
                }
                videoId = getURLValue(link, 'v');
                videoIframe = $('<iframe id="' + idbakup + '" class="youtube-player et_video_placeHolder"' +
                    ' type="text/html" src="http://www.youtube.com/embed/' + videoId + '?' + pAutoplay + '" frameborder="0"></iframe>');
                videoContainer.replaceWith(videoIframe);
            }
            else{
                // TODO: refactor swfVideoPlayer
                swfVideoPlayer(uniqueTempId, link);
            }
            
            // remove the temp id
            videoContainer.attr('id', idbakup);

            // create lightbox
            var lightbox = new et.ui.lightbox({
                customName: 'et_js_lightbox_video',
                target: content,
                onHide: function () {
                    // remove iframe
                    if (videoIframe && videoIframe.remove){
                        videoIframe.replaceWith(videoContainer).remove();
                    }
                    // dispose when lightbox closed
                    lightbox.dispose();
                }
            });
            lightbox.show();
        }
        else{
            if (noFlash.comments().length > 0){
                noFlash = $(noFlash.comments().html());
            }
            var overlay = new et.ui.overlay({
                customName: 'et_js_lightbox_video',
                onHide: function () {
                    // dispose when lightbox closed
                    overlay.dispose();
                }
            }); 
            
            noFlash.appendTo(overlay.container).show();
            overlay.show();
            
            var top = (et.dom.getEnv().clientHeight - $(noFlash).outerHeight(true)) / 2;
            top = top > 0 ? top : 0;
            
            noFlash.css({
                'marginTop': top
            }).click(function(evt){
                // prevent event popup to mask layer 
                evt.stopPropagation();
            });
            
            destroyOverlay = function(){
                overlay.hide();
                overlay.onHide(function(){
                    overlay.dispose();
                });
                noFlash.css('marginTop', 0);
            };
            
            overlay._mask.click(destroyOverlay);
            overlay.container.click(destroyOverlay);
        }
    }

    function handleLinkClick(evt) {
        var target = $(this);
        var ref = target.data('et.util.lightBoxContentSelector');
        var noFlash = target.data('et.util.lightBoxNoFlashSelector');
        
        // tipref contains the selector to lightbox content
        var tipref = $(target.attr('tipref'));

        if (tipref.length < 1 && ref.length > 0) {
            tipref = ref;
        }
        else if (tipref.length < 1 && ref.length < 1) {
            // create an empty container
            tipref = $('<div><object type="application/x-shockwave-flash" class="' + videoContainerClass + '"></object></div>').hide().appendTo(document.body);
        }

        showVideo(tipref, noFlash, target.attr('href'));
        
        evt.preventDefault();
        evt.returnValue = false;
    }
    
    et.util.showVideoLightbox = showVideo;
})(et, jQuery);