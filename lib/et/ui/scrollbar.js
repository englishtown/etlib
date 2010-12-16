/*!require: et.ui.base , et.ui.glide , jquery.dropTo */
/* 
Ctor: et.ui.scrollbar

A full customizable scrollbar

Options:
	target 		- target element that requires a customized scrollbar.
	direction - - position of the scrollbar, value could be w, s, n, e
*/

!function($){
		
	var ctor = et.ctor(function(options){
		
		var target = this.opts.target;
		
		// ***********
		// * Variables
		// ***********	
		var glideDirection = this.opts.direction == 'w' || this.opts.direction == 'e'? 'ns': 'we';
		this._propLen = glideDirection == 'ns' ? 'height': 'width';
		this._propOuterLen = glideDirection == 'ns' ? 'outerHeight': 'outerWidth';
		this._propOffShore= glideDirection == 'ns' ? 'top': 'left';
		
		this._glide = new et.ui.glide({
			direction: glideDirection
		});
		
		this._stopWatching = false;
		
		// ***********
		// * DOM Construction
		// ***********
		this._glide.show();
		this._glide.dom.css('position', 'relative');
		
		// construct scrollbar dom
		this.dom
			.css({
				'margin': 0,
				'padding': 0
			})
			.addClass('et_helper_reset et_ui_scrollbar')
			.append(this._glide.dom);
			.appendTo(document.body);
		
		// hide all scrollbars on target
		target.css({
			overflow: 'hidden',
			'overflow-x' : 'hidden',
			'overflow-y': 'hidden',
			position: 'relative' // set target to relative so it is easier for us to control dom position.
		});
		
		// ***********
		// * Attach Events
		// ***********
		this.__glideChange = $.proxy(this._handleGlideChange, this);
		this._glide.onChange(this.__glideChange);
		
		// ***********
		// * Initialization
		// ***********
		this.refresh();
		this.watch();
		
	}, et.ui.base);
	
	var p = ctor.prototype;
	
	p._defaultOptions = {
        target: null,
		direction: 'e' // position of scrollbar
    };
	
	p.show = function(){
		this.dom.show();
	};
	// keep an eye on the content width/length;
	p.watch = function(){
	
		if (this._stopWatching) return;
		
		this.refresh();
		
		setTimeout($.proxy(this.watch, this), 100);
	};
	p.refresh = function(){
		this._handleResize();
		
		this._glide.refresh();
	};
	
	p.dispose = function(){
		this._glide.unbindChange(__glideChange);
		
		this._stopWatching = true;
		
		this._glide.dispose();
	};
	
	p._cloneSize = function(){
		// clone the size of target
        var t = this.opts.target;
        var len = t[this._propOuterLen]();
        var content = { top: t.get(0).scrollHeight, left: t.get(0).scrollWidth };
		
		// set wrapper as same length as glide
		this.dom[this._propLen](len);
		
        if (content[this._propOffShore] > len) {
            this._glide.length(len);
            this._glide.viewLength(len);
            this._glide.contentLength(content[this._propOffShore]);

            this.dom.show();
            return true;
        }
        else {
            this.dom.hide();
            return false;
        }
	};
	p._setPos = function(){
		// set dom to proper position
		this.dom.dropTo(this.opts.target);
		switch(this.opts.directon){
			case 'w' : 
				this.dom.innerLeft().atMiddle();
				break;
			case 'n':
				this.dom.innerTop().atCenter();
				break;
			case 's':
				this.dom.innerBottom().atCenter();
				break;
			case 'e' :
			default:
				this.dom.innerRight().atMiddle();
				break;
		}
	};
	p._handleResize = function(){
		if (this._cloneSize()){
			this._setPos();
		}
	};
	p._handleGlideChange = function(evt, value){
		var props = {
			top: 'scrollTop',
			left: 'scrollLeft'
		};
		
		var prop = props[this._propOffShore];
		
		this.opts.target.get(0)[prop] = value;
	};
	
	et.ui.scrollbar = ctor;
}(jQuery);