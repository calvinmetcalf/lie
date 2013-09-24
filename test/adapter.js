var promise = require('../dist/lie.min');
var promisesAplusTests = require("promises-aplus-tests");
var adapter = {};
//based off rsvp's adapter
adapter.fulfilled = function(value) {
  return promise(function(resolve, reject) {
    resolve(value);
  });
};

adapter.rejected = function(error) {
  return new promise(function(resolve, reject) {
    reject(error);
  });
};

adapter.pending = function () {
  var pending = {};

  pending.promise = new promise(function(resolve, reject) {
    pending.fulfill = resolve;
    pending.reject = reject;
  });

  return pending;
};
promisesAplusTests(adapter, { reporter: "nyan" }, function (err) {
  if(err){
    console.log(err);
  }
});
