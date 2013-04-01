/*
Namespace: et

The root namespace for English Town client code
*/
!(function(){
    var ns = function(target){
        var names = target.split('.');
        var name;

        // point to the global object
        var node = (new Function("return this"))();

        for(var i = 0; i < names.length;i++){
            name = names[i];

            if (!node[name]){
                node[name] = {};
            }

            node = node[name];
        }
    };

    // create the root namespace
    ns('et');

    /*
    Function: ns

    A namespace creating helper
    */
    et.ns = ns;

})();

et.undef = (function(undefined){ return undefined; })();

/*
Function: ctor

A contructor helper,  it create a contructor which implements a inheritant chain.
*/
et.ctor = function(ctor, base) {
    var hasBase = base != null;
    var ret = function() {
        if (hasBase) {
            base.apply(this, arguments);
        }
        ctor.apply(this, arguments);
    }

    if (hasBase) {
        var temp = function() { };
        temp.prototype = base.prototype;
        ret.prototype = new temp();
        ret.prototype._core = {};
        if (base.prototype._core != null &&
            base.prototype._core.ctor != null) {
            ret.prototype._core.base = base.prototype._core.ctor;
        }
        else {
            ret.prototype._core.base = base;
        }
    }
    else {
        ret.prototype._core = {};
        ret.prototype._core.base = null;
    }

    ret.prototype._core.ctor = ctor;
    ret.prototype._core.wrapper = ret;

    return ret;
}

/*
    Function: et.prop
    Create a setter or getter
*/
et.prop = function(defaultValue, getFunc, setFunc) {
    var value = defaultValue;
    return function(newValue) {

        if (typeof newValue == "undefined") {
            if (getFunc == null) {
                return value;
            }

            return getFunc.call(this, value);
        } else {
            if (setFunc == null) {
                value = newValue;
                return;
            }
            value = setFunc.call(this, newValue);
            return;
        }
    }
};

/*
Function: et.ref
Change the value of wrapper of value types.
*/
et.ref = function(valueObj, value){
    valueObj.valueOf = function(){ return value; };
};
