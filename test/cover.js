'use strict';
var aplus = require('promises-aplus-tests');
var Promise = require('../lib');
var adapter = {};
var INTERNAL = require('../lib/INTERNAL');

adapter.deferred = function () {
  var pending = {};
  pending.promise = new Promise(function (resolver, reject) {
    pending.resolve = resolver;
    pending.reject = reject;
  });
  return pending;
};
adapter.resolved = Promise.resolve;
adapter.rejected = Promise.reject;
//noop, just for coverage
INTERNAL();

describe('Lie', function () {
  it('should work without new', function (done) {
    Promise(function (resolve) {
      resolve(true);
    }).then(function () {
      done();
    });
  });
  it('should work resolving a promise new', function (done) {
    new Promise(function (resolve) {
      resolve(new Promise(function (resolve) {
        resolve(true);
      }));
    }).then(function (result) {
      if (result === true) {
        done();
      } else {
        done(true);
      }
    });
  });
  it('should throw if you don\'t pass a function', function (done) {
    try {
      new Promise(true);
    } catch (e) {
      if (e instanceof TypeError) {
        done();
      } else {
        done(e);
      }
    }
  });
  it('should have a working catch method', function (done) {
    new Promise(function () {
      throw new Error('boom');
    }).catch(function () {
      done();
    });
  });
  describe('Promises/A+ Tests', function () {
      aplus.mocha(adapter);
  });
});