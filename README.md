switchback
========

Normalize a callback to a "switchback" and vice versa.

> Basically, a switchback lets you deal with things kind of like you might be familiar with in jQuery (i.e. `$.ajax({ success: foo, error: bar });`)


## Usage



##### To upgrade node callbacks
```javascript
// Some arbitrary callback function
var cb = function (err, foo, bar, baz /*, ... */) {
  if (err) return console.error(err);
  return console.log({ foo: foo, bar: bar, baz: baz });
};


cb = switchback(cb);

// Now you can call `cb.error()` and `cb.success()` with your favorite arguments.
```


##### Setting up your functions to accept switchback objects AND node callbacks
```javascript
var switchback = require('node-switchback');

// Your function of choice
function freeHouseholdPets (stuff, moreStuff, lookAtAllThisStuff, cb) {
  
  // At the very top, upgrade callback to a switchback
  cb = switchback(cb);
  
  // Do your stuff
  // ...
  
  
  // Things that would trigger the `success` handler:
  return cb();
  return cb.success('the results!!!!');
  return cb.success();
  
  
  // Things that would trigger the `error` handler:
  return cb('bahh!');
  return cb.error('bahh!');
  return cb.error();
  
  
  // OK but what about usage with normal node callbacks?
  //
  // If a user of `freeHouseholdPets()` passes in an old-school callback,
  // e.g. function (err, results) {console.log(err,results);}, here's what
  // they'll get printed to the console in each case:
  
  cb.success('the results!!!!'); // ---> null 'the results!!!!'
  cb.success() // ---> null undefined
  cb('bahh!') // ---> bahh! undefined
  cb.error() // ---> [Error] undefined
  cb.error('bahh!') // ---> bahh! undefined
  
  
}


// Now everybody can do:
freeHouseholdPets()

```




## Examples

##### with `async`
```javascript
// TODO
```

##### with `q` promises
```javascript
// TODO
```

##### with generators
```javascript
// TODO
```
