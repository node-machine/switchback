var should = require('should');


var switchback = require('../lib');


// Fixtures
var fixtures = {
	fn: function (err, data) {},
	handlers: {
		success: function (data) {},
		error: function (err) {}
	}
};


// Suites
describe('switchback(Function)', function (){
	
	var cb = fixtures.fn;

	it('should return a switchback', function () {
		var sb = switchback(cb);

		sb.should.be.a.Function;
		switchback.isSwitchback(sb).should.be.ok;
	});
});

describe('switchback(Handlers)', function (){
	
});

describe('switchback(Function, Object)', function (){
	
});

describe('switchback(Handlers, Object)', function (){
	
});


describe('switchback(Function, Object, Object)', function (){
	
});

describe('switchback(Handlers, Object, Object)', function (){
	
});


