﻿"use strict";

// Polyfill (particularly for PhantomJS) ///////////////////////////////////////////////////////////

// See <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind>
if (!Function.prototype.bind) {
	Function.prototype.bind = function bind(oThis) {
		if (typeof this !== 'function') {
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}
		var aArgs   = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP    = function() {},
			fBound  = function() {
				return fToBind.apply(this instanceof fNOP ? this
					: oThis, aArgs.concat(Array.prototype.slice.call(arguments))
				);
			};
		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
}

//// Testing environment extensions and custom definitions. ////////////////////

beforeEach(function() { // Add custom matchers.
	jasmine.addMatchers({
		toBeOfType: function () {
			return {
				compare: function(actual, type) {
					switch (typeof type) {
						case 'function': return { pass: actual instanceof type };
						case 'string': return { pass: (typeof actual) === type };
					}
					throw new Error('Cannot compare with type '+ type +'!');
				}
			};
		}
	});
});

//// Actual testing brought to you by RequireJS. ///////////////////////////////

require.config({ // Configure RequireJS.
	baseUrl: '/base', // Karma serves files under /base, which is the basePath from your config file
	paths: {
		'creatartis-base': '/base/tests/lib/creatartis-base.min',
		'sermat': '/base/tests/lib/sermat-umd',
		'ludorum': '/base/tests/lib/ludorum.min',
		'ludorum-game-mancala': '/base/tests/lib/ludorum-game-mancala'
	}
});
require(Object.keys(window.__karma__.files) // Dynamically load all test files
		.filter(function (file) { // Filter test modules.
			return /\.test\.js$/.test(file);
		}).map(function (file) { // Normalize paths to RequireJS module names.
			return file.replace(/^\/base\//, '').replace(/\.js$/, '');
		}),
	function () {
		window.__karma__.start(); // we have to kickoff jasmine, as it is asynchronous
	}
);