/*!require: et.ui.base , jquery.dropTo */
/*
Ctor: et.ui.glide


*/
!function($){
	var ctor = et.ctor(function(){
		
		// ***********
		// * DOM Construction
		// ***********
		this.dom
			.append($('<div class="et_outer et_header"></div>' +
			'<div class="et_outer et_bodier"></div>' +
			'<div class="et_outer et_footer"></div>' +
			'<div class="et_ui_glide_glidee">' +
				'<div class="et_inner et_header"></div>' +
				'<div class="et_inner et_bodier"></div>' +
				'<div class="et_inner et_footer"></div>' + 
			'</div>'))
			.addClass('et_helper_reset et_ui_glide')
			.css({
				'margin': 0,
				'padding': 0
			})
			.hide();
		
		// ***********
		// * Variables
		// ***********		
		this._oheader = this.dom.find('.et_outer.et_header');
		this._ofooter = this.dom.find('.et_outer.et_footer');
		this._obodier = this.dom.find('.et_outer.et_bodier');
		this._iheader = this.dom.find('.et_inner.et_header');
		this._ifooter = this.dom.find('.et_inner.et_footer');
		this._ibodier = this.dom.find('.et_inner.et_bodier');
		this._glidee = this.dom.find('.et_ui_glide_glidee')
			.css({
				'margin': 0,
				'padding': 0,
				'top': 0
			});
		this._propOuterLen = this.opts.direction == 'ns' ? 'outerHeight': 'outerWidth';
		this._propLen = this.opts.direction == 'ns' ? 'height': 'width';
		this._propOffShore= this.opts.direction == 'ns' ? 'top': 'left';
		this._globalListenee = $.browser.mise ? window : document;
		this.status = {
			dragging: false
		};
		this.tickPointEl = {};
		this.tickPointWin = {};
		
		// ***********
		// * define getters and setters
		// ***********
		
		// @private
		this.glideeLength = et.prop(0, this._getGlideeLength, this._setGlideeLength);
		
		// @private
		this.glideeDistance = et.prop(0, this._getGlideeDistance, this._setGlideeDistance);
		
		/*
		Method: length
		
		Set or get the length of current glide, if it is vertical aligned, it means height otherwise it means width;
		*/
		this.length = et.prop(0, this._getLength, this._setLength);
		/*
		Method: contentLength
		
		Set or get the content length
		*/
		this.contentLength = et.prop(0, this._getContentLength, this._setContentLength);
		
		/*
		Method: viewLength
		
		set or get the view window length
		*/
		this.viewLength = et.prop(0, this._getViewLength, this._setViewLength);
		
		/*
		Method: value
		
		set or get current value indicated by the handler
		*/
		this.value = et.prop(0, this._getValue, this._setValue);
		
		
		// ***********
		// * init property values
		// ***********
		this._glideeDistance = 0;
		this.length(100);
		this.contentLength(1000);
		this.viewLength(100);
		
		// ***********
		// * Attach Events
		// ***********
		this.__mousemove = $.proxy(this._handleMouseMove, this);
		this.__mouseup = $.proxy(this._handleMouseUp, this);
		this.__mousedown = $.proxy(this._handleMouseDown, this);
		$(this._globalListenee).mousemove(this.__mousemove);
		$(this._globalListenee).mouseup(this.__mouseup);
		this._glidee.mousedown(this.__mousedown);
		
		
		this.refresh();
		
	}, et.ui.base);
	
	var p = ctor.prototype;
	p._defaultOptions = {
		target: null,
		direction: 'we'
	};
	
	// ***********
	// * Event handlers
	// ***********
	p._handleMouseMove = function(evt){
		if (this.status.dragging){
			var mouse = { top: evt.pageY, left: evt.pageX };
			
			var prop = this._propOffShore;
			
			var newDistance = mouse[prop] - this._tickPointWin[prop] + this._tickDistance;
			
			if (newDistance < 0){
				newDistance = 0;
			}
			else if (newDistance > this._length - this._glideeLength){
				newDistance = this._length - this._glideeLength;
			}
			
			this.glideeDistance(newDistance);
			
		}
	};
	
	p._handleMouseDown = function(evt){
		if (!this.status.dragging){
			this.status.dragging = true;
			
			var self = $(this);
			
			this._tickPointEl = self.position();
			this._tickPointWin = {top: evt.pageY, left: evt.pageX};
			this._tickDistance = this._glideeDistance;
		}
		
		evt.preventDefault();
	};
	
	p._handleMouseUp = function(){
		this.status.dragging = false;
	};
	
	// ***********
	// * Methods
	// ***********
	p.show = function(){
	
		this.dom.show();
		this.refresh();
		
	};
	
	// refresh must be called after shown
	p.refresh = function(){
		this._setOffShoreProp();
	};
	
	p.dispose = function(){
		// ***********
		// * Detach Events
		// ***********
		$(this._globalListenee).unbind('mousemove', this.__mousemove);
		$(this._globalListenee).unbind('mouseup', this.__mouseup);
		this._glidee.unbind('mousedown', this.__mousedown);
	};
	
	p._setOffShoreProp = function(){
		this._propOff = this._propOffShore;
		var pos = this.dom.css('position');
		
		if (pos == 'relative' || pos == 'absolute'){
			this._glidee.css('position', 'absolute');
		}
		else{
			// display element so we can properly drop
			var display = this.dom.css('display');
			this.dom.css('display', 'block');
			
			// drop it
			this._glidee.dropTo(this.dom).innerLeft().innerTop();
			
			// revert display
			this.dom.css('display', display);
			// use margin instead of left
			this._propOff = 'margin-' + this._propOff;
		}
	};
	p._resizeGlidee = function(){
		var glen = this._length * this._viewLength / this._contentLength;
		
		if (isNaN(glen)) glen = 0;
		// set glidee length
		this.glideeLength(glen);
		
		if (this.glideeDistance() < 0){
			this.glideeDistance(0);
		}
		else if(this.glideeDistance() > this._length - this._glideeLength) {
			this.glideeDistance(this._length - this._glideeLength);
		}
	};
	
	// ***********
	// * define events
	// ***********
	p.onChange = function(func){
		this.dom.bind('et.ui.glide.onChanged', func);
	};
	p.unbindChange = function(func){
		this.dom.unbind('et.ui.glide.onChanged', func);
	};
	
	// ***********
	// * getters and setters functions
	// ***********
	p._length = 0;
	p._setLength = function(value){
		var pl = this._propLen;
		var opl = this._propOuterLen;
		
		// set full length
		this.dom[pl](value);
		
		// set inner length
		var unresizable = this._oheader[opl]();
		unresizable += this._ofooter[opl]() + (this._obodier[opl]() - this._obodier[pl]());
		
		this._obodier[pl](value - unresizable);
		
		if (this._length != value){
			this._length = value;
			this._resizeGlidee();
		}
		return value;
	};
	p._getLength = function(value){
		
		return value;
	};
	
	p._glideeLength = 0;
	p._setGlideeLength = function(value){
		var pl = this._propLen;
		var opl = this._propOuterLen;
		
		// set full length
		this._glidee[pl](value);
		
		// set inner length
		var unresizable = this._iheader[opl]();
		// plug footer margin and padding
		unresizable += this._ifooter[opl]() + (this._ibodier[opl]() - this._ibodier[pl]());
		
		this._ibodier[pl](value - unresizable);
		
		this._glideeLength = value;
		return value;
	};
	p._getGlideeLength = function(value){
		
		return value;
	};
	
	p._contentLength = 0;
	p._setContentLength = function(value){
		if (this._contentLength != value){
			this._contentLength = value;
			this._resizeGlidee();
		}
		return value;
	};
	
	p._getContentLength = function(value){
		return value;
	};
	
	p._viewLength = 0;
	p._setViewLength = function(value){
		if (this._viewLength != value){
			this._viewLength = value;
			this._resizeGlidee();
		}
		return value;
	};
	
	p._getViewLength = function(value){
		return value;
	};
	
	p._value = 0;
	p._setValue = function(value){
	
		this._value = value;
		
		// trigger event
		this.dom.trigger('et.ui.glide.onChanged', this._value);
		return value;
	};
	p._getValue = function(value){
		return value;
	};
	
	p._glideeDistance = 0;
	p._setGlideeDistance = function(value){
		this._glidee.css(this._propOff, value + 'px');
		
		this._glideeDistance = value;
		
		var newValue = this._contentLength * this._glideeDistance / this._length;
		
		if (isNaN(newValue)) newValue = 0;
		
		this.value(newValue);
		return value;
	};
	p._getGlideeDistance = function(value){
		return value;
	};
	
	
	et.ui.glide = ctor;
}(jQuery);