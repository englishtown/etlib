/*!require: et.util */
/*
	Object: et.util.sessionStore
	
	a small utility that save infomation to browser session, let you grab info back without cookie when page refresh or backwarded
*/
!function($){

var json = window.JSON;
/* a stupid little JSON.stringify replacement, in case there isn't one */
(json && json.stringify) || (json = {}, json.stringify = function(obj){
	var ret = ' { ' ;
	var first = true;
	for(var name in obj){
		if (!first){
			ret += ' , ';
		}
		ret += ' "' + name + '" :';
		ret += ' "' + obj[name] + '" ' ;
		first = false;
	}
	ret += ' } ';
	return ret;
});

ss = {};
ss.save = function (name, value) {
	var store = null;
	try {
		store = $.parseJSON(window.name);
	}
	catch (ex) { }
	if (!store) store = {};

	store[name] = value;

	window.name = json.stringify(store);

};

ss.get = function (name) {
	var store = null;
	try {
		store = $.parseJSON(window.name);

	}
	catch (ex) { }
	if (!store) return;
	return store[name];
};

et.util.sessionStore = ss;
}(jQuery);