/*
Ctor: et.ui.progress

progress indicator implementation

Options:
indicatorHtml - 
type - progressive or fixed
max - the max value of the progress, default to 10
customName - 
*/
(function (et, $) {
    var defaultOptions = {
        indicatorHtml: '',
        type: 'fixed', // progressive or fixed
        max: 10,
        customName: ''
    };

    var ctor = function(options){
        this._options = {};
        $.extend(this._options, defaultOptions, options);

        this._dom = $(this._buildHtml())
            .addClass(this._options.customName); 

        /*
        Property: index
        */
        this.index = 0;
    };

    var p = ctor.prototype;
    p._buildHtml = function(){
        var indicatorsHtml = "";
        if (this._options.type == 'fixed'){
            var i = this._options.max;
            while(i--){
                indicatorsHtml+= "<div class='et_js_progress_indicator' ></div>";
            }
            return "<div class='et_js_progress'><%=indicators %></div>"
                .macro(indicatorsHtml);
        }

        return '';
    };
    /*
    Method: value
    Get or set the current progress
    */
    p.value = function(value){
        if (type == 'fixed'){
            this._dom
                .find('.et_js_progress_indicator_highlight')
                    .removeClass('et_js_progress_indicator_highlight')
                    .end()
                .find('.et_js_progress_indicator:eq(' + value + ')')
                    .addClass('et_js_progress_indicator_highlight');
        }
    };
    /*
    Method: next
    */
    p.next = function(){
        this._index++;
        this.value(this._index);
    };

    et.ui.progress = ctor;
})(et, jQuery);