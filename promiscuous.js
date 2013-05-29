/** @license MIT - ©2013 Ruben Verborgh */
(function (tick) {
  var func = "function";
  // Creates a deferred: an object with a promise and corresponding resolve/reject methods
  function createDeferred() {
    // The `handler` variable points to the function that will
    // 1) handle a .then(onFulfilled, onRejected) call
    // 2) handle a .resolve or .reject call (if not fulfilled)
    // Before 2), `handler` holds a queue of callbacks.
    // After 2), `handler` is a simple .then handler.
    // We use only one function to save memory and complexity.
    var handler = function (onFulfilled, onRejected, value) {
          // Case 1) handle a .then(onFulfilled, onRejected) call
          var d;
          if (onFulfilled !== handler) {
            d = createDeferred();
            handler.c.push({ d: d, resolve: onFulfilled, reject: onRejected });
            return d.promise;
          }

          // Case 2) handle a .resolve or .reject call
          // (`onFulfilled` acts as a sentinel)
          // The actual function signature is
          // .re[ject|solve](sentinel, success, value)
          var action = onRejected ? 'resolve' : 'reject',c,deferred,callback;
          for (var i = 0, l = handler.c.length; i < l; i++) {
            c = handler.c[i];
            deferred = c.d;
            callback = c[action];
            if (typeof callback !== func) {
              deferred[action](value);
            } else {
              execute(callback, value, deferred);
            }
          }
          // Replace this handler with a simple resolved or rejected handler
          handler = createHandler(promise, value, onRejected);
        },
        promise = {
          then: function (onFulfilled, onRejected) {
            return handler(onFulfilled, onRejected);
          }
        };
    // The queue of deferreds
    handler.c = [];

    return {
      promise: promise,
      // Only resolve / reject when there is a deferreds queue
      resolve: function (value)  { handler.c && handler(handler, true, value); },
      reject : function (reason) { handler.c && handler(handler, false, reason); },
    };
  }

  // Creates a fulfilled or rejected .then function
  function createHandler(promise, value, success) {
    return function (onFulfilled, onRejected) {
      var callback = success ? onFulfilled : onRejected, result;
      if (typeof callback !== func) {
        return promise;
      }
      execute(callback, value, result = createDeferred());
      return result.promise;
    };
  }

  // Executes the callback with the specified value,
  // resolving or rejecting the deferred
  function execute(callback, value, deferred) {
    tick(function () {
      var result;
      try {
        result = callback(value);
        if (result && typeof result.then === func) {
          result.then(deferred.resolve, deferred.reject);
        } else {
          deferred.resolve(result);
        }
      }
      catch (error) {
        deferred.reject(error);
      }
    });
  }
  var exports = {
    // Returns a resolved promise
    resolve: function (value) {
      var promise = {};
      promise.then = createHandler(promise, value, true);
      return promise;
    },
    // Returns a rejected promise
    reject: function (reason) {
      var promise = {};
      promise.then = createHandler(promise, reason, false);
      return promise;
    },
    // Returns a deferred
    deferred: createDeferred
  };
  if(typeof module === 'undefined'){
    window.promiscuous=exports;
  } else {
    module.exports=exports;
  }
})(/*from github.com/JeanHuguesRobert/l8*/
   typeof setImmediate !== "undefined" && setImmediate
    || typeof process  !== "undefined" && process.nextTick
    || setTimeout
  );
