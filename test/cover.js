'use strict';
var aplus = require('promises-aplus-tests');
var Promise = require('../lib');
var adapter = {};
var assert = require('assert');

adapter.deferred = function () {
  var pending = {};
  pending.promise = new Promise(function (resolver, reject) {
    pending.resolve = resolver;
    pending.reject = reject;
  });
  return pending;
};
adapter.resolved = function (value) {
  return Promise.resolve(value);
}
adapter.rejected = function (reason) {
  return Promise.reject(reason);
}

describe('Lie', function () {
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
  describe('resolve', function () {
    it('should work with true', function (done) {
      Promise.resolve(true).then(function (value) {
        if (value === true) {
          done();
        } else {
          done(true);
        }
      });
    });
    it('should work with false', function (done) {
      Promise.resolve(false).then(function (value) {
        if (value === false) {
          done();
        } else {
          done(true);
        }
      });
    });
    it('should work with null', function (done) {
      Promise.resolve(null).then(function (value) {
        if (value === null) {
          done();
        } else {
          done(true);
        }
      });
    });
    it('should work with undefined', function (done) {
      Promise.resolve(undefined).then(function (value) {
        if (value === undefined) {
          done();
        } else {
          done(true);
        }
      });
    });
    it('should work with 0', function (done) {
      Promise.resolve(0).then(function (value) {
        value++;
        return Promise.resolve(0);
      }).then(function (value) {
        if (value === 0) {
          done();
        } else {
          done(true);
        }
      });
    });
    it('should work with 1', function (done) {
      Promise.resolve(1).then(function (value) {
        if (value === 1) {
          done();
        } else {
          done(true);
        }
      });
    });
    it('should work with \'\'', function (done) {
      Promise.resolve('').then(function (value) {
        if (value === '') {
          done();
        } else {
          done(true);
        }
      });
    });
    it('should work with \'something\'', function (done) {
      Promise.resolve('something').then(function (value) {
        if (value === 'something') {
          done();
        } else {
          done(true);
        }
      });
    });
  });
  describe('Promise.all', function () {
    //https://github.com/domenic/promises-unwrapping/blob/master/reference-implementation/test/all.js
    it('fulfills if passed an empty array', function (done) {
      var iterable = [];

      Promise.all(iterable).then(function (value) {
        assert(Array.isArray(value));
        assert.deepEqual(value, []);
        done();
      });
    });

    it('fulfills if passed an array of mixed fulfilled promises and values', function (done) {
      var iterable = [0, Promise.resolve(1), 2, Promise.resolve(3)];

      Promise.all(iterable).then(function (value) {
        assert(Array.isArray(value));
        assert.deepEqual(value, [0, 1, 2, 3]);
        done();
      });
    });

    it('rejects if any passed promise is rejected', function (done) {
      var foreverPending = new Promise(function () {});
      var error = new Error('Rejected');
      var rejected = Promise.reject(error);

      var iterable = [foreverPending, rejected];

      Promise.all(iterable).then(
        function (value) {
          assert(false, 'should never get here');
          done();
        },
        function (reason) {
          assert.strictEqual(reason, error);
          done();
        }
      );
    });

    it('resolves foreign thenables', function (done) {
      var normal = Promise.resolve(1);
      var foreign = { then: function (f) { f(2); } };

      var iterable = [normal, foreign];

      Promise.all(iterable).then(function (value) {
        assert.deepEqual(value, [1, 2]);
        done();
      });
    });

    it('does not reject twice', function (done) {
      var normal = Promise.resolve(1);
      var error = new Error('rejected once');
      var two = Promise.reject(error);
      var three = new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('rejected twice'));
        }, 30);
      });

      var iterable = [normal, two, three];

      Promise.all(iterable).then(function (value) {
          assert(false, 'should never get here');
          done();
        }, function (value) {
        assert.deepEqual(value, error);
        done();
      });
    });

    it('fulfills when passed an sparse array, giving `undefined` for the omitted values', function (done) {
      var iterable = [Promise.resolve(0), , , Promise.resolve(1)];

      Promise.all(iterable).then(function (value) {
        assert.deepEqual(value, [0, undefined, undefined, 1]);
        done();
      });
    });

    it('does not modify the input array', function (done) {
      var input = [0, 1];
      var iterable = input;

      Promise.all(iterable).then(function (value) {
        assert.notStrictEqual(input, value);
        done();
      });
    });


    it('should reject with a TypeError if given a non-iterable', function (done) {
      var notIterable = {};

      Promise.all(notIterable).then(
        function () {
          assert(false, 'should never get here');
          done();
        },
        function (reason) {
          assert(reason instanceof TypeError);
          done();
        }
      );
    });
  });
 describe('Promise.race', function () {
    //https://github.com/domenic/promises-unwrapping/blob/master/reference-implementation/test/all.js
    function delay(value, time, rejectIt) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          if (rejectIt) {
            return reject(value);
          }
          resolve(value);
        }, time);
      });
    }
    it('fulfills if passed an empty array', function (done) {
      var iterable = [];

      Promise.race(iterable).then(function (value) {
        assert(Array.isArray(value));
        assert.deepEqual(value, []);
        done();
      });
    });

    it('fulfills if passed an array of mixed fulfilled promises and values', function (done) {
      var iterable = [delay(0, 20), Promise.resolve(1), delay(2, 30), delay(Promise.resolve(3), 20)];

      Promise.race(iterable).then(function (value) {
        assert.equal(value, 1);
        done();
      });
    });

    it('rejects if firsed resolved promise is rejected', function (done) {
      var error = new Error('Rejected');

      var iterable = [delay(true, 300), delay(error, 20, true)];

      Promise.race(iterable).then(
        function (value) {
          assert(false, 'should never get here');
          done();
        },
        function (reason) {
          assert.strictEqual(reason, error);
          done();
        }
      );
    });

    it('resolves if second resolved promise is rejected', function (done) {
      var error = new Error('Rejected');

      var iterable = [delay(true, 30), delay(error, 200, true)];

      Promise.race(iterable).then(
        function (value) {
          assert(value, 'should resolve');
          done();
        },
        function (reason) {
          assert(false, 'should never get here');
          done();
        }
      );
    });

    it('resolves foreign thenables', function (done) {
      var normal = Promise.resolve(1);
      var foreign = { then: function (f) { f(2); } };

      var iterable = [delay(Promise.resolve(1), 200), foreign];

      Promise.race(iterable).then(function (value) {
        assert.deepEqual(value, 2);
        done();
      });
    });

    it('fulfills when passed an sparse array, giving `undefined` for the omitted values', function (done) {
      var iterable = [delay(Promise.resolve(0), 300), , , delay(Promise.resolve(1), 300)];

      Promise.race(iterable).then(function (value) {
        assert.equal(value, undefined);
        done();
      });
    });



    it('should reject with a TypeError if given a non-iterable', function (done) {
      var notIterable = {};

      Promise.race(notIterable).then(
        function () {
          assert(false, 'should never get here');
          done();
        },
        function (reason) {
          assert(reason instanceof TypeError);
          done();
        }
      );
    });
  });
  if (!process.browser) {
    it('should emit events for unhandled errors', function (done) {
      var called = 0;
      var err1 = new Error('should be caught');

      var err2 = new Error('should be uncaught');
      var promise1 = Promise.reject(err1);
      var promise2 = Promise.reject(err2);
      promise1.catch(function () {});
      function onEvent(reason, promise) {
        if (!called) {
          called++;
          assert.equal(err2, reason);
          assert.equal(promise2, promise);
          setTimeout(function (){
            process.removeListener('unhandledRejection', onEvent);
            done();
          }, 100)
        } else {
          done(new Error('called more then once'));
        }
      }
      process.on('unhandledRejection', onEvent);
    });
  }
  describe('Promises/A+ Tests', function () {
    aplus.mocha(adapter);
  });
});
var P = Promise;
var someRejectionReason = { message: 'some rejection reason' };
var anotherReason = { message: 'another rejection reason' };
describe('mocha promise sanity check', function () {
	it('passes with a resolved promise', function () {
		return P.resolve(3);
	});

	it('passes with a rejected then resolved promise', function () {
		return P.reject(someRejectionReason).catch(function (x) {
      return 'this should be resolved';
    });
	});

    var ifPromiseIt = P === Promise ? it : it.skip;
	ifPromiseIt('is the native Promise', function () {
		assert.equal(P, Promise);
	});
});
describe('onFinally', function () {
	describe('no callback', function () {
		specify('from resolved', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally()
				.then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function () {
			return adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally()
				.then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(reason) {
					assert.strictEqual(reason, someRejectionReason);
				});
		});
	});

	describe('throws an exception', function () {
		specify('from resolved', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					throw someRejectionReason;
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(reason) {
					assert.strictEqual(reason, someRejectionReason);
				});
		});

		specify('from rejected', function () {
			return adapter.rejected(anotherReason).finally(function onFinally() {
				assert(arguments.length === 0);
				throw someRejectionReason;
			}).then(function onFulfilled() {
				throw new Error('should not be called');
			}, function onRejected(reason) {
				assert.strictEqual(reason, someRejectionReason);
			});
		});
	});

	describe('returns a non-promise', function () {
		specify('from resolved', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return 4;
				}).then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function () {
			return adapter.rejected(anotherReason)
				.catch(function (e) {
					assert.strictEqual(e, anotherReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					throw someRejectionReason;
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, someRejectionReason);
				});
		});
	});

	describe('returns a pending-forever promise', function () {
		specify('from resolved', function (done) {
			adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 0.1e3);
					return new P(function () {}); // forever pending
				}).then(function onFulfilled(x) {
					throw new Error('should not be called');
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function (done) {
			adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 0.1e3);
					return new P(function () {}); // forever pending
				}).then(function onFulfilled(x) {
					throw new Error('should not be called');
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});
	});

	describe('returns an immediately-fulfilled promise', function () {
		specify('from resolved', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return adapter.resolved(4);
				}).then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function () {
			return adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return adapter.resolved(4);
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, someRejectionReason);
				});
		});
	});

	describe('returns an immediately-rejected promise', function () {
		specify('from resolved ', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return adapter.rejected(4);
				}).then(function onFulfilled(x) {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, 4);
				});
		});

		specify('from rejected', function () {
			var newReason = {};
			return adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return adapter.rejected(newReason);
				}).then(function onFulfilled(x) {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, newReason);
				});
		});
	});

	describe('returns a fulfilled-after-a-second promise', function () {
		specify('from resolved', function (done) {
			adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 1.5e3);
					return new P(function (resolve) {
						setTimeout(function () {resolve(4)}, 1e3);
					});
				}).then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function (done) {
			adapter.rejected(3)
				.catch(function (e) {
					assert.strictEqual(e, 3);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 1.5e3);
					return new P(function (resolve) {
						setTimeout(function () {resolve(4)}, 1e3);
					});
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, 3);
				});
		});
	});

	describe('returns a rejected-after-a-second promise', function () {
		specify('from resolved', function (done) {
			adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 1.5e3);
					return new P(function (resolve, reject) {
						setTimeout(function (){ reject(4)}, 1e3);
					});
				}).then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function (done) {
			adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 1.5e3);
					return new P(function (resolve, reject) {
						setTimeout(function (){ reject(anotherReason)}, 1e3);
					});
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, anotherReason);
				});
		});
	});
});
