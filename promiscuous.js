/** @license MIT - ©2013 Ruben Verborgh */
(function () {
  var func = "function",
      noop = function () {};

  function deferred() {
    var handler,
        changeState,
        promise = {
          then: function (onFulfilled, onRejected) {
            return handler(onFulfilled, onRejected);
          }
        };

    (function () {
      var pending = [];
      handler = function (onFulfilled, onRejected) {
        var d = deferred();
        pending.push({ d: d, f: onFulfilled, r: onRejected });
        return d.promise();
      };
      changeState = function (property, action, newHandler, value) {
        for (var i = 0, l = pending.length; i < l; i++) {
          var p = pending[i], deferred = p.d, callback = p[property];
          if (typeof callback !== func)
            deferred[action](value);
          else
            execute(callback, value, deferred);
        }
        handler = newHandler(promise, value);
        changeState = noop;
      };
    })();

    return {
      resolve: function (value)  { changeState('f', 'resolve', fulfilledHandler, value); },
      reject : function (reason) { changeState('r', 'reject',  rejectedHandler, reason); },
      promise: function () { return promise; }
    };
  }

  function fulfilledHandler(promise, value) {
    return function (onFulfilled) {
      if (typeof onFulfilled !== func)
        return promise;
      var result = deferred();
      process.nextTick(execute.bind(promise, onFulfilled, value, result));
      return result.promise();
    };
  }

  function rejectedHandler(promise, value) {
    return function (onFulfilled, onRejected) {
      if (typeof onRejected !== func)
        return promise;
      var result = deferred();
      process.nextTick(execute.bind(promise, onRejected, value, result));
      return result.promise();
    };
  }

  function execute(callback, value, deferred) {
    try {
      var result = callback(value);
      if (result && typeof result.then === func)
        result.then(deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    }
    catch (error) {
      deferred.reject(error);
    }
  }

  module.exports = {
    resolve: function (value) {
      var promise = {};
      promise.then = fulfilledHandler(promise, value);
      return promise;
    },
    reject: function (reason) {
      var promise = {};
      promise.then = rejectedHandler(promise, reason);
      return promise;
    },
    deferred: deferred
  };
})();
