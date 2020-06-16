const should = require('should');
const waterfall = require('run-waterfall');
const mlasq = require('../lib/mlasq');

describe('mlasq', function () {
  const data = new Uint8Array([1, 2, 3, 4]).buffer;

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

    const buffers = this.db.store('buffers');


    waterfall([
      function(fn) {
        buffers.put('aKey', data, fn);
      },
      function(result, fn) {
        result.should.eql('aKey');
        buffers.count('aKey', fn);
      },
      function(count, fn) {
        count.should.eql(1);
        buffers.get('aKey', fn);
      },
      function(result, fn) {
        result.should.eql(data);
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

  it('must get all stored keys', function (done) {

    const buffers = this.db.store('buffers');

    waterfall([
      function(fn) {
        buffers.put('aKey', data, fn);
      },
      function(result, fn) {
        buffers.put('bKey', data, fn);
      },
      function(result, fn) {
        buffers.put('cKey', data, fn);
      },
      function(result, fn) {
        buffers.getAllKeys(fn);
      },
      function(result, fn) {
        result.should.eql([ 'aKey', 'bKey', 'cKey' ]);
        fn();
      }
    ], done);

  });

  it('must get all stored objects', function (done) {

    const objects = this.db.store('objects');

    waterfall([
      function(fn) {
        objects.put('aKey', { a: 1 }, fn);
      },
      function(result, fn) {
        objects.put('bKey', { b: 2 }, fn);
      },
      function(result, fn) {
        objects.put('cKey', { c: 3 }, fn);
      },
      function(result, fn) {
        objects.getAll(fn);
      },
      function(result, fn) {
        result.should.eql([ { a: 1 }, { b: 2 }, { c: 3 } ]);
        fn();
      }
    ], done);

  });

  it('must update object', function(done) {
    const objects = this.db.store('objects');


    waterfall([
      function(fn) {
        objects.update('aKey', { a: 1 }, fn);
      },
      function(key, result, fn) {
        key.should.eql('aKey');
        result.should.eql({ a: 1 });
        objects.update('aKey', { b: 2 }, fn);
      },
      function(key, result, fn) {
        key.should.eql('aKey');
        result.should.eql({ a: 1, b: 2 });
        objects.get('aKey', fn);
      },
      function(result, fn) {
        result.should.eql({ a: 1, b: 2 });
        objects.remove('aKey', fn);
      },
      function(result, fn) {
        objects.count('aKey', fn);
      },
      function(count, fn) {
        count.should.eql(0);
        fn();
      }
    ], done);

  });

  it('must returned empty when not found', function(done) {
    const objects = this.db.store('objects');


    objects.get('oKey', function(err, o) {
      should.not.exist(o);
      done(err);
    });
  });

  it('must empty store on clear', function(done) {

    const buffers = this.db.store('buffers');

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
