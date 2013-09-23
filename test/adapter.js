var deferred = require('../dist/lie.min');
var promisesAplusTests = require("promises-aplus-tests");
var adapter = {};
adapter.fullfilled = deferred.resolve;
adapter.rejected = deferred.reject;
adapter.pending = deferred;
promisesAplusTests(adapter, { reporter: "nyan" }, function (err) {
  if(err){
    console.log(err);
  }
});
