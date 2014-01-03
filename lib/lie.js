'use strict';

var immediate = require('immediate');

function Promise(resolver) {

     if (!(this instanceof Promise)) {
        return new Promise(resolver);
    }

    this.successQueue = [];
    this.failureQueue = [];
    this.resolved = false;

  
    if(typeof resolver === 'function'){
        try{
            resolver(this.fulfillUnwrap.bind(this),this.reject.bind(this));
        }catch(e){
            this.reject(e);
        }
    }
}
Promise.prototype.reject = function(reason){
    this.resolve(false,reason);
};
Promise.prototype.fulfill = function fulfill(value){
    this.resolve(true,value);
};

Promise.prototype.fulfillUnwrap = function(value){
    unwrap(this.fulfill.bind(this), this.reject.bind(this), value);
};
Promise.prototype.then = function(onFulfilled, onRejected) {
    if(this.resolved){
        return this.resolved(onFulfilled, onRejected);
    } else {
        return this.pending(onFulfilled, onRejected);
    }
};
Promise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
};
Promise.prototype.pending = function pending(onFulfilled, onRejected){
    var self = this;
    return new Promise(function(success,failure){
        if(typeof onFulfilled === 'function'){
            self.successQueue.push({
                resolve: success,
                reject: failure,
                callback:onFulfilled
            });
        }else{
            self.successQueue.push({
                next: success,
                callback:false
            });
        }

        if(typeof onRejected === 'function'){
            self.failureQueue.push({
                resolve: success,
                reject: failure,
                callback:onRejected
            });
        }else{
            self.failureQueue.push({
                next: failure,
                callback:false
            });
        }
    });
};
Promise.prototype.resolve = function (success, value){

    if(this.resolved){
        return;
    }

    this.resolved = createResolved(this, value, success?0:1);

    var queue = success ? this.successQueue : this.failureQueue;
    var len = queue.length;
    var i = -1;
    while(++i < len) {

        if (queue[i].callback) {
            immediate(execute,queue[i].callback, value, queue[i].resolve, queue[i].reject);
        }else {
            queue[i].next(value);
        }
    }
};
function unwrap(fulfill, reject, value){
    if(value && typeof value.then==='function'){
        value.then(fulfill,reject);
    }else{
        fulfill(value);
    }
}

function createResolved(scope, value, whichArg) {
    function resolved() {
        var callback = arguments[whichArg];
        if (typeof callback !== 'function') {
            return scope;
        }else{
            return new Promise(function(resolve,reject){
                immediate(execute,callback,value,resolve,reject);
            });
        }
    }
    return resolved;
}

function execute(callback, value, resolve, reject) {
    try {
        unwrap(resolve,reject,callback(value));
    } catch (error) {
        reject(error);
    }
}



module.exports = Promise;
