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
lastSelector - selector for 'last' button, selected element will be treated as 'replay' button on last slide.
switchOutAction - 'fadeOut', 'hide' or any other jQuery supported effect function name.
switchInParam - the parameter pass to switchOutAction
switchInAction - 'fadeIn', 'show' or any other jQuery supported effect function name.
switchInParam: - the parameter pass to swithcInAction
firstIn - call switchInAction before switchOutaction
indicatorInteractable - true to enable indicator interaction.
indicatorInteractAction - 'mouseover', 'click' or another jQuery supported dom event function name.
	The default value is 'click'
indicatorInteractionDelay - if larger than 0, interaction will delay N  * 10 miliiseconds.
autoPlay - true to enable autoplay
autoPlayInterval - The auto play interval
autoPlayStopWhenHover - true to stop auto play when cursor hovering on slideshow
baseZIndex - base zindex for all elements in slide
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
		switchOutParam: '',
		switchInAction: 'fadeIn',
		switchInParam: '',
		firstIn: false,
		indicatorInteractable: true,
		indicatorInteractAction: 'click',
		indicatorInteractionDelay: 0,
		autoPlay: false,
		autoPlayInterval: 6000,
		autoPlayStopWhenHover: true,
		baseZIndex: 6000
    };

    var ctor = function(options){
        this._options = {};
        $.extend(this._options, defaultOptions, options);

        var target = this._options.target = $(this._options.target);

        this._index = 0;

        this._dom = target;
		
		// member variables
		this._busy = false;
		this._lastIndicatorIndex = 0;
		this._prevIndicatorIndex = 0;

        // find elements
        this._slides = target.find(this._options.slideSelector);

        //this._slidesParent = this._slides.parent();

        this._next = this._options.target.find(this._options.nextSelector);
        this._last = this._options.target.find(this._options.lastSelector);

        // init slide, set all slide to same position
        this._slides.css({
				'zIndex': this._options.baseZIndex
			}).
			eq(0).show();
		
		this._indicators = target.find(this._options.indicatorSelector)
			.css('zIndex', this._options.baseZIndex + this._slides.length + 1);
			
        // hook events
        this._hookEvents();

        this.showSlide(0);
		
		this._startAutoPlay();
    };

    var p = ctor.prototype;
	
	/* delay start feature */
	p._startDelayInterval = function(){
		if (this._delayTimer == null){
			this._delayTimer = setInterval((function(){
				if (this._delayCountDown > 0){
					this._delayCountDown--;
				}
				else {
					this._handleShowSlide();
					this._stopDelayCountDown();
				}
			}).bind(this), 100);
		}
	};
	p._stopDelayCountDown = function(){
		clearInterval(this._delayTimer);
		this._delayTimer = null;
		delete this._delayTimer;
		
	};
	p._resetDelayCountDown = function(){
		this._delayCountDown = this._options.indicatorInteractionDelay;
	};
	
	/* auto play feature */
	p._startAutoPlay = function(){
		if (!this._options.autoPlay) return;
		this.play();
	};
	p._stopAutoPlay = function(){
		clearInterval(this._autoPlayTimer);
	};
	p._resetAutoPlay = function(){
		this._stopAutoPlay();
		this._startAutoPlay();
	};
	
    p._hookEvents = function(){
        var callHandler = (function(evt){
            this._showNext.apply(this, arguments);
			evt.preventDefault();
			return false;
        }).bind(this);
        this._next.click(callHandler);
        this._last.click(callHandler);
		
		if (this._options.indicatorInteractable){
			this._indicators.each((function(i, el){
				$(el)[this._options.indicatorInteractAction]((function(evt){
					this._resetAutoPlay();

					// handle indicator interact
					var index = 0;
					var target = $(evt.target);
					// if target is not indicator, we want to search its ancestor
					if (target.is(this._options.indicatorSelector)){
						index = target.index(this._options.indicatorSelector);
					}
					else{
						index = target.closest(this._options.indicatorSelector)
							.index(this._options.indicatorSelector);
					}
					
					// if already the one hovered, don't flick 
					if (this._index != index){
						
						this._index = index ;
						this.showSlide(this._index);
						//this._showNext();
					}
					
				}).bind(this));
			}).bind(this));
		}
		
		this._dom.mouseover((function(){
			this._stopAutoPlay();
		}).bind(this));
		this._dom.mouseout((function(){
			if (this._options.autoPlay)	this._resetAutoPlay();
		}).bind(this));
    };
    p._showNext = function(){
        this._index++;

        if (this._index >= this._slides.length){
            this._index = 0;
        }

        this.showSlide(this._index, true);
    };
	p._handleShowSlide = function(){
		if (this._options.firstIn){
			this._slides.stop(true, true)
				// set previous slide lower
				.eq(this._prevIndicatorIndex).css('zIndex', this._slides.length + this._options.baseZIndex).end() 
				.eq(this._lastIndicatorIndex)
				.css({
					'zIndex': this._slides.length + this._options.baseZIndex + 1
				})[this._options.switchInAction](this._options.switchInParam, (function(){
					this._slides.each((function(i, el){
						if (i != this._lastIndicatorIndex){
							$(el).css({
								'zIndex': i + this._options.baseZIndex
							})[this._options.switchOutAction](this._options.switchOutParam);
						}
					}).bind(this));
				}).bind(this));
		}	
		else{
			this._slides.stop(true, true)[this._options.switchOutAction](this._options.switchOutParam)
				.eq(this._lastIndicatorIndex)[this._options.switchInAction](this._options.switchInParam);
		}
		this._prevIndicatorIndex = this._lastIndicatorIndex;
	};
    /*
    Method: show
    
    display slideshow
    */
    p.show = function(){
        this._options.target.show();
		
		this._options.target.trigger('et.ui.slide.show');
    };
    /*
    Method: showSlide

    switch to specified slide
    */
    p.showSlide = function(index, noDelay){
		this._busy = true;
		
		this._lastIndicatorIndex = index;
		
		// animate indicator
		this._indicators.removeClass(this._options.indicatorActiveClass)
            .eq(index).addClass(this._options.indicatorActiveClass);
		
		// animate slide, delay if possbile
		if (this._options.indicatorInteractionDelay > 0 &&  noDelay !== true){
			this._resetDelayCountDown();
			this._startDelayInterval();
		}
		else{
			this._handleShowSlide();
		}
        

        // if it is not last slide hide last button, vice verse
        if (index < this._slides.length - 1){
            this._last.hide();
            this._next.show();
        }
        else{
            this._next.hide();
            this._last.show();
        }
		
		this._busy = false;
    };
	p.play = function(){
		var handleAutoPlay = (function(){
			this._showNext();
		}).bind(this);
		if (this._autoPlayTimer){
			this._stopAutoPlay();
		}
		this._autoPlayTimer = setInterval(handleAutoPlay , this._options.autoPlayInterval);
		this._options.autoPlay = true;
	};
	p.onShow = function(callback){
		this._options.target.bind('et.ui.slide.show', callback);
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