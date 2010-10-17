/*!require: hacks, et.dom , et.ui , et.ui.overlay , et.ui.lightboxController */
/*
Ctor: et.ui.lightbox

Lightbox implementation.
Note: To localization the closingText, you can also set default text option at et.ui.lightbox.defaultOptions.closingText;
Sample Code: 
et.ui.lightbox.defaultOptions.closingText = 'blah'

Options:
target - Specify the element which will be inserted into lightbox and displayed as content
closingText - The label for the closing button
customName - A customized class name for the root element of the lightbox
controlled - true to register current instance to lightbox controller, lightbox controller will helps to manage the sequence of lightbox and the order of showing lightbox.
onHide - Specify a callback which will be fired when lightbox hided.

*/
(function (et, $) {

    // default options 
    var defaultOptions = {
        target: null,
        onHide: null,
        closingText: 'Close',
        customName: '',
		controlled: true,
		frameHtml: '<div class="et_js_lightbox_wrapper" >' +
			'<div class="et_js_lightbox_wrapper_top">' +
				'<div class="et_js_lightbox_wrapper_bar">' +
					'<span class="et_js_lightbox_wrapper_close"><%=ct %> <span class="et_sprite et_sprite_close"></span></span>' +
				'</div>' +
			'</div>' +
			'<div class="et_js_lightbox_wrapper_elastic">' +
				'<div class="et_js_lightbox_wrapper_content"></div>' +
			'</div>' +
		'</div>'
    };

    var ctor = function (options) {

        this._options = {};

        $.extend(this._options, defaultOptions, options);

        if (this._options.target == null) {
            throw new Error('Targeting element was not specified.');
        }
        else {
            this._options.target = $(this._options.target);
        }
		
        // prevent init() be overrided by inheritances
        p._init.apply(this, arguments);
    };

    ctor.prototype = {
        _init: function () {
		
			if (et.ui.overlayController && this._options.controlled){
				// register to controller
				et.ui.overlayController.push(this);
				this._options.controlled = false;
			}
            this._overlay = new et.ui.overlay(this._options);

            this._dom = this._createWrapper()
                .appendTo(this._overlay.container)
            // bind event
                .find('.et_js_lightbox_wrapper_close').click((function () {
                    this.hide();
                }).bind(this)).end();

            // record the target's parents, so that we can recover it later
            this._targetParent = this._options.target.parent();

            this._options.target
                .appendTo(this._dom.find('.et_js_lightbox_wrapper_content'));


        },
        _createWrapper: function () {
            return $((this._options.frameHtml).macro('ct', this._options.closingText));
        },
        /*
        Method: show

        Display lightbox 
        */
        show: function () {
            this._overlay.show();
            this._options.target.show();

            var top = (et.dom.getEnv().clientHeight - $(this._dom).outerHeight(true)) / 2;
            top = top > 0 ? top : 0;

            // set the margin top before fadein, display it on the middle of the screen
            this._dom.css('marginTop', top + 'px');
			
			if (this._options.onShow != null) {
                this._options.onShow(this);
            }
			this._options.target.trigger('et.ui.lightbox.show');
        },
        /*
        Method: hide
        
        Hide lightbox
        */
        hide: function () {
            this._options.target.hide();
            this._overlay.hide();

            if (this._options.onHide != null) {
                this._options.onHide(this);
            }
			this._options.target.trigger('et.ui.lightbox.hide');
        },
        /*
        Method: dispose

        Dispose elements that created dynamically, and return options.target to its original parent
        */
        dispose: function () {
            // return target to original place before removing the entire element
            this._targetParent.append(this._options.target);

            this._dom.remove();
			
			this._options.target.trigger('et.ui.lightbox.dispose');
        },
		onHide: function(callback){
			this._options.target.bind('et.ui.lightbox.hide', callback);
		},
		onShow: function(callback){
			this._options.target.bind('et.ui.lightbox.show', callback);
		},
		onDispose: function(callback){
			this._options.target.bind('et.ui.lightbox.dispose', callback);
		}
    };

    var p = ctor.prototype;

    et.ui.lightbox = ctor;
    et.ui.lightbox.defaultOptions = defaultOptions;

})(et, jQuery);