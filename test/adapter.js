'use strict';
var Promise = require('../lib/index');
var promisesAplusTests = require('promises-aplus-tests');
var adapter = {};

adapter.deferred = function () {
  var pending = {};
  pending.promise = new Promise(function (resolver, reject) {
  	pending.resolve = resolver;
  	pending.reject = reject;
  });
  return pending;
};
adapter.resolved = Promise.resolve;
adapter.reject = Promise.reject;
promisesAplusTests(adapter, {
  reporter: 'spec'
}, function () {
  console.log('done');
  process.exit();
});
