'use strict';
var unwrap = require('./unwrap');
var INTERNAL = require('./INTERNAL');
var once = require('./once');
var tryCatch = require('./tryCatch');
var getThen = require('./getThen');

// States
var PENDING = 0,
  FULFILLED = 1,
  REJECTED = 2;
module.exports = Promise;
function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('reslover must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}
Promise.prototype.resolve = function (value) {
  if (this.state !== PENDING) {
    return;
  }
  return resolveFulfill(this, value);
};
Promise.prototype.reject = function (value) {
  if (this.state !== PENDING) {
    return;
  }
  return rejectQueue(this, value);
};

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};
Promise.prototype.then = function (onFulfilled, onRejected) {
  var promise = new Promise(INTERNAL);

  var thenHandler =  {
    promise: promise,
  };
  if (typeof onFulfilled === 'function') {
    thenHandler.callFulfilled = function (value) {
      unwrap(promise, onFulfilled, value);
    };
  } else {
    thenHandler.callFulfilled = function (value) {
      promise.resolve(value);
    };
  }
  if (typeof onRejected === 'function') {
    thenHandler.callRejected = function (value) {
      unwrap(promise, onRejected, value);
    };
  } else {
    thenHandler.callRejected = function (value) {
      promise.reject(value);
    };
  }

  this.queue.push(thenHandler);

  if (this.state === FULFILLED) {
    thenHandler.callFulfilled(this.outcome);
  } else if (this.state === REJECTED) {
    thenHandler.callRejected(this.outcome);
  }

  return promise;
};

function fulfillQueue(self, value) {
  self.state = FULFILLED;
  self.outcome = value;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callFulfilled(value);
  }
}

function rejectQueue(self, error) {
  self.state = REJECTED;
  self.outcome = error;
  var i = -1;
  var len = self.queue.length;
  while (++i < len) {
    self.queue[i].callRejected(error);
  }
}
function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var onceWrapper = once();
  var onError = onceWrapper(function (value) {
    return rejectQueue(self, value);
  });
  var result = tryCatch(function () {
    thenable(
      onceWrapper(function (value) {
        return resolveFulfill(self, value);
      }),
      onError
    );
  });
  if (result.status === 'error') {
    onError(result.value);
  }
}

function resolveFulfill(self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return rejectQueue(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    fulfillQueue(self, value);
  }
}