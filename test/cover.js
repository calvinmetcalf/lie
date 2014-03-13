'use strict';

var promise = require('../lib/lie');
var adapter = {};
//based off rsvp's adapter
adapter.deferred = function () {
  var pending = {};
  pending.promise = new promise(function (resolve, reject) {
    pending.resolve = resolve;
    pending.reject = reject;
  });
  

  return pending;
};
adapter.rejected = function (reason) {
  return promise(function () {
    throw reason;
  });
};
module.exports = adapter;