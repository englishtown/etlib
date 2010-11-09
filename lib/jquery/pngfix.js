/*!require: */
/**
 * --------------------------------------------------------------------
 * jQuery-Plugin "pngFix"
 * Version: 1.2, 09.03.2009
 * by Andreas Eberhard, andreas.eberhard@gmail.com
 *                      http://jquery.andreaseberhard.de/
 *
 * Copyright (c) 2007 Andreas Eberhard
 * Licensed under GPL (http://www.opensource.org/licenses/gpl-license.php)
 *
 * Changelog:
 *    09.03.2009 Version 1.2
 *    - Update for jQuery 1.3.x, removed @ from selectors
 *    11.09.2007 Version 1.1
 *    - removed noConflict
 *    - added png-support for input type=image
 *    - 01.08.2007 CSS background-image support extension added by Scott Jehl, scott@filamentgroup.com, http://www.filamentgroup.com
 *    31.05.2007 initial Version 1.0
 * --------------------------------------------------------------------
 * @example $(function(){$(document).pngFix();});
 * @desc Fixes all PNG's in the document on document.ready
 *
 * jQuery(function(){jQuery(document).pngFix();});
 * @desc Fixes all PNG's in the document on document.ready when using noConflict
 *
 * @example $(function(){$('div.examples').pngFix();});
 * @desc Fixes all PNG's within div with class examples
 *
 * @example $(function(){$('div.examples').pngFix( { blankgif:'ext.gif' } );});
 * @desc Fixes all PNG's within div with class examples, provides blank gif for input with png
 * --------------------------------------------------------------------
 */

(function($) {

	var ie55 = $.browser.msie && $.browser.version == 5.5;
	var ie6 = $.browser.msie && $.browser.version == 6;
	
	$.fn.pngfix = function(settings) {

		// Settings
		settings = $.extend({
			blankgif: 'blank.gif',
			fixBg: false,
			checkExt: true
		}, settings);

		function fixPng(dom, w, h){
			var el = $(dom);
			if (el.data('jQuery.fn.pngfix.done') === true){
				return;
			}
			
			dom.runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader' + '(src=\'' + el.attr('src') + '\', sizingMethod=\'scale\');';
			dom.src = settings.blankgif;
			el.width(w).height(h).css('zoom', 1)
				.data('jQuery.fn.pngfix.done', true);
		}
		
		function handleImgTag() {
			var w = 0, h = 0;
			var el = $(this);
			
			if (el.data('jQuery.fn.pngfix.done') === true) return;
			
			function imgLoad(){
				if (el.attr('src') == settings.blankgif || el.data('jQuery.fn.pngfix.tried') === true) return;
				
				w = el.width();
				h = el.height();
				
				// this could be caused by hidden image
				if (w == 0 && h == 0){
					// so lets get real size
					var img = new Image();
					img.onload = function(){
						if (img.width == 0 || img.height == 0 || el.data('jQuery.fn.pngfix.tried') === true || el.data('jQuery.fn.pngfix.done') === true) return;
						el.data('jQuery.fn.pngfix.tried', true);
						
						el.unbind('load', imgLoad);
						fixPng(el.get(0), img.width, img.height);
						img = null;
					};
					img.src = el.attr('src');
					return;
				}
				
				el.unbind('load', imgLoad);
				fixPng(el.get(0), w, h);
			}
			if (this.complete){
				imgLoad();
			}
			else{
				el.load(imgLoad);
			}
			
		}

		if ($.browser.msie && (ie55 || ie6)) {

			var extSelector = '';
			
			if (settings.checkExt){
				extSelector = "[src$=.png]";
			}
		
			//fix images with png-source, also check if *this* is a png img.
			$(this)
				.find('img' + extSelector).each(handleImgTag).end()
				.filter('img' + extSelector).each(handleImgTag);
			
			//fix input with png-source
			$(this).find('input' + extSelector).each(function() {
				var bgIMG = $(this).attr('src');
				$(this).get(0).runtimeStyle.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader' + '(src=\'' + bgIMG + '\', sizingMethod=\'scale\');';
				$(this).attr('src', settings.blankgif);
			});
			
			// fix css background pngs
			if (settings.fixBg){
				$(this).find("*").each(function(){
					var bgIMG = $(this).css('background-image');
					if(bgIMG.indexOf(".png")!=-1){
						var iebg = bgIMG.split('url("')[1].split('")')[0];
						$(this).css('background-image', 'none');
						$(this).get(0).runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + iebg + "',sizingMethod='scale')";
					}
				});
			}
		
		}
		
		return this;

	};

})(jQuery);
