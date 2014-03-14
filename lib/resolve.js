'use strict';
var Promise = require('./promise');
var INTERNAL = require('./INTERNAL');

module.exports = resolve;

function resolve(value) {
	var promise = new Promise(INTERNAL);
	promise.resolve(value);
	return promise;
}