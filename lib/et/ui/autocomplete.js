/*!require: hacks , et.dom , et.ui , jquery.dropTo , jquery.bgiframe */
/*
Ctor: et.ui.autocomplete

autocomplete implement, do not support retrieving data by using ajax, if you want it you may want to implement ._getData().
TODO: add code to delay the _getData() request when user keeps typing chars on the input, in order to reduce client side cpu
and server resource usage.

Options:
target - Specify the place holder, will be replaced with input element.
data - the predefined data set which contains options name and value.
column - Must be a property name of a single object in options.data, the property specified will be used as option name.
entriesPerPage - [default 0] how many options per page
customName - '',
inputClass - Class for input element.
inputHtml - If not null, autocomplete will use inputHtml as the html of input element.
defaultValue - the default value for input box, autocomplete will use this value to compare current value, 
	if current value is differernt autocomplete will try to display the dropdown at startup, 
	this is to prevent no dropdown displayed when js was loaded later and user already inputted data .
allowPaging - [default false] paging options when there are too many options.
allowListAll - [default true] true to list all option when nothing inputted
dropDelay - [default 300]
createWrapper - true to create a div wrapper for inputs.
returnFocus - [default true] true to return the focus back to input when user selected an option.
*/
(function(et, $){
    var defaultOptions={
        target: null,
        data: null,
        column: '',
        entriesPerPage: 0, // 0 = display all
        customName: '',
		inputClass: '',
		inputHtml: '',
		defaultValue: '',
        allowPaging: false,
        allowListAll: true,
		dropDelay: 0,
		createWrapper: false,
		returnFocus: true
    };
	var keyUp = 38, keyDown = 40, keyEnter = 13, keyEsc = 27;
	var msie6 = ($.browser.msie && $.browser.version < 7);
	var maxHeightProp = msie6?'height':'max-height';
    var ctor = function(options){
        this._options = {};
        $.extend(this._options, defaultOptions, options);

        this._options.target = $(this._options.target);
		
		this._busy = 0;
		
		if (this._options.target.length <= 0){
			throw new Error('et.ui.autocomplete: target was not found.');
		}
        
		if (this._options.createWrapper){
			this._dom = $(this._buildHtml()).addClass(this._options.customName).appendTo(this._options.target);
		}
		else{
			// take over the element
			this._dom = this._options.target.parent().addClass('et_js_autocomplete ' + this._options.customName);
			
			// if target is input and user didnot specify inputHtml, we don't need to replace target
			if (this._options.target.attr('tagName').toLowerCase() != 'input' || 
				!String.isNOE(this._options.inputHtml)){
				
				if (String.isNOE(this._options.inputHtml)){
					this._options.inputHtml = '<input type="text" autocomplete="off" />'
				}
				
				this._options.target.replaceWith(this._buildHtml());
			}
			else{
				this._options.target.after(this._buildHtml());
			}
		}
        this._inputWrapper = this._dom.find('.et_js_autocomplete_inputWrapper');
        this._input = this._dom.find('input').addClass(this._options.inputClass).data('et.ui.autocomplete', this);
		
		if (this._inputWrapper.length < 1){
			this._inputWrapper = this._input.addClass('et_js_autocomplete_inputWrapper');
		}
		
        this._result = this._dom.find('.et_js_autocomplete_result');
		this._resizeResultWidth();

		this._focusCursor = -1;
		
        this._hookEvents();

        // if there are value in input, display corresponding entries,
        // this is to prevent js was loaded slowly.
        if (this._input.val() != this._options.defaultValue){
            this._displayCurrent();
        }
    };

    var p = ctor.prototype;
    p._buildHtml = function(){
		if (this._options.createWrapper){
			return '<div class="et_js_autocomplete"><div class="et_js_autocomplete_inputWrapper">' +
					this._options.inputHtml + 
					'<div class="et_js_autocomplete_drop"></div>' +
				'</div><div class="et_js_autocomplete_result">' +
					'' +
				'</div>' +
				'</div>';
		}
		else if(!String.isNOE(this._options.inputHtml)) {
			return this._options.inputHtml + 
					'<div class="et_js_autocomplete_result">' +
					'</div>';
		}
		else {
			return '<div class="et_js_autocomplete_result">' +
				'</div>';
		}
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
			var _resize = (function(){
				if (this._result.is(':visible')){
					this._resizeResult();
				}
			}).bind(this);
			
			if (!msie6){
				_resize(this);
			}
			else{
				// if it is ie6 (or maybe 7) getting offset and position will be incorrect when resize
				setTimeout(_resize, 100);
			}
			
        }).bind(this));
        var global = window;
        if ($.browser.msie){
            global = document.documentElement;
        }
        $(global).click((function(evt){
			if (evt.target != this._result.get(0))
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
		if (elEntries.length <= this._focusCursor) {
			return; 
		}
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
			this._busy++;
			setTimeout((function(){
				this._busy--;
				if (this._busy > 0){
					return;
				}
				var entries = this._getData(this._input.val());
				this._handleDrop(entries);
			}).bind(this), this._options.dropDelay)
		}
		this._highlightEntry();
    };
	p._handleKeyDown = function(evt){
		var elEntries = this._result.find('.et_js_autocomplete_entry');
		
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
			if (this._focusCursor <= -1 || elEntries.length <= this._focusCursor) return;
			// rewrite target
			evt.target = elEntries.eq(this._focusCursor).get(0);
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
		
        if (entries == null || entries.length <=0) {
            this._result.hide();
            return;
        }
		
		// it doesn't make sense to display the dropdown when there is only one option and the value of option
		// is already inputted.
		if (entries.length == 1 && entries[0][this._options.column] == this._input.val()){
			this._result.hide();
			return;
		}

        for(var i = 0; i < entries.length; i++){
            this._result.append(this._createEntry(entries[i]));
        }
	
        if (!this._result.is(':visible')){
            this._resizeResult();
        }
		
		// for mother fucking ie 6
		if (msie6){
			this._result.bgiframe();
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
			.mouseup((function(){
				this._handleEntryMouseUp.apply(this, arguments);
			}).bind(this))
			.mousedown((function(){
				this._handleEntryMouseDown.apply(this, arguments);
			}).bind(this))
			.mouseout((function(){
				this._handleEntryMouseOut.apply(this, arguments);
			}).bind(this))
            .data('et.ui.autocomplete.entry', node);

        return ret;
    };
    p._handleEntryClick = function(evt){
        var value = $(evt.target).data('et.ui.autocomplete.entry');
        this.hideDrop();
		this._input.val(value[this._options.column]);
        $(this._options.target).trigger('autocompleteselect', value);
		if (this._options.returnFocus){
			this._input.trigger('focus');
		}
    };
	p._handleEntryMouseOut = function(evt){
        this.userPressing = false;
    };
	p._handleEntryMouseDown = function(evt){
        this.userPressing = true;
    };
	p._handleEntryMouseUp = function(evt){
        this.userPressing = false;
    };
	p._handleEntryHover = function(evt){
		this._result.find('.et_js_autocomplete_entry').removeClass('et_js_autocomplete_entry_highlight');
		$(evt.target).addClass('et_js_autocomplete_entry_highlight');
	};
    p._resizeResult = function(){
        var box = et.dom.getEnv();
		
        // fade in to correct position
        this._result
                .show().dropTo(this._inputWrapper).outerBottom().innerLeft()
				// remove height
				.height('auto');

        var offset  = this._result.offset();
        
		var cssObj = {};
		
		var maxHeight = box.clientHeight - offset.top + box.bodyScrollTop - 6;
		
		if (!msie6){
			// for all modern browsers
			cssObj[maxHeightProp] =  maxHeight;
		}
		else if(maxHeight < this._result.outerHeight()){
			// for mother fucking ie 6
			cssObj[maxHeightProp] =  maxHeight;
		}
		
        this._result.css(cssObj).hide().fadeIn('fast');
    };
	p._resizeResultWidth = function(){
		this._result.css('width', parseInt(this._result.css('width')>>>0) + this._inputWrapper.outerWidth() - this._result.outerWidth());
	};
	p.resize = function(){
		this._resizeResultWidth();
	}
    p.hideDrop = function(){
        this._result.hide();
		this._focusCursor = -1;
    };
	p.showDrop = function(){
		this._result.not(':visible').show();
	};
    p.onSelect = function(func){
        $(this._options.target).bind('autocompleteselect', func);
    }
    
    et.ui.autocomplete = ctor;
})(et, jQuery);
