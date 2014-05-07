'use strict';
var Promise = require('./promise');
var reject = require('./reject');
var resolve = require('./resolve');
var INTERNAL = require('./INTERNAL');
var handlers = require('./handlers');
var noArray = reject(new TypeError('must be an array'));
module.exports = function all(iterable) {
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return noArray;
  }
  var len = iterable.length;
  if (!len) {
    return resolve([]);
  }
  var values = [];
  var resolved = 0;
  var i = -1;
  var promise = new Promise(INTERNAL);
  function allResolver(value, i) {
    resolve(value).then(function resolveIt(outValue) {
      values[i] = outValue;
      if (++resolved === len) {
        handlers.resolve(promise, values);
      }
    }, function (error) {
      handlers.reject(promise, error);
    });
  }
  
  while (++i < len) {
    allResolver(iterable[i], i);
  }
  return promise;
};