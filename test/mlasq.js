require('fake-indexeddb/auto');

const { describe, it, after } = require('node:test');
const should = require('should');
const mlasq = require('../lib/mlasq');

describe('mlasq', async function () {
  const data = new Uint8Array([1, 2, 3, 4]).buffer;
  const db = mlasq('mlasq-promise-test', ['buffers', 'objects']);

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

    await Promise.all([buffers.put('aKey', data), buffers.put('bKey', data)]);

    await buffers.clear();

    let count = await buffers.count('aKey');
    count.should.eql(0);

    count = await buffers.count('bKey');
    count.should.eql(0);
  });

  await describe('upgrade', async function () {
    const db1 = mlasq('animals-p', ['horses', 'birds']);
    const db2 = mlasq('animals-p', ['horses', 'insects'], 2);

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
