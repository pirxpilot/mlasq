require('fake-indexeddb/auto');

const { describe, it, after } = require('node:test');
const should = require('should');
const waterfall = require('run-waterfall');
const mlasq = require('../lib/mlasq');

describe('mlasq callbacks', function () {
  const data = new Uint8Array([1, 2, 3, 4]).buffer;
  const db = mlasq('mlasq-callback-test', [
    'buffers',
    'objects'
  ]);

  after(function (done) {
    db.remove(done);
  });

  it('must store, count, remove, objects', function (_, done) {

    const buffers = db.store('buffers');

    waterfall([
      function (fn) {
        buffers.put('aKey', data, fn);
      },
      function (result, fn) {
        result.should.eql('aKey');
        buffers.count('aKey', fn);
      },
      function (count, fn) {
        count.should.eql(1);
        buffers.get('aKey', fn);
      },
      function (result, fn) {
        result.should.eql(data);
        buffers.remove('aKey', fn);
      },
      function (result, fn) {
        buffers.count('aKey', fn);
      },
      function (count, fn) {
        count.should.eql(0);
        fn();
      }
    ], done);
  });

  it('must get all stored keys', function (_, done) {

    const buffers = db.store('buffers');

    waterfall([
      function (fn) {
        buffers.put('aKey', data, fn);
      },
      function (result, fn) {
        buffers.put('bKey', data, fn);
      },
      function (result, fn) {
        buffers.put('cKey', data, fn);
      },
      function (result, fn) {
        buffers.getAllKeys(fn);
      },
      function (result, fn) {
        result.should.eql(['aKey', 'bKey', 'cKey']);
        fn();
      }
    ], done);

  });

  it('must get all stored objects', function (_, done) {

    const objects = db.store('objects');

    waterfall([
      function (fn) {
        objects.put('aKey', { a: 1 }, fn);
      },
      function (result, fn) {
        objects.put('bKey', { b: 2 }, fn);
      },
      function (result, fn) {
        objects.put('cKey', { c: 3 }, fn);
      },
      function (result, fn) {
        objects.getAll(fn);
      },
      function (result, fn) {
        result.should.eql([{ a: 1 }, { b: 2 }, { c: 3 }]);
        fn();
      }
    ], done);

  });

  it('must update object', function (_, done) {
    const objects = db.store('objects');

    waterfall([
      function (fn) {
        objects.update('aKey', { a: 1 }, fn);
      },
      function (key, result, fn) {
        key.should.eql('aKey');
        result.should.eql({ a: 1 });
        objects.update('aKey', { b: 2 }, fn);
      },
      function (key, result, fn) {
        key.should.eql('aKey');
        result.should.eql({ a: 1, b: 2 });
        objects.get('aKey', fn);
      },
      function (result, fn) {
        result.should.eql({ a: 1, b: 2 });
        objects.remove('aKey', fn);
      },
      function (result, fn) {
        objects.count('aKey', fn);
      },
      function (count, fn) {
        count.should.eql(0);
        fn();
      }
    ], done);

  });

  it('must returned empty when not found', function (_, done) {
    const objects = db.store('objects');


    objects.get('oKey', function (err, o) {
      should.not.exist(o);
      done(err);
    });
  });

  it('must empty store on clear', function (_, done) {

    const buffers = db.store('buffers');

    waterfall([
      function (fn) {
        buffers.put('aKey', data, fn);
      },
      function (result, fn) {
        buffers.put('bKey', data, fn);
      },
      function (result, fn) {
        buffers.clear(fn);
      },
      function (result, fn) {
        buffers.count('aKey', fn);
      },
      function (count, fn) {
        count.should.eql(0);
        buffers.count('bKey', fn);
      },
      function (count, fn) {
        count.should.eql(0);
        fn();
      }
    ], done);
  });


  describe('upgrade', function () {
    const db1 = mlasq('animals', [
      'horses',
      'birds'
    ]);
    const horses1 = db1.store('horses');

    const db2 = mlasq('animals', [
      'horses',
      'insects'
    ], 2);
    const horses2 = db2.store('horses');

    after('remove db', function (_, done) {
      db2.remove(done);
    });

    it('clean up stores', function (_, done) {
      waterfall([
        function (fn) {
          horses1.put('1', { name: 'fast' }, fn);
        },
        function (result, fn) {
          db1.close(fn);
        },
        function (fn) {
          horses2.count('1', fn);
        },
        function (count, fn) {
          count.should.eql(1);
          db2.close(fn);
        }
      ], done);
    });
  });
});


describe('mlasq promises', async function () {
  const data = new Uint8Array([1, 2, 3, 4]).buffer;
  const db = mlasq('mlasq-promise-test', [
    'buffers',
    'objects'
  ]);

  after(function () {
    return db.remove();
  });

  await it('must store, count, remove, objects', async function () {

    const buffers = db.store('buffers');

    await buffers.put('aKey', data);

    let count = await buffers.count('aKey');
    count.should.eql(1);

    let result = await buffers.get('aKey');
    result.should.eql(data);

    await buffers.remove('aKey');
    count = await buffers.count('aKey');
    count.should.eql(0);
  });

  await it('must get all stored keys', async function () {

    const buffers = db.store('buffers');

    await Promise.all([
      buffers.put('aKey', data),
      buffers.put('bKey', data),
      buffers.put('cKey', data)
    ]);

    const result = await buffers.getAllKeys();
    result.should.eql(['aKey', 'bKey', 'cKey']);
  });

  await it('must get all stored objects', async function () {

    const objects = db.store('objects');

    await Promise.all([
      objects.put('aKey', { a: 1 }),
      objects.put('bKey', { b: 2 }),
      objects.put('cKey', { c: 3 })
    ]);

    const result = await objects.getAll();
    result.should.eql([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  await it('must update object', async function () {
    const objects = db.store('objects');

    let [key, result] = await objects.update('aKey', { a: 1 });

    key.should.eql('aKey');
    result.should.eql({ a: 1 });

    [key, result] = await objects.update('aKey', { b: 2 });

    key.should.eql('aKey');
    result.should.eql({ a: 1, b: 2 });

    result = await objects.get('aKey');
    result.should.eql({ a: 1, b: 2 });

    await objects.remove('aKey');

    const count = await objects.count('aKey');
    count.should.eql(0);
  });

  await it('must returned empty when not found', async function () {
    const objects = db.store('objects');
    const o = await objects.get('oKey');
    should.not.exist(o);
  });

  await it('must empty store on clear', async function () {
    const buffers = db.store('buffers');

    await Promise.all([
      buffers.put('aKey', data),
      buffers.put('bKey', data)
    ]);

    await buffers.clear();

    let count = await buffers.count('aKey');
    count.should.eql(0);

    count = await buffers.count('bKey');
    count.should.eql(0);
  });

  await describe('upgrade', async function () {
    const db1 = mlasq('animals-p', [
      'horses',
      'birds'
    ]);
    const db2 = mlasq('animals-p', [
      'horses',
      'insects'
    ], 2);

    after('remove db', () => db1.remove());

    await it('clean up stores', async function () {
      const horses1 = db1.store('horses');
      await horses1.put('1', { name: 'fast' });
      await db1.close();

      const horses2 = db2.store('horses');
      const count = await horses2.count('1');
      count.should.eql(1);
      await db2.close();
    });
  });
});
