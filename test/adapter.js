'use strict';
var Promise = require('../lib/lie');
var promisesAplusTests = require('promises-aplus-tests');
var adapter = {};

adapter.deferred = function () {
  var pending = {};
  pending.promise = new Promise();
  pending.resolve = function (value) {
    return pending.promise.resolve(value);
  };
  pending.reject = function (value) {
    return pending.promise.reject(value);
  };
  return pending;
};

promisesAplusTests(adapter, {
  reporter: 'spec'//,
  // timeout: '500000',
  // grep:'2.3.3: Otherwise, if `x` is an object or function, 2.3.3.3: If `then` is a function, call it with `x` as `this`, first argument `resolvePromise`, and second argument `rejectPromise` 2.3.3.3.1: If/when `resolvePromise` is called with value `y`, run `[[Resolve]](promise, y)` `y` is a thenable `y` is a thenable that fulfills but then throws `then` calls `resolvePromise` asynchronously via return from a fulfilled promise'
}, function () {
  console.log('done');
  process.exit();
});
