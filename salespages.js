/*
Namespace: hacks

Below are extension methods for native types in JavaScript.
*/
// hacks
(function () {
    /*
    Method: String.prototype.macro
            
    Replaces asp.net style placeholder (<%=sample %>) with specified value

    Parameters:
    macro - Specify the name of the macro
    value - The value to replace the macro.
    */
    String.prototype.macro || (String.prototype.macro = function (macro, value) {
        var re = new RegExp("<%=" + macro + " %>", "g");
        return this.replace(re, value);
    });

    /*
    Method: Function.prototype.bind

    Binds function execution context to specified obj, locks its execution scope to an object.

    Parameters:
    Context - The context to bind to.
    */
    Function.prototype.bind || (Function.prototype.bind = function (context) {
        var __method = this;
        return function () {
            return __method.apply(context, arguments);
        }
    });

})();
/*
Namespace: et

The root namespace for English Town client code
*/
et = {};
/*!require: et */
/*
Namespace: et.dom

Containing dom operation utilities.
*/
et.dom = {};

/*
Method: et.dom.getEnv

Return common environment variables, including client height/width and body height/width/scrollHeight.
*/
et.dom.getEnv = function () {
    var msie = navigator.userAgent.toLowerCase().indexOf("msie") != -1;
    var clientWidth = 0, clientHeight = 0;
    var body = document.body, html = document.documentElement;
    if (typeof (window.innerWidth) == 'number') {
        //Non-IE
        clientWidth = window.innerWidth;
        clientHeight = window.innerHeight;
    } else if (html && (html.clientWidth || html.clientHeight)) {
        //IE 6+ in 'standards compliant mode'
        clientWidth = html.clientWidth;
        clientHeight = html.clientHeight;
    } else if (body && (body.clientWidth != null || body.clientHeight != null)) {
        //IE 4 compatible
        clientWidth = body.clientWidth;
        clientHeight = body.clientHeight;
    }

    var sLeft = 0, sTop = 0, bWidth = 0, bHeight = 0;
    if (typeof (window.pageYOffset) == 'number') {
        //Netscape compliant
        sTop = window.pageYOffset;
        sLeft = window.pageXOffset;
        bHeight = body.scrollHeight;
        bWidth = body.scrollWidth;
    } else if (body && (body.scrollLeft || body.scrollTop)) {
        //DOM compliant
        sTop = body.scrollTop;
        sLeft = body.scrollLeft;
        bHeight = body.scrollHeight;
        bWidth = body.scrollWidth;
    } else if (html && (html.scrollLeft != null || html.scrollTop != null)) {
        //IE6 standards compliant mode
        sTop = html.scrollTop;
        sLeft = html.scrollLeft;
        bHeight = html.scrollHeight;
        bWidth = html.scrollWidth;
    }

    return { bodyHeight: bHeight, bodyWidth: bWidth, bodyScrollTop: sTop, bodyScrollLeft: sLeft,
        clientWidth: clientWidth, clientHeight: clientHeight
    };
};

(function (et, $) {

    var bInit = false, indicatorKey = 'et.dom.fix.data', queue = [];

    /* 
    Method: et.dom.fix

    "position: fixed" for ie6, you can also invoke it in "jQuery way": $(dom).fixPosition()
    */
    et.dom.fix = function (obj) {
        // fail silently if it is not applicable
        if (obj.length == null ||
            $.browser.msie != true ||
            $.browser.version > 6 ||
            obj.css('position').toLowerCase() != 'static') {
            return this;
        }

        queue.push(obj
            .css({
                position: 'absolute',
                top: $(window).scrollTop(),
                left: $(window).scrollLeft()
            })
            .data({
                indicatorKey: true
            }));

        // update: below code was commented out because it is fixed by a css hack -- setting body{height: 100%}

        // we should set its height when it is percentage, 
        // because position:absolute in ie6 considers the height of parent node as 100%, 
        // if parent height was not defined, it set height to auto, ie6 sucks
        //if (obj.css('height').indexOf('%') > -1){
        //    var percentage = parseInt(obj.css('height'));
        //    obj.data('expandHeightToPercentage', percentage)
        //        .css('height', et.dom.getEnv().clientHeight * percentage / 100 );
        //}

        $(window).scroll(handleScroll);
        //$(window).resize(handleResize);

        initHandler();

        return this;
    };

    function initHandler() {
        if (bInit) {
            return;
        }

        bInit = true;
    }

    function handleScroll() {
        var target = $(this);
        var sTop = target.scrollTop();
        $(queue).each(function (i, el) {
            if (sTop + el.outerHeight() > et.dom.getEnv().bodyHeight) {
                el.css('height', et.dom.getEnv().bodyHeight - sTop);
            }
            el.css({
                top: sTop + 'px',
                left: target.scrollLeft() + 'px'
            });
        });
    }

    //function handleResize(){
    //    var target = $(this);
    //    $(queue).each(function(i, el){
    //        el.data('expandHeightToPercentage') && el.css({
    //            height: et.dom.getEnv().clientHeight * el.data('expandHeightToPercentage') / 100 
    //        });
    //    });
    //}
    /* 
    Method: et.dom.unfix

    Unfix elements which fixed by et.dom.fix(), jQuery alias: unfixPosition.
    */
    et.dom.unfix = function (obj) {
        if (obj.data(indicatorKey) !== true) {
            return this;
        }

        var objIndex = -1;

        $(queue).each(function (i, el) {
            if (el == obj) {
                objIndex = i;
                return false;
            }

            return true;
        });

        if (objIndex > -1) {
            queue.splice(objIndex, 1);
        }

        obj.data(indicatorKey, false);

        return this;
    };

    $.fn.extend({
        fixPosition: function () {
            return this.each(function (i, el) {
                et.dom.fix($(el));
            });
        },
        unfixPositioin: function () {
            return this.each(function () {
                et.dom.unfix($(el));
            });
        }
    });

})(et, jQuery);
/*!require: et */
/*
Namespace: et.ui

Containing ui controls
*/
et.ui = {};
/*!require: et.dom , et.ui */
/*
Ctor: et.ui.overlay

Overlay implementation, display a alpha transparency background that hover on the window,
blocking access to elements under it.

TODO: drain all keyboard and mouse events

Options:
customName - A customized class name for the root element of the overlay

*/
(function (et, $) {
    var defaultOptions = {
        customName: ''
    };

    var ctor = function (options) {
        this._options = {};

        $.extend(this._options, defaultOptions, options);

        p._init.apply(this, arguments);
    };

    ctor.prototype = {
        _init: function () {
            // creating elements, should be cleaned up when dispose
            this._dom = $('<div class="et_js_lightbox ' + this._options.customName + '" />')
                .hide();
            this._mask = $('<div class="et_js_lightbox_mask" style="height: 100%" />')
                .fixPosition()
                .appendTo(this._dom).hide();
            /*
            Property: container

            The content container
            */
            this.container = $('<div class="et_js_lightbox_container" />')
                .fixPosition()
                .appendTo(this._dom).hide();

            // append root to document.body at last can speed up the initialization
            this._dom.appendTo(document.body);
        },
        /*
        Method: show
        
        Display overlay
        */
        show: function () {
            this._dom.show();
            this.container.show();
            this._mask.show().css('opacity', 0).fadeTo('slow', 0.5);
        },
        /*
        Method: hide

        Hide overlay
        */
        hide: function () {
            this._mask.hide();
            this.container.hide();
            this._dom.hide();
        },
        /*
        Method: dispose

        Dispose overlay, remove unneccesary elements from dom.
        */
        dispose: function () {
            this._mask.remove();
            this.container.remove();
            this._dom.remove();
        }
    };

    var p = ctor.prototype;

    et.ui.overlay = ctor;

})(et, jQuery);
/*!require: hacks, et.dom , et.ui , et.ui.overlay */
/*
Ctor: et.ui.lightbox

Lightbox implementation.
Note: To localization the closingText, you can also set default text option at et.ui.lightbox.defaultOptions.closingText;
Sample Code: 
et.ui.lightbox.defaultOptions.closingText = 'blah'

Options:
target - Specify the element which will be inserted into lightbox and displayed as content
closingText - The label for the closing button
customName - A customized class name for the root element of the lightbox
onHide - Specify a callback which will be fired when lightbox hided.

*/
(function (et, $) {

    // default options 
    var defaultOptions = {
        target: null,
        onHide: null,
        closingText: 'Close',
        customName: ''
    };

    var ctor = function (options) {

        this._options = {};

        $.extend(this._options, defaultOptions, options);

        if (this._options.target == null) {
            throw new Error('Targeting element was not specified.');
        }
        else {
            this._options.target = $(this._options.target);
        }

        // prevent init() be overrided by inheritances
        p._init.apply(this, arguments);
    };

    ctor.prototype = {
        _init: function () {
            this._overlay = new et.ui.overlay(this._options);

            this._wrapper = this._createWrapper()
                .appendTo(this._overlay.container)
            // bind event
                .find('.et_js_lightbox_wrapper_close').click((function () {
                    this.hide();
                }).bind(this)).end();

            // record the target's parents, so that we can recover it later
            this._targetParent = this._options.target.parent();

            this._options.target
                .appendTo(this._wrapper.find('.et_js_lightbox_wrapper_content'));


        },
        _createWrapper: function () {
            return $(('<div class="et_js_lightbox_wrapper" >' +
                    '<div class="et_js_lightbox_wrapper_top">' +
                        '<div class="et_js_lightbox_wrapper_bar">' +
                            '<span class="et_js_lightbox_wrapper_close"><%=ct %></span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="et_js_lightbox_wrapper_elastic">' +
                        '<div class="et_js_lightbox_wrapper_content"></div>' +
                    '</div>' +
                '</div>')
                .macro('ct', this._options.closingText));
        },
        /*
        Method: show

        Display lightbox 
        */
        show: function () {
            this._overlay.show();
            this._options.target.show();

            var top = (et.dom.getEnv().clientHeight - $(this._wrapper).outerHeight(true)) / 2;
            top = top > 0 ? top : 0;

            // set the margin top before fadein, display it on the middle of the screen
            this._wrapper.css('marginTop', top + 'px');
        },
        /*
        Method: hide
        
        Hide lightbox
        */
        hide: function () {
            this._options.target.hide();
            this._overlay.hide();

            if (this._options.onHide != null) {
                this._options.onHide(this);
            }
        },
        /*
        Method: dispose

        Dispose elements that created dynamically, and return options.target to its original parent
        */
        dispose: function () {
            // return target to original place before removing the entire element
            this._targetParent.append(this._options.target);

            this._wrapper.remove();

        }
    };

    var p = ctor.prototype;

    et.ui.lightbox = ctor;
    et.ui.lightbox.defaultOptions = defaultOptions;

})(et, jQuery);
/*!require: hacks , et.ui */
/*
Ctor: et.ui.slide

Slide show implementation
TODO: add animator options

Options:
target - Content group reference
slideSelector - slide class
indicatorSelector - the class of progress indicators place holder
nextSelector - selector for 'next' button
lastSelector - 'last' button
switchOutAction - 'fadeOut',
switchInAction - 'fadeIn',
indicatorInteractable - true,
indicatorInteractAction - 'mouseover',
autoPlay - false,
autoPlayInterval - 3000
*/
(function (et, $) {
    var defaultOptions = {
        target: null,
        slideSelector: null,
        indicatorSelector: null,
        indicatorHightlightClass: null,
        indicatorActiveClass: null,
        nextSelector: null,
        lastSelector: null,
		switchOutAction: 'fadeOut',
		switchInAction: 'fadeIn',
		indicatorInteractable: true,
		indicatorInteractAction: 'mouseover',
		autoPlay: false,
		autoPlayInterval: 6000
    };

    var ctor = function(options){
        this._options = {};
        $.extend(this._options, defaultOptions, options);

        var target = this._options.target = $(this._options.target);

        this._index = 0;

        this._dom = target;

        // find elements
        this._slides = target.find(this._options.slideSelector);

        //this._slidesParent = this._slides.parent();

        this._indicators = target.find(this._options.indicatorSelector);
		this._indicators.each((function(i, el){
			$(el)[this._options.indicatorInteractAction]((function(evt){
				this._resetAutoPlay();
				// handle indicator interact
				var index = $(evt.target)
					.parents(this._options.indicatorSelector)
					.index(this._options.indicatorSelector);
				this._index = index - 1;
				this._handleNextClick();
			}).bind(this));
		}).bind(this));

        this._next = this._options.target.find(this._options.nextSelector);
        this._last = this._options.target.find(this._options.lastSelector);

        // init slide
        this._slides.eq(0).show();

        // hook events
        this._hookEvents();

        this.showSlide(0);
		
		this._startAutoPlay();
    };

    var p = ctor.prototype;
	p._startAutoPlay = function(){
		if (!this._options.autoPlay) return;
		var handleAutoPlay = (function(){
			this._handleNextClick();
		}).bind(this);
		this._autoPlayTimer = setInterval(handleAutoPlay , this._options.autoPlayInterval);
	};
	p._stopAutoPlay = function(){
		clearInterval(this._autoPlayTimer);
	};
	p._resetAutoPlay = function(){
		this._stopAutoPlay();
		this._startAutoPlay();
	};
    p._hookEvents = function(){
        var callHandler = (function(){
            this._handleNextClick.apply(this, arguments);
        }).bind(this);
        this._next.click(callHandler);
        this._last.click(callHandler);
    };
    p._handleNextClick = function(){
        this._index++;

        if (this._index >= this._slides.length){
            this._index = 0;
        }

        this.showSlide(this._index);
    };
    /*
    Method: show
    
    display slideshow
    */
    p.show = function(){
        this._options.target.show();
    };
    /*
    Method: showSlide

    switch to specified slide
    */
    p.showSlide = function(index){
        this._indicators.removeClass(this._options.indicatorActiveClass)
            .eq(index).addClass(this._options.indicatorActiveClass);
        this._slides.stop(true, true)[this._options.switchOutAction]()
            .eq(index)[this._options.switchInAction]();

        // if it is not last slide hide last button, vice verse
        if (index < this._slides.length - 1){
            this._last.hide();
            this._next.show();
        }
        else{
            this._next.hide();
            this._last.show();
        }
    };
    /*
    Method: dispose

    dispose current slide show object and return content to its original parent.
    */
    p.dispose = function(){
        //this._slides.appendTo(this._slidesParent);
        //this._dom.remove();
    };
    et.ui.slide = ctor;
})(et, jQuery);
/*!require: et */
/*
Namespace: et.util

Containing small utilities which related to page logic .
*/
et.util = {};
/*!require: et.ui.lightbox , et.ui.slide , et.util */
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
    et.util.initTourSlideshow = function (contentRef) {
        var slide = new et.ui.slide({
            target: '#et_tour_wrap',
            slideSelector: '.et_tour_item',
            indicatorSelector: '.et_tour_oper_dots > ol > li',
            indicatorActiveClass: 'active',
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
        //lightbox.show();
        
        return lightbox;
    };

})(et, jQuery);
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
    var containerSelector = '.et_interior_top_videolink';

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
        $(containerSelector + ' a').each(function (i, el) {
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
/*
jQuery plugin: dropTo

Drop an element to specified position relative to another element.

Usage:
    $(eleA).dropTo(eleB).left()

Options:
target - the object of reference for positioning.
*/
(function($){
    
    var dataKey = 'dropToData';
    var defaultOptions = {
        target: null
    };

    var settingsHolder = {};

    function init(i, dom){
        var el = $(dom);

        var settings = {};
        $.extend(settings, settingsHolder);

        // make sure it is jquery obj
        settings.target = $(settings.target);
        var offset = null;

        el.css('position', 'absolute');
        // we'd better not change the hierachical structure of dom, if el is not a child of body,
        // lets ASSUME TARGET AND EL ARE UNDER SAME PARENT NODE, and use offset relative to el's parent
        if (el.parent().get(0) != document.body)
            offset = {
                left: settings.target.get(0).offsetLeft,
                top: settings.target.get(0).offsetTop
            };
        else{
            offset = settings.target.offset();
            el.appendTo(document.body);
        }

        var data = {
            settings: settings,
            offset: offset
        };

        el.data(dataKey, data);
    }

    function left(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var left = data.offset.left - el.outerWidth();
        el.css('left', left);
    };

    function top(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var top = data.offset.top - el.outerHeight();
        el.css('top', top);
    };

    function right(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var left = data.offset.left + target.outerWidth();
        el.css('left', left);
    }

    function bottom(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var top = data.offset.top + target.outerHeight();
        el.css('top', top);
    }

    function insideTop(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var top = data.offset.top;
        el.css('top', top);
    }

    function insideLeft(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var left = data.offset.left;
        el.css('left', left);
    }

    function center(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var left = data.offset.left + (target.outerWidth() - el.outerWidth()) / 2;
        el.css('left', left);
    }

    function middle(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var top = data.offset.top + (target.outerHeight() - el.outerHeight()) / 2;
        el.css('top', top);
    }

    $.fn.extend({
        dropTo: function(another, options){
            // another can be option or jQuery obj
            if (another.length != null && another.attr != null){
                if (options == null){
                    options = {}
                }
                options.target = another;
            }
            else {
                options = another;
            }
            $.extend(settingsHolder, defaultOptions, options);
            return this.each(init);
        },
        outerLeft: function(){
            return this.each(left);
        },
        outerTop: function(){
            return this.each(top);
        },
        outerRight: function(){
            return this.each(right);
        },
        outerBottom: function(){
            return this.each(bottom);
        },
        innerTop: function(){
            return this.each(insideTop);
        },
        innerLeft: function(){
            return this.each(insideLeft);
        },
        atCenter: function(){
            return this.each(center);
        },
        atMiddle: function(){
            return this.each(middle);
        }
    });

})(jQuery);
/*!require: hacks , et.ui , jquery.dropTo */
/*
Ctor: et.ui.autocomplete

autocomplete implement, do not support retrieving data by using ajax, if you want it you may want to implement ._getData().

Options:
target - null,
data - null,
column - '',
entriesPerPage - 0, // 0 = display all
customName - '',
allowPaging - false,
allowListAll - true
*/
(function(et, $){
    var defaultOptions={
        target: null,
        data: null,
        column: '',
        entriesPerPage: 0, // 0 = display all
        customName: '',
        allowPaging: false,
        allowListAll: true
    };
	var keyUp = 38, keyDown = 40, keyEnter = 13, keyEsc = 27;
    var ctor = function(options){
        this._options = {};
        $.extend(this._options, defaultOptions, options);

        this._options.target = $(this._options.target);
        
        this._dom = $(this._buildHtml()).addClass(this._options.customName).appendTo(this._options.target);
        this._inputWrapper = this._dom.find('.et_js_autocomplete_inputWrapper');
        this._input = this._dom.find('input');
        this._result = this._dom.find('.et_js_autocomplete_result');
        this._result.css('width', parseInt(this._result.css('width')) + this._inputWrapper.outerWidth() - this._result.outerWidth());

		this._focusCursor = -1;
		
        this._hookEvents();

        // if there are value in input, display corresponding entries,
        // this is to prevent js was loaded slowly.
        if (this._input.val() != ''){
            this._displayCurrent();
        }
    };

    var p = ctor.prototype;
    p._buildHtml = function(){
        return '<div class="et_js_autocomplete"><div class="et_js_autocomplete_inputWrapper">' +
                '<input type="text" />' + 
                '<div class="et_js_autocomplete_drop"></div>' +
            '</div><div class="et_js_autocomplete_result">' +
                '' +
            '</div>' +
            '</div>';
    };
    p._hookEvents = function(){
        this._dom
            .find('.et_js_autocomplete_drop').click((function(){
                this._handleDrop.apply(this, arguments);
            }).bind(this)).end()

        this._input.keyup((function(evt){
                this._handleKeyUp.apply(this, arguments);
            }).bind(this))
			.keydown((function(evt){
                this._handleKeyDown.apply(this, arguments);
            }).bind(this))
            .focus((function(){
                this._displayCurrent();
            }).bind(this))
			.blur((function(){
				this._focusCursor = -1;
			}).bind(this))
            .click(function(evt){
                evt.stopPropagation();
            })
            .dblclick((function(){
                this._displayCurrent();
            }).bind(this));
			
        $(window).resize((function(){
            if (this._result.is(':visible')){
                this._resizeResult();
            }
        }).bind(this));
        var global = window;
        if ($.browser.msie){
            global = document.documentElement;
        }
        $(global).click((function(){
            this.hideDrop();
        }).bind(this)); 
    };
    /*
    Method: _getData

    Return entries that related to input, if keyword not specified, try to return the first N.
    Should be overrided when you need to change the way it getting data.
    */
    p._getData = function(keyword, startIndex){
        var ret = [], cache = this._options.data;
        if (startIndex == null) startIndex = 0;

        if (cache){
            for(var i = startIndex; i < cache.length; i++){
                if (keyword){
                    if (cache[i][this._options.column].toLowerCase().indexOf(keyword.toLowerCase()) == 0){
                        ret.push(cache[i]);
                    }
                }
                else{
                    ret.push(cache[i]);
                }

                if (this._options.entriesPerPage > 0 && ret.length >= this._options.entriesPerPage){
                    break;
                }
            }
        }

        return ret;
    };
    p._displayCurrent = function(){
        if (this._input.val() != ''){
            var ent = this._getData(this._input.val(), 0);
            this._handleDrop(ent);
        }
        else{
            // display all
            this._handleDrop();
        }
    };
	p._highlightEntry = function(){
		if (this._focusCursor <= -1) return;
		// highlight and then scroll into view
		var elEntries = this._result.find('.et_js_autocomplete_entry').removeClass('et_js_autocomplete_entry_highlight');
		var el = elEntries.eq(this._focusCursor)
			.addClass('et_js_autocomplete_entry_highlight');
		var posTop = elEntries.eq(this._focusCursor).get(0).offsetTop;
		this._result.scrollTop(posTop);
	};
    p._handleKeyUp = function(evt){
		// bypass function keys, such as up down left right and enter
		if (evt.keyCode == keyUp || evt.keyCode == keyDown || evt.keyCode == keyEnter || evt.keyCode == keyEsc)	{
			
		}
		else{
			var entries = this._getData(this._input.val());
			this._handleDrop(entries);
		}
		this._highlightEntry();
    };
	p._handleKeyDown = function(evt){
		var elEntries = this._result.find('.et_js_autocomplete_entry');
		
		// display drop down if hide
		this.showDrop();
		
		// upkey
		if (evt.keyCode == keyUp){
			this._focusCursor--;
			if (this._focusCursor < 0){
				this._focusCursor =  elEntries.length - 1;
			}
		}
		// downkey
		else if(evt.keyCode == keyDown){
			this._focusCursor++;
			if (this._focusCursor > elEntries.length - 1){
				this._focusCursor = 0;
			}
		}
		// enter key
		else if(evt.keyCode == keyEnter){
			if (this._focusCursor <= -1) return;
			// rewrite target
			evt.target = elEntries.eq(this._focusCursor);
			this._handleEntryClick(evt);
			return;
		}
		else if(evt.keyCode == keyEsc){
			this.hideDrop();
			return;
		}
		
		this._highlightEntry();
	};
    p._handleDrop = function(entries){
        if (entries == null && this._options.allowListAll){
            entries = this._getData(null, 0);
        }

        this._result.empty();
		this._focusCursor = -1;
		
        if (entries.length <=0) {
            this._result.hide();
            return;
        }

        for(var i = 0; i < entries.length; i++){
            this._result.append(this._createEntry(entries[i]));
        }

        if (!this._result.is(':visible')){
            this._resizeResult();
        }
    };
    p._createEntry = function(node){
        var text = node[this._options.column];
        var ret = $('<div class="et_js_autocomplete_entry">' + text + '</div>')
			.click((function(){
                this._handleEntryClick.apply(this, arguments);
            }).bind(this))
			.mouseover((function(){
				this._handleEntryHover.apply(this, arguments);
			}).bind(this))
            .data('et.ui.autocomplete.entry', node);

        return ret;
    };
    p._handleEntryClick = function(evt){
        var value = $(evt.target).data('et.ui.autocomplete.entry');
        this.hideDrop();
		this._input.val(value[this._options.column]);
        $(this._options.target).trigger('autocompleteselect', value);
    };
	p._handleEntryHover = function(evt){
		this._result.find('.et_js_autocomplete_entry').removeClass('et_js_autocomplete_entry_highlight');
		$(evt.target).addClass('et_js_autocomplete_entry_highlight');
	};
    p._resizeResult = function(){
        var box = et.dom.getEnv();
        // fade in to correct position
        this._result
                .show().dropTo(this._inputWrapper).outerBottom().innerLeft();

        var offset  = this._result.offset();
        
        this._result.css({
            'max-height': box.clientHeight - offset.top + box.bodyScrollTop - 6
        }).hide().fadeIn('fast')
    };
    p.hideDrop = function(){
        this._result.hide();
    };
	p.showDrop = function(){
		if (!this._result.is(':visible'))
			this._result.show();
	};
    p.onSelect = function(func){
        $(this._options.target).bind('autocompleteselect', func);
    }
    
    et.ui.autocomplete = ctor;
})(et, jQuery);

