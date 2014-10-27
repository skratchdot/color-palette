/*globals ColorThief: true, window */
'use strict';

// store dominantColor and palette as globals
(function () {
	var colorThief = new ColorThief();
	var img = document.getElementById('img');
	var size = parseInt(document.getElementById('size').innerHTML, 10);
	var quality = parseInt(document.getElementById('quality').innerHTML, 10);

	window.dominantColor = colorThief.getColor(img, quality);
	window.palette = colorThief.getPalette(img, size, quality);
}());
