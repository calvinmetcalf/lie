var promiscuous = require('../dist/promiscuous.js');
module.exports = {
  fullfilled: promiscuous.resolve,
  rejected:   promiscuous.reject,
  pending: function () {
    var deferred = promiscuous.deferred();
    return {
      promise: deferred.promise,
      fulfill: deferred.resolve,
      reject:  deferred.reject,
    };
  },
};
