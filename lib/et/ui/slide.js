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