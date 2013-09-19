# lie
<a href="http://promises-aplus.github.com/promises-spec">
  <img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png"
       alt="Promises/A+ logo" title="Promises/A+ 1.0 compliant" align="right" />
</a>

lie is a JavaScript promise/deferred implementation, implementing the [Promises/A+ spec](http://promises-aplus.github.com/promises-spec/).

A fork of [Ruben Verborgh's](https://github.com/RubenVerborgh) library called [promiscuous](https://github.com/RubenVerborgh/promiscuous).
Which takes advantage of my [immediate library](https://github.com/calvinmetcalf/setImmediate), uses object constructors, and with a name I can actually consistently spell. 
Plus if I learned anything from [catiline](https://github.com/calvinmetcalf/catiline) (formally communist) it's that you don't want to pick an even mildly offensive name.

## API

by defailt adds a function called 'deferred' to the global scope (or if you grab the noConflict version than one called lie)

### return a promise
```javascript
function waitAwhile
	var def = deferred();

	setTimeout(function(){
		def.resolve('DONE!');
	},10000);//resolve it in 10 secons

	return def.promise//return the promise
}
```

### Create a resolved promise
```javascript
var one = deferred.resolve("one");
one.then(console.log);
/* one */
```

### Create a rejected promise
```javascript
var none = deferred.reject("error");
none.then(console.log, console.error);
/* error */
```

### Write a function turns node style callback to promises
```javascript
function denodify(func) {
  return function(){
    var args = Array.prototype.concat.apply([],arguments);
    var def = deferred();
    args.push(function(err,success){
        if(err) {
            def.reject(err);
        } else {
            def.resolve(success);
        }
    });
    function.apply(undefined,args);
    return def.promise;
  }
}
```

##node

install with `npm install lie`, exactly the same as above but 

```javascript
var deferred = require('lie');
var resolve = deferred.resolve;
var reject = deferred.reject;
```

