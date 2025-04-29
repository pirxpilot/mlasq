import 'fake-indexeddb/auto';

import test from 'node:test';
import database from '../index.js';
import mlasq from '../lib/mlasq.js';

test('mlasq', async t => {
  const data = new Uint8Array([1, 2, 3, 4]).buffer;
  const db = mlasq('mlasq-promise-test', ['buffers', 'objects']);

  t.after(() => db.remove());

  await t.test('must store, count, remove, objects', async t => {
    const buffers = db.store('buffers');

    await buffers.put('aKey', data);

    let count = await buffers.count('aKey');
    t.assert.equal(count, 1);

    const result = await buffers.get('aKey');
    t.assert.deepEqual(result, data);

    await buffers.remove('aKey');
    count = await buffers.count('aKey');
    t.assert.equal(count, 0);
  });

  await t.test('must get all stored keys', async t => {
    const buffers = db.store('buffers');

    await Promise.all([
      buffers.put('aKey', data),
      buffers.put('bKey', data),
      buffers.put('cKey', data)
    ]);

    const result = await buffers.getAllKeys();
    t.assert.deepEqual(result, ['aKey', 'bKey', 'cKey']);
  });

  await t.test('must get all stored objects', async t => {
    const objects = db.store('objects');

    await Promise.all([
      objects.put('aKey', { a: 1 }),
      objects.put('bKey', { b: 2 }),
      objects.put('cKey', { c: 3 })
    ]);

    const result = await objects.getAll();
    t.assert.deepEqual(result, [{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  await t.test('must update object', async t => {
    const objects = db.store('objects');

    let [key, result] = await objects.update('aKey', { a: 1 });

    t.assert.equal(key, 'aKey');
    t.assert.deepEqual(result, { a: 1 });

    [key, result] = await objects.update('aKey', { b: 2 });

    t.assert.equal(key, 'aKey');
    t.assert.deepEqual(result, { a: 1, b: 2 });

    result = await objects.get('aKey');
    t.assert.deepEqual(result, { a: 1, b: 2 });

    await objects.remove('aKey');

    const count = await objects.count('aKey');
    t.assert.equal(count, 0);
  });

  await t.test('must returned empty when not found', async t => {
    const objects = db.store('objects');
    const o = await objects.get('oKey');
    t.assert.ok(!o);
  });

  await t.test('must empty store on clear', async t => {
    const buffers = db.store('buffers');

    await Promise.all([buffers.put('aKey', data), buffers.put('bKey', data)]);

    await buffers.clear();

    let count = await buffers.count('aKey');
    t.assert.equal(count, 0);

    count = await buffers.count('bKey');
    t.assert.equal(count, 0);
  });

  await t.test('upgrade', async t => {
    const db1 = mlasq('animals-p', ['horses', 'birds']);
    const db2 = mlasq('animals-p', ['horses', 'insects'], 2);

    t.after('remove db', () => db1.remove());

    await t.test('clean up stores', async t => {
      const horses1 = db1.store('horses');
      await horses1.put('1', { name: 'fast' });
      await db1.close();

      const horses2 = db2.store('horses');
      const count = await horses2.count('1');
      t.assert.equal(count, 1);
      await db2.close();
    });
  });
});

test('select implementation', async t => {
  let db;

  t.afterEach(async () => {
    await db.remove();
  });

  await t.test('select mlasq', async t => {
    db = database('test', ['cats']);
    const cats = db.store('cats');
    await cats.put('1', { name: 'fluffy' });
    const count = await cats.count('1');
    t.assert.equal(count, 1);
  });
});
