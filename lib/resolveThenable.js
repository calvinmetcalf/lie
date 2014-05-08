'use strict';
var handlers = require('./handlers');
var tryCatch = require('./tryCatch');
function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var called = false;
  function onError(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.reject(self, value);
  }
  function onSuccess(value) {
    if (called) {
      return;
    }
    called = true;
    handlers.resolve(self, value);
  }
  var result = tryCatch(function () {
    thenable(onSuccess, onError);
  });
  if (result.status === 'error') {
    onError(result.value);
  }
}
exports.safely = safelyResolveThenable;