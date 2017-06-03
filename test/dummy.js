var should = require('should');
var waterfall = require('run-waterfall');
var mlasq = require('../lib/dummy');

describe('dummy mlasq', function () {
  var data = new Uint8Array([1, 2, 3, 4]).buffer;

  before(function() {
    this.db = mlasq('mlasq-test', [
      'buffers',
      'objects'
    ]);
  });

  after(function(done) {
    this.db.remove(done);
  });

  it('must store, count, remove, objects', function (done) {

    var buffers = this.db.store('buffers');

    waterfall([
      function(fn) {
        buffers.put('aKey', data, fn);
      },
      function(result, fn) {
        buffers.count('aKey', fn);
      },
      function(count, fn) {
        count.should.eql(0);
        buffers.get('aKey', fn);
      },
      function(result, fn) {
        should.not.exist(result);
        buffers.remove('aKey', fn);
      },
      function(result, fn) {
        buffers.count('aKey', fn);
      },
      function(count, fn) {
        count.should.eql(0);
        fn();
      }
    ], done);
  });

  it('must returned empty when not found', function(done) {
    var objects = this.db.store('objects');


    objects.get('oKey', function(err, o) {
      should.not.exist(o);
      done(err);
    });
  });

  it('must empty store on clear', function(done) {

    var buffers = this.db.store('buffers');

    waterfall([
      function(fn) {
        buffers.put('aKey', data, fn);
      },
      function(result, fn) {
        buffers.put('bKey', data, fn);
      },
      function(result, fn) {
        buffers.clear(fn);
      },
      function(result, fn) {
        buffers.count('aKey', fn);
      },
      function(count, fn) {
        count.should.eql(0);
        buffers.count('bKey', fn);
      },
      function(count, fn) {
        count.should.eql(0);
        fn();
      }
    ], done);
  });

});
