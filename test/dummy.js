const { describe, it, after } = require('node:test');
const should = require('should');
const mlasq = require('../lib/dummy');

describe('dummy mlasq', async function () {
  const data = new Uint8Array([1, 2, 3, 4]).buffer;
  const db = mlasq('mlasq-test', ['buffers', 'objects']);

  after(function () {
    return db.remove();
  });

  await it('must store, count, remove, objects', async function () {
    const buffers = db.store('buffers');
    const key = await buffers.put('aKey', data);
    key.should.eql('aKey');

    let count = buffers.count('aKey');
    count.should.eql(0);

    const result = buffers.get('aKey');
    should.not.exist(result);
    await buffers.remove('aKey');
    count = await buffers.count('aKey');
    count.should.eql(0);
  });

  await it('must update object', async function () {
    const objects = db.store('objects');

    let [key, result] = await objects.update('aKey', { a: 1 });
    key.should.eql('aKey');
    result.should.eql({ a: 1 });
    [key, result] = objects.update('aKey', { b: 2 });
    key.should.eql('aKey');
    result.should.eql({ b: 2 });
  });

  await it('must returned empty when not found', function (_, done) {
    const objects = db.store('objects');

    objects.get('oKey', function (err, o) {
      should.not.exist(o);
      done(err);
    });
  });

  await it('must empty store on clear', async function () {
    const buffers = db.store('buffers');

    await buffers.put('aKey', data);
    await buffers.put('bKey', data);
    await buffers.clear();
    const acount = await buffers.count('aKey');
    acount.should.eql(0);
    const bcount = await buffers.count('bKey');
    bcount.should.eql(0);
  });
});
