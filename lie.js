var immediate = require('immediate');
// Creates a deferred: an object with a promise and corresponding resolve/reject methods
function Promise(resolver) {
     if (!(this instanceof Promise)) {
        return new Promise(resolver);
    }
    var queue = [];
    var resolved = false;
    // The `handler` variable points to the function that will
    // 1) handle a .then(onFulfilled, onRejected) call
    // 2) handle a .resolve or .reject call (if not fulfilled)
    // Before 2), `handler` holds a queue of callbacks.
    // After 2), `handler` is a simple .then handler.
    // We use only one function to save memory and complexity.
    var handler = function(onFulfilled, onRejected, value) {
        // Case 1) handle a .then(onFulfilled, onRejected) call
        if (onFulfilled !== handler) {
            return handleThen(onFulfilled, onRejected);
        }
        handleResolve(onRejected, value);
    };
     // Case 1) handle a .then(onFulfilled, onRejected) call
    function handleThen(onFulfilled, onRejected){
        return Promise(function(resolver,rejecter){
            queue.push({
                resolve: onFulfilled,
                reject: onRejected,
                resolver:resolver,
                rejecter:rejecter
            });
        });
    }
    function then(onFulfilled, onRejected) {
        return handler(onFulfilled, onRejected);
    }
    // Case 2) handle a .resolve or .reject call
        // (`onFulfilled` acts as a sentinel)
        // The actual function signature is
        // .re[ject|solve](sentinel, success, value)
    function handleResolve( success, value){
        var action = success ? 'resolve' : 'reject';
        var queued;
        var callback;
        for (var i = 0, l = queue.length; i < l; i++) {
            queued = queue[i];
            callback = queued[action];
            if (typeof callback === 'function') {
                execute(callback, value, queued.resolver, queued.rejecter);
            }else if(success){
                queued.resolver(value);
            }else{
                queued.rejecter(value);
            }
        }
        // Replace this handler with a simple resolved or rejected handler
        handler = createHandler(then, value, success);
        resolved = true;
    }
    this.then = then;
    function yes(value) {
        if (!resolved) {
            handler( true, value);
        }
    }
    function no (reason) {
        if (!resolved) {
            handler( false, reason);
        }
    }
    try{
        resolver(yes,no);
    }catch(e){
        no(e);
    }
}

// Creates a fulfilled or rejected .then function
function createHandler(then, value, success) {
    return function(onFulfilled, onRejected) {
        var callback = success ? onFulfilled : onRejected;
        if (typeof callback !== 'function') {
            return Promise(function(resolve,reject){
                then(resolve,reject);
            });
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
        try {
            var result = callback(value);
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
