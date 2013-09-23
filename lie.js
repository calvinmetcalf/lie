var immediate = require('immediate');
var func = 'function';
// Creates a deferred: an object with a promise and corresponding resolve/reject methods
function Promise(resolver) {
     if (!(this instanceof Promise)) {
        return new Promise(resolver);
    }
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
            createdDeffered = Promise();
            handler.queue.push({
                deferred: createdDeffered,
                resolve: onFulfilled,
                reject: onRejected
            });
            return createdDeffered;
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
        handler = createHandler({then:then}, value, onRejected);
    };
    function then(onFulfilled, onRejected) {
        return handler(onFulfilled, onRejected);
    }
    
    this.then = then;
    // The queue of deferreds
    handler.queue = [];
    if(resolver){
        resolver(function(value) {
            if (handler.queue) {
                handler(handler, true, value);
            }
        },function (reason) {
            if (handler.queue) {
                handler(handler, false, reason);
            }
        });
    }else{
        this.resolve = function(value) {
            if (handler.queue) {
                handler(handler, true, value);
            }
        };
        this.reject = function (reason) {
            if (handler.queue) {
                handler(handler, false, reason);
            }
        };
    }
}



// Creates a fulfilled or rejected .then function
function createHandler(promise, value, success) {
    return function(onFulfilled, onRejected) {
        var callback = success ? onFulfilled : onRejected,
            result;
        if (typeof callback !== func) {
            return promise;
        }
        execute(callback, value, result = Promise());
        return result;
    };
}

// Executes the callback with the specified value,
// resolving or rejecting the deferred
function execute(callback, value, deferred) {
    immediate(function() {
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
/* Returns a resolved promise
Promise.resolve = function(value) {
    var promise = {};
    promise.then = createHandler(promise, value, true);
    return promise;
};
// Returns a rejected promise
Promise.reject = function(reason) {
    var promise = {};
    promise.then = createHandler(promise, reason, false);
    return promise;
};
Promise.all = function(array) {
    return Promise(function(resolve,reject){
        var len = array.length;
        var resolved = 0;
        var out = [];
        var onSuccess = function(n) {
            return function(v) {
                out[n] = v;
                resolved++;
                if (resolved === len) {
                    resolve(out);
                }
            };
        };
        array.forEach(function(v, i) {
            v.then(onSuccess(i), function(a) {
                reject(a);
            });
        });
    });
};
// Returns a deferred
Promise.immediate = immediate;
*/
module.exports = Promise;
