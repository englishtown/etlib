/*!require: hacks , et.ui , jquery.dropTo */
/*
Ctor: et.ui.autocomplete

autocomplete implement, do not support retrieving data by using ajax, if you want it you may want to implement ._getData().
TODO: add code to delay the _getData() request when user keeps typing chars on the input, in order to reduce client side cpu
and server resource usage.

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
		this._result.not(':visible').show();
	};
    p.onSelect = function(func){
        $(this._options.target).bind('autocompleteselect', func);
    }
    
    et.ui.autocomplete = ctor;
})(et, jQuery);
