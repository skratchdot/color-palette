'use strict';

var util = require('util');
var exec = require('child_process').exec;
var execPrefix = 'node ' + __dirname + '/../lib/cli.js ';
var packageJson = require('../package.json');
var regexHeaderFound = new RegExp('Module Name', 'g');
var regexHeaderNotFound = new RegExp('Warning', 'g');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var testHelp = function (test, arg) {
	test.expect(3);
	exec(execPrefix + ' ' + arg, function (error, stdout, stderr) {
		test.equal(error, null, 'should be null');
		test.ok(/Options\:/.test(stdout), 'help text should have displayed "Options:"');
		test.equal(stderr, '', 'should be an empty string');
		test.done();
	});
};

exports['color-palette tests'] = {
	setUp: function(done) {
		// setup here
		done();
	},
	'color-palette --version': function (test) {
		test.expect(3);
		exec(execPrefix + '--version', function (error, stdout, stderr) {
			test.equal(error, null, 'should be null');
			test.equal(stdout, packageJson.version + '\n', 'should be: ' + packageJson.version);
			test.equal(stderr, '', 'should be an empty string');
			test.done();
		});
	},
	'color-palette -h': function (test) {
		testHelp(test, '-h');
	},
	'color-palette --help': function (test) {
		testHelp(test, '--help');
	},
	'color-palette (with no args)': function (test) {
		test.expect(3);
		exec(execPrefix, function (error, stdout, stderr) {
			test.equal(error, null, 'should not have thrown a hard error');
			test.equal(stdout, '', 'stdout should be an empty string');
			test.ok(stderr.length > 0 && typeof stderr === 'string', 'should have written to stderr');
			test.done();
		});
	},
	'color-palette ./files/lenna.png': function (test) {
		test.expect(6);
		exec(execPrefix + __dirname + '/files/lenna.png', function (error, stdout, stderr) {
			test.equal(error, null, 'should not have thrown a hard error');
			test.ok(/Resource\: [^\n]*lenna\.png/.test(stdout), 'should have printed the resource name');
			test.ok(/Success\: true/.test(stdout), 'should have been successful');
			test.ok(/Dominant Color\: \#c4696a/.test(stdout), 'Dominant Color should have been #c4696a');
			test.ok(/Palette\: \#d27770,\#e7c0a7,\#601c46,\#8e4361,\#b04450,\#892844,\#b591a7,\#c9554c,\#744984/.test(stdout), 'Palette was not correct');
			test.equal(stderr, '', 'stdout should be an empty string');
			test.done();
		});
	},
	'color-palette ./files/invalid_filename.png': function (test) {
		test.expect(7);
		exec(execPrefix + __dirname + '/files/invalid_filename.png', function (error, stdout, stderr) {
			test.equal(error, null, 'should not have thrown a hard error');
			test.ok(/Resource\: [^\n]*invalid_filename\.png/.test(stdout), 'should have printed the resource name');
			test.ok(/URI\: about\:blank/.test(stdout), 'URI should have been about:blank');
			test.ok(/Success\: false/.test(stdout), 'should not have been successful');
			test.ok(/Dominant Color\: /.test(stdout), 'Dominant Color should have been an empty string');
			test.ok(/Palette\: /.test(stdout), 'Palette should have been an empty string');
			test.equal(stderr, '', 'stdout should be an empty string');
			test.done();
		});
	},
	'color-palette -i ./files/lenna.png': function (test) {
		test.expect(1);
		exec(execPrefix + '-i ' + __dirname + '/files/lenna.png', function (error, stdout, stderr) {
			test.ok(/Image\: data\:image\/png\;base64\,/.test(stdout), 'Should display base64 image');
			test.done();
		});
	},
	'color-palette -o json ./files/lenna.png': function (test) {
		test.expect(6);
		exec(execPrefix + '-o json ' + __dirname + '/files/lenna.png', function (error, stdout, stderr) {
			var result = JSON.parse(stdout.toString('utf-8'));
			test.ok(typeof result === 'object', 'result should be json');
			test.ok(/\/test\/files\/lenna\.png$/.test(result.resource), 'result.resource should end with ./test/files/lenna.png');
			test.equal(result.success, true, 'result.success should be true');
			test.equal(result.dominantColor, '#c4696a', 'result.dominantColor should be #c4696a');
			test.ok(util.isArray(result.palette), 'result.palette should be an array');
			test.ok(result.palette.length, 'result.palette should have a positive length');
			test.done();
		});
	},
	'color-palette -o html ./files/lenna.png': function (test) {
		test.expect(2);
		exec(execPrefix + '-o html ' + __dirname + '/files/lenna.png', function (error, stdout, stderr) {
			test.ok(/^\<html\>/.test(stdout.trim()), 'should start with an <html /> tag');
			test.ok(/\&\#x2F\;test\&\#x2F;files\&\#x2F\;lenna\.png/.test(stdout), 'should contain the escaped resource name: ./test/files/lenna.png');
			test.done();
		});
	},
	'color-palette -o json http://www.google.com/': function (test) {
		test.expect(2);
		exec(execPrefix + '-o json http://www.google.com/', function (error, stdout, stderr) {
			var result = JSON.parse(stdout.toString('utf-8'));
			test.equal(result.success, true, 'result.success should be true');
			test.equal(result.uri, 'http://www.google.com/', 'result.uri should be http://www.google.com/');
			test.done();
		});
	},
};
