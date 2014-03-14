'use strict';
var Promise = require('./promise');
var INTERNAL = require('./INTERNAL');

module.exports = reject;

function reject(reason) {
	var promise = new Promise(INTERNAL);
	promise.reject(reason);
	return promise;
}