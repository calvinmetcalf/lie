'use strict';
var INTERNAL = require('INTERNAL');
var Promise = require('./promise');
var reject = require('./reject');
var resolve = require('./resolve');
module.exports = function all(iterable) {
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return reject(new TypeError('must be an array'));
  } else if (!iterable.length) {
    return resolve([]);
  }
  var values = [];
  var i = 0;

};