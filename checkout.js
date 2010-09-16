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
/*!require: jquery.dropTo */
/*
JQuery plugin: texttip

Display a tip on the input box, when tip is clicked, input gets the focus.
when input gets the focus, tip will be disappeared.

Usage:
// init texttip
$('.target').texttip('hoveringElementClass');
// clearing hovered tips on the page
$('.target').texttipClear();

Options:
className - class name for the hovering element.
chainUpdate - true or false, true to update all hover state when one textbox value was updated. (fix browser autocomplete)

JQuery plugin: texttipClear

Clear the tip on specified elements.

*/
(function ($) {
    var defaultOptions = {
        className: null,
        chainUpdate: true
    };

    var dataKey = 'texttipdata';

    var settingsHolder = {};

    // storing all 'data' object, data object contains all element-hover pairs and theirs settings
    var elQueue = [];

    $(window).resize(handleResize);

    // initialize inputs
    function init(i, dom) {
        var el = $(dom);
        var tip = el.attr('title');

        var settings = {};
        $.extend(settings, settingsHolder);

        // if it is not a input or input without title attr, bypass it.
        if (el.attr('tagName').toLowerCase() != 'input' ||
            tip == null ||
            tip == '' ||
            !el.is(':visible')) return;

        // get rid of title and disable autofill
        el.attr('title', '').attr('autocomplete','off');

        // create a hover element, and cover the input
        var hover = $('<div />')
            .html(tip)
            .addClass(settings.className)
            .appendTo(el.parent());

        cloneCss(hover, el);

        // if there are value in it, hide hover
        if (el.val() != ""){
            hover.hide();
        }

        var data = {
            settings: settings,
            input: el,
            hover: hover,
            tip: tip
        };

        elQueue.push(data);

        el.data(dataKey, data);
        hover.data(dataKey, data);

        hookEvents(el, hover);
    }

    function cloneCss(hover, el){
        // coodinates relative to doc
        var offset = el.offset();
        var size = {
            width: el.width(),
            height: el.height()
        };

        var z = el.css('zIndex');
        z = z == 'auto' ? 0 : z;

        hover.css({
                position: 'absolute',
                zIndex: z + 1, // a little bit higher than current element.
                overflow: 'hidden',
                width: size.width,
                height: size.height,
                paddingTop: el.css('paddingTop'),
                paddingLeft: el.css('paddingLeft'),
                paddingRight: el.css('paddingRight'),
                paddingBottom: el.css('paddingBottom'),
                marginTop: el.css('marginTop'),
                marginLeft: el.css('marginLeft'),
                marginRight: el.css('marginRight'),
                marginBottom: el.css('marginBottom'),
                cursor: 'text'
            })
            .dropTo(el).atCenter().atMiddle();
    }

    function clearHover(i, dom){
        var el = $(dom);
        var i = elQueue.length;
        while(i--){
            var cursor = elQueue[i];
            if (cursor.input.get(0) == el.get(0)){
                cursor.input.attr('title', cursor.tip).blur();
                cursor.hover.remove();
                elQueue.splice(i, 1);
            }
        }
    }

    function hookEvents(el, hover) {
        // autocomplete sucks, even we hooked to below events,
        // we still cannot detect value changed by autocomplete feature in all case
        // considering disable it by using autocomplete=off or kick of loop checking textbox value.
        el.blur(handleBlur).focus(handleFocus).change(handleChange).bind('input', handleChange).bind('propertychange', handleChange);
        hover.click(handleClick);
    }

    // repositioning hover elemnets when windows resized.
    function handleResize(){
        
        var i = elQueue.length;
        while(i--){
            var cursor = elQueue[i];
            cloneCss(cursor.hover, cursor.input);
        }
    }

    // handle when text blur, try to decide if hover need to be displayed.
    function handleBlur() {
        var self = $(this);
        var data = self.data(dataKey);
        var v = self.val();
        if (v == null ||
            v == '' ||
            v == data.tip) {
            data.hover.show();
        }
        else{
            data.hover.hide();
        }
    }

    function handleFocus() {
        $(this).data(dataKey)
            .hover.hide();
    }

    function handleChange(){
        var data = $(this).data(dataKey);
        data.hover.hide();

        // clear hover when autocomplete
        if (data.settings.chainUpdate){
            var i = elQueue.length;
            while(i--){
                handleBlur.call(elQueue[i].input);
            }
        }
    }

    function handleClick() {
        $(this)
            .hide()
            .data(dataKey)
            .input.focus();
    }

    $.fn.extend({
        texttip: function (options) {
            $.extend(settingsHolder, defaultOptions, options);
            return this.each(init);
        },
        texttipClear: function(){
            return this.each(clearHover); 
        }
    });
})(jQuery);
