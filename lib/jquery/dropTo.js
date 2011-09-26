/*
JQueryPlugin: jQuery.fn.dropTo

Drop an element to specified position relative to another element.

Usage:
    $(eleA).dropTo(eleB).left()

Options:
target - the object of reference for positioning.
*/
(function($){
    if ($.fn.dropTo){
        // if there is a newer version then we do't over it
        return;
    }
    
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
        // we'd better not change the hierachical structure of dom, if el and target don't share same parent,
        // we need to caculate the position diff between them
        if (el.parent().get(0) == settings.target.parent().get(0))
            offset = settings.target.position();
        else{
			var diff = { 
				left: settings.target.offset().left - settings.target.position().left - (el.offset().left - el.position().left),
				top:  settings.target.offset().top - settings.target.position().top - (el.offset().top - el.position().top)
			}
            offset = settings.target.position();
			offset.top += diff.top;
			offset.left += diff.left;
			
            //el.appendTo(document.body);
        }
	

        var data = {
            settings: settings,
            offset: offset
        };

        el.data(dataKey, data);
    }
    
    /**
     * @function setBidiLeft Set the css('left') by default, but if it is in a rtl element,
     * will calculate corresponding 'right distance' and user css('right') instead of left.
     */
    function setBidiLeft(el, left){
    
        var parent = el.offsetParent();
        if (parent.length <= 0 || el.css('direction') != 'ltr'){
            // right to left layout
            var right = parent.outerWidth() - left - el.outerWidth();;
            el.css('right', right);
        }
        else{
            // left to right layout (default)
            el.css('left', left);
        }
    };

    function left(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var left = data.offset.left - el.outerWidth();
        setBidiLeft(el, left);
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
        setBidiLeft(el, left);
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
        setBidiLeft(el, left);
    }
	
	function insideRight(i, dom){
        var el = $(dom);
        var data = el.data(dataKey);
        if (data == null) return;
        var target = data.settings.target;
        var left = data.offset.left + target.outerWidth() - el.outerWidth();
        setBidiLeft(el, left);
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
        setBidiLeft(el, left);
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
			another = $(another)
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