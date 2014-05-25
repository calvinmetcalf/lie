'use strict';
var tryCatch = require('./tryCatch');
var getThen = require('./getThen');
var resolveThenable = require('./resolveThenable');
var states = require('./states');

exports.resolve = function (self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return exports.reject(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    resolveThenable.safely(self, thenable);
  } else {
    self.state = states.FULFILLED;
    self.outcome = value;
    var item;
    while ((item = self.queue.shift())) {
      item.callFulfilled(value);
    }
  }
  return self;
};
exports.reject = function (self, error) {
  self.state = states.REJECTED;
  self.outcome = error;
  var item;
  while ((item = self.queue.shift())) {
    item.callRejected(error);
  }
  return self;
};
