/*globals ColorThief: true, window */
'use strict';

// store dominantColor and palette as globals
(function () {
	// slightly modified version of: http://stackoverflow.com/a/22267731
	var cropImageFromCanvas = function(image) {
		var result, canvas, ctx, w, h, pix, imageData, x, y, index, n, cut;
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');
		document.body.appendChild(canvas);
		w = canvas.width = image.width;
		h = canvas.height = image.height;
		ctx.drawImage(image, 0, 0, w, h);
		pix = {
			x: [],
			y: []
		};
		imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		for (y = 0; y < h; y++) {
			for (x = 0; x < w; x++) {
				index = (y * w + x) * 4;
				if (imageData.data[index + 3] > 0) {

					pix.x.push(x);
					pix.y.push(y);

				}
			}
		}
		pix.x.sort(function(a, b) {
			return a - b;
		});
		pix.y.sort(function(a, b) {
			return a - b;
		});
		n = pix.x.length - 1;

		w = pix.x[n] - pix.x[0];
		h = pix.y[n] - pix.y[0];
		cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

		canvas.width = w;
		canvas.height = h;
		ctx.putImageData(cut, 0, 0);
		result = canvas.toDataURL();
		document.body.removeChild(canvas);
		return result;
	};
	var colorThief = new ColorThief();
	var img = document.getElementById('img');
	var size = parseInt(document.getElementById('size').innerHTML, 10);
	var quality = parseInt(document.getElementById('quality').innerHTML, 10);

	window.dominantColor = colorThief.getColor(img, quality);
	window.palette = colorThief.getPalette(img, size, quality);
	window.croppedImage = cropImageFromCanvas(img);
}());
