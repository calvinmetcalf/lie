'use strict';

var immediate = require('immediate');

function INTERNAL() {}

const STATE = Symbol('state');
const QUEUE = Symbol('queue');
const OUTCOME = Symbol('outcome');
const HANDLED = Symbol('handled');
const RESOLVE = Symbol('resolve');
const REJECT = Symbol('reject');
const RESOLVE_THENABLE = Symbol('safely resolve thenable');
const UNWRAP = Symbol('unwrap');



/* istanbul ignore else */

class TryCatch {
  constructor(func, value) {
    try {
      this.value = func(value);
      this.status = 'success';
    } catch (e) {
      this.status = 'error';
      this.value = e;
    }
  }
}


function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;
  if (obj && typeof obj === 'object' && typeof then === 'function') {
    return function appyThen() {
      then.apply(obj, arguments);
    };
  }
}


class QueueItem {
  constructor(promise, onFulfilled, onRejected) {
    this.promise = promise;
    if (typeof onFulfilled === 'function') {
      this.onFulfilled = onFulfilled;
      this.callFulfilled = this.otherCallFulfilled;
    }
    if (typeof onRejected === 'function') {
      this.onRejected = onRejected;
      this.callRejected = this.otherCallRejected;
    }
  }
  callFulfilled (value) {
    this.promise[RESOLVE](value);
  }
  otherCallFulfilled (value) {
    this.promise[UNWRAP](this.onFulfilled, value);
  }
  callRejected (value) {
    this.promise[REJECT](value);
  }
  otherCallRejected (value) {
    this.promise[UNWRAP](this.onRejected, value);
  }
}
class Promise{
  constructor(resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError('resolver must be a function');
    }
    this[STATE] = 0;
    this[QUEUE] = new Set();
    this[OUTCOME] = void 0;
    /* istanbul ignore else */
    if (!process.browser) {
      this[HANDLED] = false;
    }
    if (resolver !== INTERNAL) {
      this[RESOLVE_THENABLE](resolver);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  then(onFulfilled, onRejected) {
    if (typeof onFulfilled !== 'function' && this[STATE] === 2 ||
      typeof onRejected !== 'function' && this[STATE] === 1) {
      return this;
    }
    var promise = new this.constructor(INTERNAL);
    /* istanbul ignore else */
    if (!process.browser) {
      if (typeof onRejected === 'function' && !this[HANDLED]) {
        this[HANDLED] = true;
      }
    }
    if (this[STATE] !== 0) {
      var resolver = this[STATE] === 2 ? onFulfilled : onRejected;
      promise[UNWRAP](resolver, this[OUTCOME]);
    } else {
      this[QUEUE].add(new QueueItem(promise, onFulfilled, onRejected));
    }

    return promise;
  }
  static resolve(value) {

    if (value instanceof this) {
      return value;
    }
    return new this(INTERNAL)[RESOLVE](value);
  }
  static reject(reason) {
   return new this(INTERNAL)[REJECT](reason);
 }
 static all(iterable) {
   if (!iterable || typeof iterable[Symbol.iterator] !== 'function') {
     return this.reject(new TypeError('must be an interable'));
   }
   var len = iterable.length;
   var called = false;
   if (!len) {
     return this.resolve([]);
   }

   var values = new Array(len);
   var resolved = 0;

   var promise = new this(INTERNAL);
   let allResolver = (value, i) => {
     this.resolve(value).then(resolveFromAll, function (error) {
       if (!called) {
         called = true;
         promise[REJECT](error);
       }
     });
     function resolveFromAll(outValue) {
       values[i] = outValue;
       if (++resolved === len & !called) {
         called = true;
         promise[RESOLVE](values);
       }
     }
   }
   var i = 0;
   for (let value of iterable) {
     allResolver(value, i++);
   }
   return promise;
 }
 static race(iterable) {
   if (!iterable || typeof iterable[Symbol.iterator] !== 'function') {
     return this.reject(new TypeError('must be an interable'));
   }

   var len = iterable.length;
   var called = false;
   if (!len) {
     return this.resolve([]);
   }

   var promise = new this(INTERNAL);
   let resolver = value => {
     this.resolve(value).then(function (response) {
       if (!called) {
         called = true;
         promise[RESOLVE](response);
       }
     }, function (error) {
       if (!called) {
         called = true;
         promise[REJECT](error);
       }
     });
   }
   var i = 0;
   for (let value of iterable) {
     resolver(value, i++);
   }
   return promise;
 }
 [RESOLVE] (value) {
   var result = new TryCatch(getThen, value);
   if (result.status === 'error') {
     return this[REJECT](result.value);
   }
   var thenable = result.value;

   if (thenable) {
     this[RESOLVE_THENABLE](thenable);
   } else {
     this[STATE] = 2;
     this[OUTCOME] = value;
     for (let item of this[QUEUE]) {
       item.callFulfilled(value);
     }
   }
   return this;
 }
 [REJECT] (error) {
   this[STATE] = 1;
   this[OUTCOME] = error;
   /* istanbul ignore else */
   if (!process.browser) {
     if (!this[HANDLED]) {
       immediate(() => {
         if (!this[HANDLED]) {
           process.emit('unhandledRejection', error, this);
         }
       });
     }
   }
   for (let item of this[QUEUE]) {
     item.callRejected(error);
   }
   return this;
 }
 [RESOLVE_THENABLE] (thenable) {
   // Either fulfill, reject or reject with error
   var called = false;
   let onError = value => {
     if (called) {
       return;
     }
     called = true;
     this[REJECT](value);
   }

   let onSuccess = value => {
     if (called) {
       return;
     }
     called = true;
     this[RESOLVE](value);
   }

   function tryToUnwrap() {
     thenable(onSuccess, onError);
   }

   var result = new TryCatch(tryToUnwrap);
   if (result.status === 'error') {
     onError(result.value);
   }
 }
 [UNWRAP](func, value) {
   immediate(() => {
     var returnValue;
     try {
       returnValue = func(value);
     } catch (e) {
       return this[REJECT](e);
     }
     if (returnValue === this) {
       this[REJECT](new TypeError('Cannot resolve promise with itself'));
     } else {
       this[RESOLVE](returnValue);
     }
   });
 }
}
module.exports = Promise;
