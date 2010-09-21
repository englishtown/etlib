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

/*
Method: hasVML

return true if vml is enabled
*/
(function(et){
	var supported;
	et.dom.hasVML = function() {
		if (typeof supported == "undefined") {
			var a = document.body.appendChild(document.createElement('div'));
			a.innerHTML = '<v:shape id="vml_flag1" adj="1" />';
			var b = a.firstChild;
			b.style.behavior = "url(#default#VML)";
			supported = b ? typeof b.adj == "object": true;
			a.parentNode.removeChild(a);
		}
		return supported;
	};
})(et);