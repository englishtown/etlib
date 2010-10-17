/*!require: et.dom , et.ui */
/*
Ctor: et.ui.overlay

Overlay implementation, display a alpha transparency background that hover on the window,
blocking access to elements under it.

TODO: drain all keyboard and mouse events

Options:
customName - A customized class name for the root element of the overlay
controlled - true to register current instance to overlay controller, overlaycontroller will helps to manage the sequence of overlay and the order of showing overlay.
*/
(function (et, $) {
    var defaultOptions = {
        customName: '',
		controlled: true
    };

    var ctor = function (options) {
        this._options = {};

        $.extend(this._options, defaultOptions, options);

        p._init.apply(this, arguments);
    };

    ctor.prototype = {
        _init: function () {
            // creating elements, should be cleaned up when dispose
            this._dom = $('<div class="et_js_lightbox ' + this._options.customName + '" />')
                .hide();
            this._mask = $('<div class="et_js_lightbox_mask" style="height: 100%" />')
                .fixPosition()
                .appendTo(this._dom).hide();
            /*
            Property: container

            The content container
            */
            this.container = $('<div class="et_js_lightbox_container" />')
                .fixPosition()
                .appendTo(this._dom).hide();

            // append root to document.body at last can speed up the initialization
            this._dom.appendTo(document.body);
			
			if (et.ui.overlayController && this._options.controlled){
				// register to controller
				et.ui.overlayController.push(this);
			}
        },
        /*
        Method: show
        
        Display overlay
        */
        show: function () {
            this._dom.show();
            this.container.show();
            this._mask.show().css('opacity', 0).fadeTo('slow', 0.5);
			this._dom.trigger('et.ui.overlay.show');
        },
        /*
        Method: hide

        Hide overlay
        */
        hide: function () {
            this._mask.hide();
            this.container.hide();
            this._dom.hide();
			this._dom.trigger('et.ui.overlay.hide');
        },
        /*
        Method: dispose

        Dispose overlay, remove unneccesary elements from dom.
        */
        dispose: function () {
            this._mask.remove();
            this.container.remove();
            this._dom.remove();
			this._dom.trigger('et.ui.overlay.dispose');
        },
		onHide: function(callback){
			this._dom.bind('et.ui.overlay.hide', callback);
		},
		onShow: function(callback){
			this._dom.bind('et.ui.overlay.show', callback);
		},
		onDispose: function(callback){
			this._dom.bind('et.ui.overlay.dispose', callback);
		},
    };

    var p = ctor.prototype;

    et.ui.overlay = ctor;

})(et, jQuery);