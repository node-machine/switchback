/**
 * Module dependencies
 */

var switchback = require('../lib');


describe('switchback called from a synchronous function', function() {


  var someSynchronousFn = function (foobar, cb) {
    var sb = switchback(cb);
    sb.success('some stuff');
    return sb;
  };



  it('should ensure that at least one cycle of the event loop has elapsed (to support `.on()` usage)', function (done){

    var timer = setTimeout(function () {
      return done(new Error('Should have called the switchback event handlers by now!'));
    }, 5);

    someSynchronousFn({
      blah: 'this other argument doesnt matter',
      blahblah: 'its the callback we care about'
    })
    .on('error', function (err) {
      clearTimeout(timer);
      return done(err);
    })
    .on('success', function (data) {
      clearTimeout(timer);
      assert.equal(data, 'some stuff');
      return done();
    });

  });

});
