/*!require: et , et.ui */
/*
Singleton: et.ui.overlayController

helps to arrange the display order of overlay, make sure overlay display one by one.


*/
(function(et, $){
	var ctor = function(){
		this.overlays = [];
		
		this.showQueue = [];
		
		this.isAnyShown = false;
	};
	
	var p = ctor.prototype;
	p.push = function(overlay){
		
		overlay._controllerData = {};
		
		// replace original show function
		overlay._controllerData.show = overlay.show;
		overlay.show = this._handleOverlayShow;
		
		// register when dispose
		overlay.onDispose(this._handleOverlayDispose);
		
		this.overlays.push(overlay);
	};
	p.remove = function(overlay){
		// deregister overlay
		var l = this.overlays.length;
		while(l--){
			if (this.overlays[l] == overlay){
				this.overlays.splice(l, 1)
				break;
			}
		}
	};
	p._handleOverlayShow = function(){
		// if some overlay already on top, let's queue current.
		// otherwise, show it.
		if (instance.isAnyShown){
			instance.showQueue.push(this);
		}else{
			instance.isAnyShown = true;
			this.onHide(instance._handleOverlayHide);
			this._controllerData.show.apply(this, arguments);
		}
	};
	p._handleOverlayHide = function(){
		instance.isAnyShown = false;
		if (instance.showQueue.length > 0){
			showQueue.pop().show()
		}
	};
	p._handleOverlayDispose = function(){
		instance._handleOverlayHide.apply(this);
		
		instance.remove(this);
	};
	
	var instance = new ctor;
	et.ui.overlayController = instance;
})(et, jQuery);