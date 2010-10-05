/*!require: et.util , et.util.config */
/*
*/
(function(et, $){
	ctor = function(howToPop){
		this.pop = howToPop;
	};
	et.popupController = new function(){
		this.small = new ctor(function(){
			
		});
	};
	
})(et, jQuery);