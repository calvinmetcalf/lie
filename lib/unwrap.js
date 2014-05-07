'use strict';

var immediate = require('immediate');
var handlers = require('./handlers');
var tryCatch = require('./tryCatch');
module.exports = unwrap;

function unwrap(promise, func, value) {
  immediate(function soon() {
    var result = tryCatch(func, value);
    if (result.status === 'error') {
      return handlers.reject(promise, result.value);
    }
    if (result.value === promise) {
      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
    } else {
      handlers.resolve(promise, result.value);
    }
  });
}