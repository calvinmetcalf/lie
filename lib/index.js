'use strict';

const INTERNAL = Symbol('internal');
const STATE = Symbol('state');
const QUEUE = Symbol('queue');
const OUTCOME = Symbol('outcome');
const HANDLED = Symbol('handled');
const RESOLVE = Symbol('resolve');
const REJECT = Symbol('reject');
const RESOLVE_THENABLE = Symbol('safely resolve thenable');
const UNWRAP = Symbol('unwrap');
var immediate = require('immediate');
var states = {};
states.REJECTED = Symbol('REJECTED');
states.FULFILLED = Symbol('FULFILLED');
states.PENDING = Symbol('PENDING');

/* istanbul ignore else */
if (!process.browser) {

  states.UNHANDLED = Symbol('UNHANDLED');
  states.HANDLED = Symbol('HANDLED');
}
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
    if (!(this instanceof Promise)) {
      return new Promise(resolver);
    }
    if (typeof resolver !== 'function' && resolver !== INTERNAL) {
      throw new TypeError('resolver must be a function');
    }
    this[STATE] = states.PENDING;
    this[QUEUE] = [];
    this[OUTCOME] = void 0;
    /* istanbul ignore else */
    if (!process.browser) {
      this[HANDLED] = states.UNHANDLED;
    }
    if (resolver !== INTERNAL) {
      this[RESOLVE_THENABLE](resolver);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
  then(onFulfilled, onRejected) {
    if (typeof onFulfilled !== 'function' && this[STATE] === states.FULFILLED ||
      typeof onRejected !== 'function' && this[STATE] === states.REJECTED) {
      return this;
    }
    var promise = new this.constructor(INTERNAL);
    /* istanbul ignore else */
    if (!process.browser) {
      if (typeof onRejected === 'function' && this[HANDLED] === states.UNHANDLED) {
        this[HANDLED] = this.HANDLED;
      }
    }
    if (this[STATE] !== states.PENDING) {
      var resolver = this[STATE] === states.FULFILLED ? onFulfilled : onRejected;
      promise[UNWRAP](resolver, this[OUTCOME]);
    } else {
      this[QUEUE].push(new QueueItem(promise, onFulfilled, onRejected));
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
   if (Object.prototype.toString.call(iterable) !== '[object Array]') {
     return this.reject(new TypeError('must be an array'));
   }
   var len = iterable.length;
   var called = false;
   if (!len) {
     return this.resolve([]);
   }

   var values = new Array(len);
   var resolved = 0;
   var i = -1;
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
   while (++i < len) {
     allResolver(iterable[i], i);
   }
   return promise;
 }
 static race(iterable) {
   if (Object.prototype.toString.call(iterable) !== '[object Array]') {
     return this.reject(new TypeError('must be an array'));
   }

   var len = iterable.length;
   var called = false;
   if (!len) {
     return this.resolve([]);
   }

   var i = -1;
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
   while (++i < len) {
     resolver(iterable[i]);
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
     this[STATE] = states.FULFILLED;
     this[OUTCOME] = value;
     var i = -1;
     var len = this[QUEUE].length;
     while (++i < len) {
       this[QUEUE][i].callFulfilled(value);
     }
   }
   return this;
 }
 [REJECT] (error) {
   this[STATE] = states.REJECTED;
   this[OUTCOME] = error;
   /* istanbul ignore else */
   if (!process.browser) {
     if (this[HANDLED] === states.UNHANDLED) {
       immediate(() => {
         if (this[HANDLED] === states.UNHANDLED) {
           process.emit('unhandledRejection', error, this);
         }
       });
     }
   }
   var i = -1;
   var len = this[QUEUE].length;
   while (++i < len) {
     this[QUEUE][i].callRejected(error);
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
