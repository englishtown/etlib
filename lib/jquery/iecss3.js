/*!require: et.dom */
/*
jQueryPlugin: jQuery.fn.iecss3

allow ie to support css3 radius border and shadow
modified based on http://fetchak.com/ie-css3/
*/
(function(et, $){

var timer_length = 200, // Milliseconds
	border_opacity = false; // Use opacity on borders of rounded-corner elements? Note: This causes antialiasing issues
var namespace = 'IECss3ShadowFix';

function createBoxShadow(element, vml_parent) {
	var style = element.currentStyle['iecss3-box-shadow'] || element.currentStyle['-moz-box-shadow'] || element.currentStyle['-webkit-box-shadow'] || element.currentStyle['box-shadow'] || '';
	
	var match = style.match(/^(-?\d+)px (-?\d+)px (\d+)px/);
	if (!match) { return(false); }

	var shadow = document.createElement('v:roundrect');
	shadow.userAttrs = {
		'left': parseInt(RegExp.$1 || 0),
		'top': parseInt(RegExp.$2 || 0),
		'radius': parseInt(RegExp.$3 || 0) / 2
	};
	shadow.position_offset = {
		'top': (0 - vml_parent.pos_ieCSS3.top - shadow.userAttrs.radius + shadow.userAttrs.top),
		'left': (0 - vml_parent.pos_ieCSS3.left - shadow.userAttrs.radius + shadow.userAttrs.left)
	};
	shadow.size_offset = {
		'width': 0,
		'height': 0
	};
	
	shadow.arcsize = element.arcSize +'px';
	shadow.style.display = 'block';
	shadow.style.position = 'absolute';
	shadow.style.top = (element.pos_ieCSS3.top + shadow.position_offset.top) +'px';
	shadow.style.left = (element.pos_ieCSS3.left + shadow.position_offset.left) +'px';
	shadow.style.width = element.offsetWidth +'px';
	shadow.style.height = element.offsetHeight +'px';
	shadow.style.antialias = true;
	shadow.className = 'vml_box_shadow';
	if (element.style.zIndex - 1 < 0){
		element.style.zIndex+=1;
	}
	shadow.style.zIndex = element.style.zIndex - 1<0?0:element.style.zIndex - 1;
	
	// TODO: opacity should be caculated by using eleemnt.opacity & background color grey scale
	// for now lets hard coded it
	shadow.style.filter = 'progid:DXImageTransform.Microsoft.Blur(pixelRadius='+ shadow.userAttrs.radius +',makeShadow=true,shadowOpacity='+ 0.2 +')';
	
	element.parentNode.appendChild(shadow);
	//element.parentNode.insertBefore(shadow, element.element);

	// For window resizing
	element.vml.push(shadow);
	
	return(true);
}

function createBorderRect(element, vml_parent) {
	if (isNaN(element.borderRadius)) { return(false); }

	element.style.background = 'transparent';
	element.style.borderColor = 'transparent';

	var rect = document.createElement('v:roundrect');
	rect.position_offset = {
		'top': (0.5 * element.strokeWeight) - vml_parent.pos_ieCSS3.top,
		'left': (0.5 * element.strokeWeight) - vml_parent.pos_ieCSS3.left
	};
	rect.size_offset = {
		'width': 0 - element.strokeWeight,
		'height': 0 - element.strokeWeight
	};
	rect.arcsize = element.arcSize +'px';
	rect.strokeColor = element.strokeColor;
	rect.strokeWeight = element.strokeWeight +'px';
	rect.stroked = element.stroked;
	rect.className = 'vml_border_radius';
	rect.style.display = 'block';
	rect.style.position = 'absolute';
	rect.style.top = (element.pos_ieCSS3.top + rect.position_offset.top) +'px';
	rect.style.left = (element.pos_ieCSS3.left + rect.position_offset.left) +'px';
	rect.style.width = (element.offsetWidth + rect.size_offset.width) +'px';
	rect.style.height = (element.offsetHeight + rect.size_offset.height) +'px';
	rect.style.antialias = true;
	rect.style.zIndex = element.zIndex - 1;

	if (border_opacity && (element.opacity < 1)) {
		rect.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(Opacity='+ parseFloat(element.opacity * 100) +')';
	}

	var fill = document.createElement('v:fill');
	fill.color = element.fillColor;
	fill.src = element.fillSrc;
	fill.className = 'vml_border_radius_fill';
	fill.type = 'tile';
	fill.opacity = element.opacity;

	// Hack: IE6 doesn't support transparent borders, use padding to offset original element
	isIE6 = /msie|MSIE 6/.test(navigator.userAgent);
	if (isIE6 && (element.strokeWeight > 0)) {
		element.style.borderStyle = 'none';
		element.style.paddingTop = parseInt(element.currentStyle.paddingTop || 0) + element.strokeWeight;
		element.style.paddingBottom = parseInt(element.currentStyle.paddingBottom || 0) + element.strokeWeight;
	}

	rect.appendChild(fill);
	element.parentNode.appendChild(rect);
	//element.parentNode.insertBefore(rect, element.element);

	// For window resizing
	element.vml.push(rect);

	return(true);
}

function createTextShadow(element, vml_parent) {
	if (!element.textShadow) { return(false); }

	var match = element.textShadow.match(/^(\d+)px (\d+)px (\d+)px (#?\w+)/);
	if (!match) { return(false); }


	//var shadow = document.createElement('span');
	var shadow = element.cloneNode(true);
	var radius = parseInt(RegExp.$3 || 0);
	shadow.userAttrs = {
		'left': parseInt(RegExp.$1 || 0) - (radius),
		'top': parseInt(RegExp.$2 || 0) - (radius),
		'radius': radius / 2,
		'color': (RegExp.$4 || '#000')
	};
	shadow.position_offset = {
		'top': (0 - vml_parent.pos_ieCSS3.top + shadow.userAttrs.top),
		'left': (0 - vml_parent.pos_ieCSS3.left + shadow.userAttrs.left)
	};
	shadow.size_offset = {
		'width': 0,
		'height': 0
	};
	shadow.style.color = shadow.userAttrs.color;
	shadow.style.position = 'absolute';
	shadow.style.top = (element.pos_ieCSS3.top + shadow.position_offset.top) +'px';
	shadow.style.left = (element.pos_ieCSS3.left + shadow.position_offset.left) +'px';
	shadow.style.antialias = true;
	shadow.style.behavior = null;
	shadow.className = 'ieCSS3_text_shadow';
	shadow.innerHTML = element.innerHTML;
	// For some reason it only looks right with opacity at 75%
	shadow.style.filter = '\
		progid:DXImageTransform.Microsoft.Alpha(Opacity=75)\
		progid:DXImageTransform.Microsoft.Blur(pixelRadius='+ shadow.userAttrs.radius +',makeShadow=false,shadowOpacity=100)\
	';

	var clone = element.cloneNode(true);
	clone.position_offset = {
		'top': (0 - vml_parent.pos_ieCSS3.top),
		'left': (0 - vml_parent.pos_ieCSS3.left)
	};
	clone.size_offset = {
		'width': 0,
		'height': 0
	};
	clone.style.behavior = null;
	clone.style.position = 'absolute';
	clone.style.top = (element.pos_ieCSS3.top + clone.position_offset.top) +'px';
	clone.style.left = (element.pos_ieCSS3.left + clone.position_offset.left) +'px';
	clone.className = 'ieCSS3_text_shadow';


	element.parentNode.appendChild(shadow);
	element.parentNode.appendChild(clone);

	element.style.visibility = 'hidden';

	// For window resizing
	element.vml.push(clone);
	element.vml.push(shadow);

	return(true);
}

// enable VML
// Add a namespace for VML (IE8 requires it)
function createVmlNameSpace() { 
	if (typeof document.namespaces == 'unknown'){
		// if this error occurs, means init was invoked in $(document).ready
		// this is bad in ie 6, in ie 6 should be invoked in window.onload
		throw new Error("iecss3 was initialized before window onload!");
		
	}
	if (document.namespaces != null && !document.namespaces[namespace]) {
		document.namespaces.add('v', 'urn:schemas-microsoft-com:vml');
		document.namespaces.add(namespace, 'urn:schemas-microsoft-com:vml');
	}
}

function init(dom) {
	
	var classID = 'v08vnSVo78t4JfjH', jel = $(dom);
	this.element = dom;
	if (!et.dom.hasVML()) { return(false); }

	if (this.element.className.match(classID)) { return(false); }
	this.element.className = this.element.className.concat(' ', classID);

	
	createVmlNameSpace();

	// Check to see if we've run once before on this page
	if (typeof(window.ieCSS3) == 'undefined') {
		// Create global ieCSS3 object
		window.ieCSS3 = {
			'vmlified_elements': new Array(),
			'update_timer': setInterval(updatePositionAndSize, timer_length)
		};

		if (typeof(window.onresize) == 'function') { window.ieCSS3.previous_onresize = window.onresize; }

		// Attach window resize event
		window.onresize = updatePositionAndSize;
	}


	// These attrs are for the script and have no meaning to the browser:
	this.borderRadius = parseInt(this.element.currentStyle['iecss3-border-radius'] ||
	                             this.element.currentStyle['-moz-border-radius'] ||
	                             this.element.currentStyle['-webkit-border-radius'] ||
	                             this.element.currentStyle['border-radius'] ||
	                             this.element.currentStyle['-khtml-border-radius']);
	this.arcSize = Math.min(this.borderRadius / Math.min(this.offsetWidth, this.offsetHeight), 1);
	this.fillColor = this.element.currentStyle.backgroundColor;
	this.fillSrc = this.element.currentStyle.backgroundImage.replace(/^url\("(.+)"\)$/, '$1');
	this.strokeColor = this.element.currentStyle.borderColor;
	this.strokeWeight = parseInt(this.element.currentStyle.borderWidth);
	this.stroked = 'true';
	if (isNaN(this.strokeWeight) || (this.strokeWeight == 0)) {
		this.strokeWeight = 0;
		this.strokeColor = this.fillColor;
		this.stroked = 'false';
	}
	this.opacity = parseFloat(this.element.currentStyle.opacity || 1);
	this.textShadow = this.element.currentStyle['text-shadow'];

	this.element.vml = new Array();
	var zIndex = parseInt(jel.css('zIndex'));
	if (isNaN(zIndex)) { this.zIndex = 1; } else { this.zIndex = zIndex;}

	// Find which element provides position:relative for the target element (default to BODY)
	vml_parent = jel.offsetParent();

	vml_parent.pos_ieCSS3 = $(vml_parent).offset();
	this.element.pos_ieCSS3 = jel.offset();

	var rv1 = createBoxShadow(this.element, vml_parent);
	var rv2 = createBorderRect(this.element, vml_parent);
	var rv3 = createTextShadow(this.element, vml_parent);
	if (rv1 || rv2 || rv3) { window.ieCSS3.vmlified_elements.push(this.element); }

	if (typeof(document.ieCSS3_stylesheet) == 'undefined') {
		document.ieCSS3_stylesheet = document.createStyleSheet();
		document.ieCSS3_stylesheet.addRule("v\\:roundrect", "behavior: url(#default#VML)");
		document.ieCSS3_stylesheet.addRule("v\\:fill", "behavior: url(#default#VML)");
		// Compatibility with IE7.js
		document.ieCSS3_stylesheet.ie7 = true;
	}
}

function updatePositionAndSize() {
	if (typeof(window.ieCSS3.vmlified_elements) != 'object') { return(false); }

	for (var i in window.ieCSS3.vmlified_elements) {
		var el = window.ieCSS3.vmlified_elements[i];

		if (typeof(el.vml) != 'object') { continue; }

		for (var z in el.vml) {
			//var parent_pos = findPos(el.vml[z].parentNode);
			var new_pos = $(el).offset();
			new_pos.left = (new_pos.left + el.vml[z].position_offset.left) + 'px';
			new_pos.top = (new_pos.top + el.vml[z].position_offset.top) + 'px';
			if (el.vml[z].style.left != new_pos.left) { el.vml[z].style.left = new_pos.left; }
			if (el.vml[z].style.top != new_pos.top) { el.vml[z].style.top = new_pos.top; }

			var new_size = {
				'width': parseInt(el.offsetWidth + el.vml[z].size_offset.width),
				'height': parseInt(el.offsetHeight + el.vml[z].size_offset.height)
			}
			if (el.vml[z].offsetWidth != new_size.width) { el.vml[z].style.width = new_size.width +'px'; }
			if (el.vml[z].offsetHeight != new_size.height) { el.vml[z].style.height = new_size.height +'px'; }
		}
	}

	if (event && (event.type == 'resize') && typeof(window.ieCSS3.previous_onresize) == 'function') { window.ieCSS3.previous_onresize(); }
}

$.fn.extend({
	iecss3 : function(){
		this.each(function(i, el){
			init.call(el.style, el);
		});
	}
});
})(et, jQuery);