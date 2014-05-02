'use strict';
var INTERNAL = require('./INTERNAL');
var Promise = require('./promise');
var reject = require('./reject');
var resolve = require('./resolve');
var handlers = require('./handlers');
module.exports = function all(iterable) {
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return reject(new TypeError('must be an array'));
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
    resolve(value).then(function (outValue) {
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