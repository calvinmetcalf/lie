var lie = require('../dist/lie.min.js');
module.exports = {
  fullfilled: lie.resolve,
  rejected:   lie.reject,
  pending: function () {
    var deferred = lie.deferred();
    return {
      promise: deferred.promise,
      fulfill: deferred.resolve,
      reject:  deferred.reject,
    };
  },
};
