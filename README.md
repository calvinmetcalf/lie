# promiscuous
promiscuous is a JavaScript promise/deferred implementation, implementing the [Promises/A+ spec](http://promises-aplus.github.com/promises-spec/).

It strives to be **minimal** (< 1kb / 0.5kb gzipped) and **fast**.

## Installation

```bash
$ npm install promiscuous
```

## Usage
### Include the promiscuous script
```javascript
var promiscuous = require('promiscuous');
```

### Create a resolved promise
```javascript
var one = promiscuous.resolve("one");
one.then(console.log);
/* one */
```

### Create a rejected promise
```javascript
var none = promiscuous.reject("error");
none.then(console.log, console.error);
/* error */
```

### Write a function that returns a promise
```javascript
function promiseSomething(something) {
  var defer = promiscuous.deferred();
  setTimeout(function () {
    if (something)
      defer.resolve(something);
    else
      defer.reject("nothing");
  }, 1000);
  return defer.promise();
}
promiseSomething("something").then(console.log, console.error);
/* something */
```
