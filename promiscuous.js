/*! Promiscuous ©2013 Ruben Verborgh @license MIT https://github.com/RubenVerborgh/promiscuous*/
(function(exports, tick) {
  var func = "function";
  // Creates a deferred: an object with a promise and corresponding resolve/reject methods
  function Deferred() {
    // The `handler` variable points to the function that will
    // 1) handle a .then(onFulfilled, onRejected) call
    // 2) handle a .resolve or .reject call (if not fulfilled)
    // Before 2), `handler` holds a queue of callbacks.
    // After 2), `handler` is a simple .then handler.
    // We use only one function to save memory and complexity.
    var handler = function(onFulfilled, onRejected, value) {
      // Case 1) handle a .then(onFulfilled, onRejected) call
      var createdDeffered;
      if (onFulfilled !== handler) {
        createdDeffered = createDeferred();
        handler.queue.push({
          deferred: createdDeffered,
          resolve: onFulfilled,
          reject: onRejected
        });
        return createdDeffered.promise;
      }

      // Case 2) handle a .resolve or .reject call
      // (`onFulfilled` acts as a sentinel)
      // The actual function signature is
      // .re[ject|solve](sentinel, success, value)
      var action = onRejected ? 'resolve' : 'reject',
        queue, deferred, callback;
      for (var i = 0, l = handler.queue.length; i < l; i++) {
        queue = handler.queue[i];
        deferred = queue.deferred;
        callback = queue[action];
        if (typeof callback !== func) {
          deferred[action](value);
        }
        else {
          execute(callback, value, deferred);
        }
      }
      // Replace this handler with a simple resolved or rejected handler
      handler = createHandler(promise, value, onRejected);
    };

    function Promise() {
      this.then = function(onFulfilled, onRejected) {
        return handler(onFulfilled, onRejected);
      };
    }
    var promise = new Promise();
    this.promise = promise;
    // The queue of deferreds
    handler.queue = [];

    this.resolve = function(value) {
      handler.queue && handler(handler, true, value);
    };

    this.reject = function(reason) {
      handler.queue && handler(handler, false, reason);
    };
  }

  function createDeferred() {
    return new Deferred();
  }

  // Creates a fulfilled or rejected .then function
  function createHandler(promise, value, success) {
    return function(onFulfilled, onRejected) {
      var callback = success ? onFulfilled : onRejected,
        result;
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
    tick(function() {
      var result;
      try {
        result = callback(value);
        if (result && typeof result.then === func) {
          result.then(deferred.resolve, deferred.reject);
        }
        else {
          deferred.resolve(result);
        }
      }
      catch (error) {
        deferred.reject(error);
      }
    });
  }

  // Returns a resolved promise
  exports.resolve = function(value) {
    var promise = {};
    promise.then = createHandler(promise, value, true);
    return promise;
  };
  // Returns a rejected promise
  exports.reject = function(reason) {
    var promise = {};
    promise.then = createHandler(promise, reason, false);
    return promise;
  };
  // Returns a deferred
  exports.deferred = createDeferred;
  exports.all = function(array) {
    var promise = exports.deferred();
    var len = array.length;
    var resolved = 0;
    var out = [];
    var onSuccess = function(n) {
      return function(v) {
        out[n] = v;
        resolved++;
        if (resolved === len) {
          promise.resolve(out);
        }
      };
    };
    array.forEach(function(v, i) {
      v.then(onSuccess(i), function(a) {
        promise.reject(a);
      });
    });
    return promise.promise;
  };
})((typeof module === "undefined" || !('exports' in module)) ? window.promiscuous : exports,
/*from github.com/JeanHuguesRobert/l8*/
typeof setImmediate !== "undefined" && setImmediate || typeof process !== "undefined" && process.nextTick || setTimeout);
