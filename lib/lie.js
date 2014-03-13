'use strict';
var immediate = require('immediate');

/* Wrap an arbitrary number of functions and allow only one of them to be
   executed and only once */
function once() {
  var called = 0;

  return function wrapper(wrappedFunction) {
    return function () {
      if (called++) {
        return;
      }
      wrappedFunction.apply(this, arguments);
    };
  };
}
function tryCatch(func, value) {
  var out = {};
  try {
    out.value = func(value);
    out.status = 'success';
  } catch (e) {
    out.status = 'error';
    out.value = e;
  }
  return out;
}
function getThenableIfExists(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;

  if (obj && typeof obj === 'object' && typeof then === 'function') {

    return then.bind(obj);
  }
}
function unwrap(promise, func, value) {
    immediate(function () {
      var returnValue;
      try {
        returnValue = func(value);
      } catch (e) {
        promise.reject(e);
        return;
      }

      if (returnValue === promise) {
        promise.reject(new TypeError('Cannot resolve promise with itself'));
      } else {
        promise.resolve(returnValue);
      }
    });
  }
function aThenHandler(onFulfilled, onRejected) {
  var promise = new Promise();

  return {
    promise: promise,
    callFulfilled: function (value) {
      if (onFulfilled && onFulfilled.call) {
        unwrap(promise, onFulfilled, value);
      } else {
        promise.resolve(value);
      }
    },
    callRejected: function (value) {
      if (onRejected && onRejected.call) {
        unwrap(promise, onRejected, value);
      } else {
        promise.reject(value);
      }
    }
  };
}

// States
var PENDING = 0,
  FULFILLED = 1,
  REJECTED = 2;
module.exports = Promise;
function Promise() {

  this.state = PENDING;
  this.thenHandlers = [];
  this.called = 0;

}
Promise.prototype.resolve = function (value) {
  if (this.called++) {
    return;
  }
  return this.transparentlyResolveThenablesAndFulfill(value);
};
Promise.prototype.reject = function (value) {
  if (this.called++) {
    return;
  }
  return this.doReject(value);
};
Promise.prototype.doFulfill = function (value) {
  this.state = FULFILLED;
  this.outcome = value;

  this.thenHandlers.forEach(function (then) {
    then.callFulfilled(value);
  });
};

Promise.prototype.doReject = function (error) {
  this.state = REJECTED;
  this.outcome = error;

  this.thenHandlers.forEach(function (then) {
    then.callRejected(error);
  });
};

Promise.prototype.executeThenHandlerDirectlyIfStateNotPendingAnymore = function (then) {
  if (this.state === FULFILLED) {
    then.callFulfilled(this.outcome);
  } else if (this.state === REJECTED) {
    then.callRejected(this.outcome);
  }
};

Promise.prototype.then = function (onFulfilled, onRejected) {
  var thenHandler = aThenHandler(onFulfilled, onRejected);

  this.thenHandlers.push(thenHandler);

  this.executeThenHandlerDirectlyIfStateNotPendingAnymore(thenHandler);

  return thenHandler.promise;
};

Promise.prototype.safelyResolveThenable = function (thenable) {
  // Either fulfill, reject or reject with error
  var onceWrapper = once();
  var self = this;
  var result = tryCatch(function () {
    thenable(
      onceWrapper(function (value) {
        return self.transparentlyResolveThenablesAndFulfill(value);
      }),
      onceWrapper(function (value) {
        return self.doReject(value);
      })
    );
  });
  if (result.status === 'error') {
    onceWrapper(function (value) {
      return self.doReject(value);
    })(result.value);
  }
};

Promise.prototype.transparentlyResolveThenablesAndFulfill = function (value) {
  var result = tryCatch(getThenableIfExists, value);
  if (result.status === 'error') {
    return this.doReject(result.value);
  }
  var thenable = result.value;

  if (thenable) {
    this.safelyResolveThenable(thenable);
  } else {
    this.doFulfill(value);
  }
};