/*
JQueryPlugin: jQuery.fn.dropTo

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
	
	function insideRight(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var left = data.offset.left + target.outerWidth() - el.outerWidth();
        el.css('left', left);
    }

    function insideBottom(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var top = data.offset.top + target.outerHeight() - el.outerHeight();
        el.css('top', top);
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
		innerLeft: function(){
            return this.each(insideLeft);
        },
        innerTop: function(){
            return this.each(insideTop);
        },
		innerRight: function(){
            return this.each(insideRight);
        },
		innerBottom: function(){
            return this.each(insideBottom);
        },
        atCenter: function(){
            return this.each(center);
        },
        atMiddle: function(){
            return this.each(middle);
        }
    });

})(jQuery);