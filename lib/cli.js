#!/usr/bin/env node
'use strict';

// libs
var fs = require('fs');
var mustache = require('mustache');
var onecolor = require('onecolor');
var path = require('path');
var phantomjs = require('phantomjs');
var phantom = require('phantom');
var program = require('commander');
var appInfo = require('../package.json');
// instance variables
var output = {};
var outputNames = {
	resource:      '      Resource',
	uri:           '           URI',
	success:       '       Success',
	dominantColor: 'Dominant Color',
	palette:       '       Palette',
	image:         '         Image'
};
var outputTypes = ['text', 'json', 'html'];

// setup command line options
program
	.version(appInfo.version, '-v, --version')
	.usage('[options] <resource>')
	.option('-s, --size <size>', 'the target size of the color palette (might return +/- 2)', 10)
	.option('-q, --quality <quality>', 'the quality of the colors (0 is highest, 10 is default)', 10)
	.option('-i, --image', 'add image to output')
	.option('-o, --output [type]', 'specify the output type: text, json, or html', 'text')
	.parse(process.argv);

// get resource
if (program.args.length) {
	output.resource = program.args[0];
	output.uri = fs.existsSync(output.resource) ?
		'file://' + path.resolve(output.resource) : output.resource;
} else {
	console.error('  error: First argument should be a valid resource (a file or a URI)');
	process.exit();
}

// make sure output type is valid
if (outputTypes.indexOf(program.output) === -1) {
	console.error('  error: Output type "' + program.output + '" is not valid.' +
			'\n         Must be one of: ' + outputTypes.join(', '));
	process.exit();
}

// get size and quality
['size', 'quality'].forEach(function (key) {
	program[key] = parseInt(program[key], 10);
	if (!program[key]) {
		console.error('The palette ' + key + ' must be a positive integer.');
		process.exit();
	}
});

var toHexColor = function (rgbArray) {
	var parsedColor = onecolor('rgb(' + (rgbArray || []).join(',') + ')');
	return parsedColor && parsedColor.isColor ? parsedColor.hex() : '';
};

phantom.create('--web-security=false', '--ignore-ssl-errors=true', '--ssl-protocol=TLSv1', {
	path: path.dirname(phantomjs.path) + path.sep,
	onStdout: function () {},
	onStderr: function () {},
	onExit: function () {}
}, function (ph) {
	ph.createPage(function (page) {
		page.set('viewportSize', {width: 1024, height: 1024}, function () {
			page.open(output.uri, function (success) {
				output.success = success === 'success';
				page.renderBase64('png', function (imageBase64) {
					var html;
					// setup image data uri
					imageBase64 = 'data:image/png;base64,' + imageBase64;
					// cheap hack
					html = [
						'<meta charset="utf-8" />',
						'<img id="img" src="' + imageBase64 + '" />',
						'<div id="size">' + program.size + '</div>',
						'<div id="quality">' + program.quality + '</div>',
					].join('');
					page.setContent(html, output.uri, function () {
						page.injectJs(__dirname + path.sep + 'color-thief.js', function () {
							page.injectJs(__dirname + path.sep + 'inject-script.js', function () {
								page.evaluate(function (h) {
									return {
										dominantColor: window.dominantColor,
										palette: window.palette,
										croppedImage: window.croppedImage,
										uri: document.location.href
									};
								}, function (result) {
									ph.exit();
									output.dominantColor = toHexColor(result.dominantColor);
									output.palette = (result.palette || []).map(function (rgbArray) {
										return toHexColor(rgbArray);
									});
									output.uri = result.uri;
									if (program.image || program.output === 'html') {
										output.image = result.croppedImage;
									}
									if (program.output === 'json') {
										console.log(JSON.stringify(output, null, '  '));
									} else if (program.output === 'html') {
										output.json = JSON.stringify(output, null, '  ');
										output.paletteLength = output.palette.length || 0;
										output.palettePercentage =  100 / (output.palette.length || 1) + '%';
										console.log(mustache.render(fs.readFileSync(__dirname + '/../views/index.html', 'utf-8'), output));
									} else {
										Object.keys(outputNames).forEach(function (key) {
											if (output.hasOwnProperty(key)) {
												console.log(outputNames[key] + ': ' + output[key]);
											}
										});
									}
									process.exit();
								});
							});
						});
					});
				});
			});
		});
	});
});
