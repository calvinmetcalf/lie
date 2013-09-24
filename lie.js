var immediate = require('immediate');
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
        if (onFulfilled !== handler) {
            return Promise(function(resolver,rejecter){
                handler.queue.push({
                    resolve: onFulfilled,
                    reject: onRejected,
                    resolver:resolver,
                    rejecter:rejecter
                });
            });
        }

        // Case 2) handle a .resolve or .reject call
        // (`onFulfilled` acts as a sentinel)
        // The actual function signature is
        // .re[ject|solve](sentinel, success, value)
        var action = onRejected ? 'resolve' : 'reject';
        var queue;
        var callback;
        for (var i = 0, l = handler.queue.length; i < l; i++) {
            queue = handler.queue[i];
            callback = queue[action];
            if (typeof callback === 'function') {
                execute(callback, value, queue.resolver, queue.rejecter);
            }else if(onRejected){
                queue.resolver(value);
            }else{
                queue.rejecter(value);
            }
        }
        // Replace this handler with a simple resolved or rejected handler
        handler = createHandler(then, value, onRejected);
    };
    function then(onFulfilled, onRejected) {
        return handler(onFulfilled, onRejected);
    }
    
    this.then = then;
    // The queue of deferreds
    handler.queue = [];
    resolver(function(value) {
        if (handler.queue) {
            handler(handler, true, value);
        }
    },function (reason) {
        if (handler.queue) {
            handler(handler, false, reason);
        }
    });
}

// Creates a fulfilled or rejected .then function
function createHandler(then, value, success) {
    return function(onFulfilled, onRejected) {
        var callback = success ? onFulfilled : onRejected;
        if (typeof callback !== 'function') {
            return {then:then};
        }
        return Promise(function(resolve,reject){
            execute(callback, value, resolve, reject);
       });
    };
}

// Executes the callback with the specified value,
// resolving or rejecting the deferred
function execute(callback, value, resolve, reject) {
    immediate(function() {
        var result;
        try {
            result = callback(value);
            if (result && typeof result.then === 'function') {
                result.then(resolve, reject);
            }
            else {
                resolve(result);
            }
        }
        catch (error) {
            reject(error);
        }
    });
}

module.exports = Promise;
