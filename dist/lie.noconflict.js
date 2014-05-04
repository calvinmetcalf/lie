!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Lie=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

module.exports = INTERNAL;

function INTERNAL() {}
},{}],2:[function(_dereq_,module,exports){
'use strict';

module.exports = getThen;

function getThen(obj) {
  // Make sure we only access the accessor once as required by the spec
  var then = obj && obj.then;

  if (obj && typeof obj === 'object' && typeof then === 'function') {

    return then.bind(obj);
  }
}
},{}],3:[function(_dereq_,module,exports){
module.exports = exports = _dereq_('./promise');
exports.resolve = _dereq_('./resolve');
exports.reject = _dereq_('./reject');
},{"./promise":5,"./reject":6,"./resolve":7}],4:[function(_dereq_,module,exports){
'use strict';
module.exports = once;
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
},{}],5:[function(_dereq_,module,exports){
'use strict';
var unwrap = _dereq_('./unwrap');
var INTERNAL = _dereq_('./INTERNAL');
var once = _dereq_('./once');
var tryCatch = _dereq_('./tryCatch');
var getThen = _dereq_('./getThen');

// States
var PENDING = 0,
  FULFILLED = 1,
  REJECTED = 2;
module.exports = Promise;
function Promise(resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('reslover must be a function');
  }
  this.state = PENDING;
  this.queue = [];
  if (resolver !== INTERNAL) {
    safelyResolveThenable(this, resolver);
  }
}
Promise.prototype.resolve = function (value) {
  if (this.state !== PENDING) {
    return;
  }
  return resolveFulfill(this, value);
};
Promise.prototype.reject = function (value) {
  if (this.state !== PENDING) {
    return;
  }
  return rejectQueue(this, value);
};


Promise.prototype.then = function (onFulfilled, onRejected) {
  var promise = new Promise(INTERNAL);

  var thenHandler =  {
    promise: promise,
  };
  if (typeof onFulfilled === 'function') {
    thenHandler.callFulfilled = function (value) {
      unwrap(promise, onFulfilled, value);
    };
  } else {
    thenHandler.callFulfilled = function (value) {
      promise.resolve(value);
    };
  }
  if (typeof onRejected === 'function') {
    thenHandler.callRejected = function (value) {
      unwrap(promise, onRejected, value);
    };
  } else {
    thenHandler.callRejected = function (value) {
      promise.reject(value);
    };
  }

  this.queue.push(thenHandler);

  if (this.state === FULFILLED) {
    thenHandler.callFulfilled(this.outcome);
  } else if (this.state === REJECTED) {
    thenHandler.callRejected(this.outcome);
  }

  return promise;
};

function fulfillQueue(self, value) {
  self.state = FULFILLED;
  self.outcome = value;

  self.queue.forEach(function (then) {
    then.callFulfilled(value);
  });
}

function rejectQueue(self, error) {
  self.state = REJECTED;
  self.outcome = error;

  self.queue.forEach(function (then) {
    then.callRejected(error);
  });
}
function safelyResolveThenable(self, thenable) {
  // Either fulfill, reject or reject with error
  var onceWrapper = once();
  var result = tryCatch(function () {
    thenable(
      onceWrapper(function (value) {
        return resolveFulfill(self, value);
      }),
      onceWrapper(function (value) {
        return rejectQueue(self, value);
      })
    );
  });
  if (result.status === 'error') {
    onceWrapper(function (value) {
      return rejectQueue(self, value);
    })(result.value);
  }
}

function resolveFulfill(self, value) {
  var result = tryCatch(getThen, value);
  if (result.status === 'error') {
    return rejectQueue(self, result.value);
  }
  var thenable = result.value;

  if (thenable) {
    safelyResolveThenable(self, thenable);
  } else {
    fulfillQueue(self, value);
  }
}
},{"./INTERNAL":1,"./getThen":2,"./once":4,"./tryCatch":8,"./unwrap":9}],6:[function(_dereq_,module,exports){
'use strict';
var Promise = _dereq_('./promise');
var INTERNAL = _dereq_('./INTERNAL');

module.exports = reject;

function reject(reason) {
	var promise = new Promise(INTERNAL);
	promise.reject(reason);
	return promise;
}
},{"./INTERNAL":1,"./promise":5}],7:[function(_dereq_,module,exports){
'use strict';
var Promise = _dereq_('./promise');
var INTERNAL = _dereq_('./INTERNAL');

module.exports = resolve;

function resolve(value) {
	var promise = new Promise(INTERNAL);
	promise.resolve(value);
	return promise;
}
},{"./INTERNAL":1,"./promise":5}],8:[function(_dereq_,module,exports){
'use strict';

module.exports = tryCatch;

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
},{}],9:[function(_dereq_,module,exports){
'use strict';
var immediate = _dereq_('immediate');
module.exports = unwrap;

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
},{"immediate":11}],10:[function(_dereq_,module,exports){
"use strict";
exports.test = function () {
    return false;
};
},{}],11:[function(_dereq_,module,exports){
"use strict";
var types = [
    _dereq_("./nextTick"),
    _dereq_("./mutation"),
    _dereq_("./postMessage"),
    _dereq_("./messageChannel"),
    _dereq_("./stateChange"),
    _dereq_("./timeout")
];
var handlerQueue = [];
function drainQueue() {
    var i = 0,
        task,
        innerQueue = handlerQueue;
	handlerQueue = [];
	/*jslint boss: true */
	while (task = innerQueue[i++]) {
		task();
	}
}
var nextTick;
var i = -1;
var len = types.length;
while (++ i < len) {
    if (types[i].test()) {
        nextTick = types[i].install(drainQueue);
        break;
    }
}
module.exports = function (task) {
    var len, i, args;
    var nTask = task;
    if (arguments.length > 1 && typeof task === "function") {
        args = new Array(arguments.length - 1);
        i = 0;
        while (++i < arguments.length) {
            args[i - 1] = arguments[i];
        }
        nTask = function () {
            task.apply(undefined, args);
        };
    }
    if ((len = handlerQueue.push(nTask)) === 1) {
        nextTick(drainQueue);
    }
    return len;
};
module.exports.clear = function (n) {
    if (n <= handlerQueue.length) {
        handlerQueue[n - 1] = function () {};
    }
    return this;
};

},{"./messageChannel":12,"./mutation":13,"./nextTick":10,"./postMessage":14,"./stateChange":15,"./timeout":16}],12:[function(_dereq_,module,exports){
(function (global){
"use strict";

exports.test = function () {
    return typeof global.MessageChannel !== "undefined";
};

exports.install = function (func) {
    var channel = new global.MessageChannel();
    channel.port1.onmessage = func;
    return function () {
        channel.port2.postMessage(0);
    };
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(_dereq_,module,exports){
(function (global){
"use strict";
//based off rsvp
//https://github.com/tildeio/rsvp.js/blob/master/lib/rsvp/async.js

var MutationObserver = global.MutationObserver || global.WebKitMutationObserver;

exports.test = function () {
    return MutationObserver;
};

exports.install = function (handle) {
    var observer = new MutationObserver(handle);
    var element = global.document.createElement("div");
    observer.observe(element, { attributes: true });

    // Chrome Memory Leak: https://bugs.webkit.org/show_bug.cgi?id=93661
    global.addEventListener("unload", function () {
        observer.disconnect();
        observer = null;
    }, false);
    return function () {
        element.setAttribute("drainQueue", "drainQueue");
    };
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(_dereq_,module,exports){
(function (global){
"use strict";
exports.test = function () {
    // The test against `importScripts` prevents this implementation from being installed inside a web worker,
    // where `global.postMessage` means something completely different and can"t be used for this purpose.

    if (!global.postMessage || global.importScripts) {
        return false;
    }

    var postMessageIsAsynchronous = true;
    var oldOnMessage = global.onmessage;
    global.onmessage = function () {
        postMessageIsAsynchronous = false;
    };
    global.postMessage("", "*");
    global.onmessage = oldOnMessage;

    return postMessageIsAsynchronous;
};

exports.install = function (func) {
    var codeWord = "com.calvinmetcalf.setImmediate" + Math.random();
    function globalMessage(event) {
        if (event.source === global && event.data === codeWord) {
            func();
        }
    }
    if (global.addEventListener) {
        global.addEventListener("message", globalMessage, false);
    } else {
        global.attachEvent("onmessage", globalMessage);
    }
    return function () {
        global.postMessage(codeWord, "*");
    };
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(_dereq_,module,exports){
(function (global){
"use strict";

exports.test = function () {
    return "document" in global && "onreadystatechange" in global.document.createElement("script");
};

exports.install = function (handle) {
    return function () {

        // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
        // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
        var scriptEl = global.document.createElement("script");
        scriptEl.onreadystatechange = function () {
            handle();

            scriptEl.onreadystatechange = null;
            scriptEl.parentNode.removeChild(scriptEl);
            scriptEl = null;
        };
        global.document.documentElement.appendChild(scriptEl);

        return handle;
    };
};
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(_dereq_,module,exports){
"use strict";
exports.test = function () {
    return true;
};

exports.install = function (t) {
    return function () {
        setTimeout(t, 0);
    };
};
},{}]},{},[3])
(3)
});