var deferred = require('../dist/lie.min');
exports.fullfilled = deferred.resolve;
exports.rejected = deferred.reject;
exports.pending = deferred;
