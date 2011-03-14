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
    try{
	var style = $.css('iecss3-box-shadow') || 
        $.css('-moz-box-shadow') || 
        $.css('-webkit-box-shadow') || 
        $.css('box-shadow') || '';
    }catch(ex){
        window.console && (window.console.log(ex.message));
    }
	
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
	
	if (element.style.zIndex - 1 < 0){
		element.style.zIndex+=1;
	}
	
	shadow.arcsize = element.arcSize +'px';
	$(shadow)
		.css({
			display: 'block',
			position: 'absolute',
			top: (element.pos_ieCSS3.top + shadow.position_offset.top) +'px',
			left: (element.pos_ieCSS3.left + shadow.position_offset.left) +'px',
			width: element.offsetWidth +'px',
			height: element.offsetHeight +'px',
			antialias: true,
			zIndex: element.style.zIndex - 1<0?0:element.style.zIndex - 1
		})
		.addClass('vml_box_shadow');
		
	
	// TODO: opacity should be caculated by using eleemnt.opacity & background color grey scale
	// for now lets hard coded it
	shadow.style.filter = 'progid:DXImageTransform.Microsoft.Blur(pixelRadius='+ shadow.userAttrs.radius +',makeShadow=true,shadowOpacity='+ 0.2 +')';
	
	//element.parentNode.appendChild(shadow);
	element.parentNode.insertBefore(shadow, element);

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

// Enable VML, Add a namespace for VML (IE8 requires it)
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
	
	var classID = 'v08vnSVo78t4JfjH', jel = $(dom), style = dom.style;
	
	// if not support fail silently
	if (!et.dom.hasVML()) { return(false); }

	// check if already inited on current element;
	if (jel.hasClass(classID)) { return(false); }
	jel.addClass(classID);

	createVmlNameSpace();

	// Check to see if we've run once before on this page
	if (typeof(window.ieCSS3) == 'undefined') {
		// Create global ieCSS3 object
		window.ieCSS3 = {
			'vmlified_elements': new Array()
			// commented out by norman, I don't want it waste cpu time as it doesn;t make sense, onresize is enough
			// 'update_timer': setInterval(updatePositionAndSize, timer_length)
		};

		// if (typeof(window.onresize) == 'function') { window.ieCSS3.previous_onresize = window.onresize; }

		// Attach window resize event
		$(window).resize(updatePositionAndSize);
	}


	// These attrs are for the script and have no meaning to the browser:
	style.borderRadius = parseInt(dom.currentStyle['iecss3-border-radius'] ||
	                             dom.currentStyle['-moz-border-radius'] ||
	                             dom.currentStyle['-webkit-border-radius'] ||
	                             dom.currentStyle['border-radius'] ||
	                             dom.currentStyle['-khtml-border-radius']);
	style.arcSize = Math.min(style.borderRadius / Math.min(style.offsetWidth, style.offsetHeight), 1);
	style.fillColor = dom.currentStyle.backgroundColor;
	style.fillSrc = dom.currentStyle.backgroundImage.replace(/^url\("(.+)"\)$/, '$1');
	style.strokeColor = dom.currentStyle.borderColor;
	style.strokeWeight = parseInt(dom.currentStyle.borderWidth);
	style.stroked = 'true';
	if (isNaN(style.strokeWeight) || (style.strokeWeight == 0)) {
		style.strokeWeight = 0;
		style.strokeColor = style.fillColor;
		style.stroked = 'false';
	}
	style.opacity = parseFloat(dom.currentStyle.opacity || 1);
	style.textShadow = dom.currentStyle['text-shadow'];

	dom.vml = new Array();
	var zIndex = parseInt(jel.css('zIndex'));
	if (isNaN(zIndex)) { style.zIndex = 1; } else { style.zIndex = zIndex;}

	// Find which element provides position:relative for the target element (default to BODY)
	vml_parent = jel.offsetParent();

	vml_parent.pos_ieCSS3 = $(vml_parent).offset();
	dom.pos_ieCSS3 = jel.offset();

	var rv1 = createBoxShadow(dom, vml_parent);
	var rv2 = createBorderRect(dom, vml_parent);
	var rv3 = createTextShadow(dom, vml_parent);
	if (rv1 || rv2 || rv3) { window.ieCSS3.vmlified_elements.push(dom); }

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

	//if (event && (event.type == 'resize') && typeof(window.ieCSS3.previous_onresize) == 'function') { window.ieCSS3.previous_onresize(); }
}

$.fn.extend({
	iecss3 : function(){
		if ($.browser.msie){
			return this.each(function(i, el){
				init(el);
			});
		}
		return this;
	}
});
})(et, jQuery);