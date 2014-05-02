'use strict';
var once = require('./once');
var handlers = require('./handlers');
var tryCatch = require('./tryCatch');
function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var onceWrapper = once();
  var onError = onceWrapper(function (value) {
    return handlers.reject(self, value);
  });
  var result = tryCatch(function () {
    thenable(
      onceWrapper(function (value) {
        return handlers.resolve(self, value);
      }),
      onError
    );
  });
  if (result.status === 'error') {
    onError(result.value);
  }
}
exports.safely = safelyResolveThenable;