/*!require: et.ui.base , et.ui.glide , jquery.dropTo , jquery.scrollable */
/* 
Ctor: et.ui.scrollbar

A full customizable scrollbar

Options:
target 		- target element that requires a customized scrollbar.
direction   - position of the scrollbar, value could be w, s, n, e
masking		- true to enable a transulent masking on top or bottom to indicate 'there are more'.
*/

!function ($) {

	var ctor = et.ctor(function (options) {

		var target = this.opts.target;

		// ***********
		// * Variables
		// ***********	
		var glideDirection = this.opts.direction == 'w' || this.opts.direction == 'e' ? 'ns' : 'we';
		this._propLen = glideDirection == 'ns' ? 'height' : 'width';
		this._propOuterLen = glideDirection == 'ns' ? 'outerHeight' : 'outerWidth';
		this._propOffShore = glideDirection == 'ns' ? 'top' : 'left';

		var scrollProps = {
			top: 'scrollTop',
			left: 'scrollLeft'
		};

		this._propScroll = scrollProps[this._propOffShore];

		this._glide = new et.ui.glide({
			direction: glideDirection
		});

		// indicate whether to stop watching (recusively calling watch func)
		this._stopWatching = false;

		this._isTopMaskingSet = 0;
		this._isBottomMaskingSet = 0;

		this._maskingCount = 1;
		this._maskingHash = {};

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
			.append(this._glide.dom)
			.appendTo(document.body);

		// hide all scrollbars on target
		target.css({
			overflow: 'hidden',
			'overflow-x': 'hidden',
			'overflow-y': 'hidden',
			position: 'relative' // set target to relative so it is easier for us to control dom position.
		})
		.scrollable();

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
		masking: false,
		startMaskingLeave: .05,
		startMaskingClose: .05,
		direction: 'e' // position of scrollbar
	};

	p.show = function () {
		this.dom.show();
		this.opts.target.scrollableResume();
	};
	// keep an eye on the content width/length and position of scrollbar
	p.watch = function () {

		if (this._stopWatching) return;

		this.refresh();

		setTimeout($.proxy(this.watch, this), 100);
	};
	p.refresh = function () {
		this._handleResize();

		this._glide.refresh();

		this._handleMasking();
	};

	p.dispose = function () {
		this._glide.unbindChange(__glideChange);

		this._stopWatching = true;

		this._glide.dispose();
	};

	p._cloneSize = function () {
		// clone the size of target
		var t = this.opts.target;
		var len = t[this._propOuterLen]();
		var content = { top: t.get(0).scrollHeight, left: t.get(0).scrollWidth };

		// set wrapper as same length as glide
		this.dom[this._propLen](len);

		if (content[this._propOffShore] > len) {
			// show before setting glide
			// so glide can property caculate the size 
			this.dom.show();
			this.opts.target.scrollableResume();

			this._glide.length(len);
			this._glide.viewLength(len);
			this._glide.contentLength(content[this._propOffShore]);
			return true;
		}
		else {
			this.dom.hide();
			this.opts.target.scrollablePause();
			return false;
		}
	};
	p._setPos = function () {
		// set dom to proper position
		this.dom.dropTo(this.opts.target);
		switch (this.opts.directon) {
			case 'w':
				this.dom.innerLeft().atMiddle();
				break;
			case 'n':
				this.dom.innerTop().atCenter();
				break;
			case 's':
				this.dom.innerBottom().atCenter();
				break;
			case 'e':
			default:
				this.dom.innerRight().atMiddle();
				break;
		}
	};
	p._setGlidee = function () {
		// set scroll handler position if it is scrolled.
		if (!this._oldScrollPos) {
			this._oldScrollPos = 0;
		}
		var curScrollPos = this.opts.target.get(0)[this._propScroll];
		if (this._oldScrollPos != curScrollPos) {
			this._glide.value(curScrollPos);
			this._oldScrollPos = curScrollPos;
		}
	};

	// **********
	// Masking Functions Start
	// **********
	p._refreshAlphaMasking = function () {

		// check if there is item in hash
		var hasItem = false;
		for (var k in this._maskingHash) {
			if (!this._maskingHash.hasOwnProperty(k)) continue;
			hasItem = true;
			break;
		}

		// if there isn't , clear filter and exit
		if (!hasItem) {
			this.opts.target.css({
				filter: '',
				webkitMaskImage: ''
			});
			return;
		};

		// TODO: better manipulation of ie filters and webkit mask
		// for webkit currently only support vertical masking because harded points
		var currentFilter = '', currentWebkitMask = '-webkit-gradient(linear, left top, left bottom';
		
		for (var k in this._maskingHash) {
			if (!this._maskingHash.hasOwnProperty(k)) continue;

			var data = this._maskingHash[k];

			// for ie
			currentFilter += 'Alpha(Opacity=100, FinishOpacity=0, Style=1, StartY=' + data.sy +
				', StartX=' + data.sx + ', FinishY= ' + data.ey + ', FinishX=' + data.ex + ') ';

			// for webkit
			currentWebkitMask += ',color-stop(' + data.sy + '%,  rgba(0,0,0,1)),' +
								  'color-stop(' + data.ey + '%,  rgba(0,0,0,0))';

		}

		currentWebkitMask += ')';

		this.opts.target.css({
			filter: currentFilter,
			webkitMaskImage: currentWebkitMask
		});
	};
	p._setAlphaMasking = function (data) {
		var id = this._maskingCount++;
		this._maskingHash[id] = data;

		this._refreshAlphaMasking();

		return id;
	};
	p._clearAlphaMasking = function (id) {
		delete this._maskingHash[id];
		this._refreshAlphaMasking();
	};
	// **********
	// Masking Functions End
	// **********

	p._handleResize = function () {
		if (this._cloneSize()) {
			this._setPos();
		}
		// set scroll handler position if it is scrolled.
		this._setGlidee();
	};
	p._handleGlideChange = function (evt, value) {
		if (this.opts.target.get(0)[this._propScroll] != value) {
			this.opts.target.get(0)[this._propScroll] = value;
		}
	};

	p._handleMasking = function () {
		// masking css reference:
		// filter: Alpha(Opacity=100, FinishOpacity=0, Style=1, StartY=80, StartX=0, FinishY=100, FinishX=0);
		// -webkit-mask-image: -webkit-gradient(linear, 0 70%, 0 100%, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)));
		var ratio = this._glide.value() / (this._glide.contentLength() - this._glide.viewLength());

		if (ratio > this.opts.startMaskingLeave) {
			if (this._isTopMaskingSet <= 0) {

				this._isTopMaskingSet = this._setAlphaMasking({
					sx: 0,
					sy: 20,
					ex: 0,
					ey: 0
				});
			}
		}
		else {
			// clear css
			if (this._isTopMaskingSet > 0) {
				this._clearAlphaMasking(this._isTopMaskingSet);
				this._isTopMaskingSet = 0;
			}
		}
		
		if (1 - ratio > this.opts.startMaskingClose){
			if (this._isBottomMaskingSet <= 0) {

				this._isBottomMaskingSet = this._setAlphaMasking({
					sx: 0,
					sy: 80,
					ex: 0,
					ey: 100
				});
			}
		}
		else{
			// clear css
			if (this._isBottomMaskingSet > 0) {
				this._clearAlphaMasking(this._isBottomMaskingSet);
				this._isBottomMaskingSet = 0;
			}
		}
	};

	et.ui.scrollbar = ctor;
} (jQuery);