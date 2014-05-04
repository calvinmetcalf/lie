'use strict';
var Promise = require('./promise');
var reject = require('./reject');
var resolve = require('./resolve');
var noArray = reject(new TypeError('must be an array'));
var emptyArray = resolve([]);
module.exports = function all(iterable) {
  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
    return noArray;
  }
  var len = iterable.length;
  if (!len) {
    return emptyArray;
  }
  var values = [];
  var resolved = 0;
  var i = -1;
  return new Promise(function (resolver, reject) {
    function allResolver(value, i) {
      resolve(value).then(function (outValue) {
        values[i] = outValue;
        if (++resolved === len) {
          resolver(values);
        }
      }, function (error) {
        reject(error);
      });
    }
    
    while (++i < len) {
      allResolver(iterable[i], i);
    }
  });
};