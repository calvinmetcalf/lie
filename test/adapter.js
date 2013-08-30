var lie = require('../dist/lie.min.js');
exports.fullfilled = lie.deferred.resolve;
exports.rejected = lie.deferred.reject;
exports.pending = lie.deferred;
