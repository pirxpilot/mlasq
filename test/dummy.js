import test from 'node:test';
import database from '../index.js';
import mlasq from '../lib/dummy.js';

test('dummy mlasq', async t => {
  const data = new Uint8Array([1, 2, 3, 4]).buffer;
  const db = mlasq('mlasq-test', ['buffers', 'objects']);

  t.after(() => db.remove());

  await t.test('must store, count, remove, objects', async t => {
    const buffers = db.store('buffers');
    const key = await buffers.put('aKey', data);
    t.assert.equal(key, 'aKey');

    let count = await buffers.count('aKey');
    t.assert.equal(count, 0);

    const result = await buffers.get('aKey');
    t.assert.ok(!result);
    await buffers.remove('aKey');
    count = await buffers.count('aKey');
    t.assert.equal(count, 0);
  });

  await t.test('must update object', async t => {
    const objects = db.store('objects');

    let [key, result] = await objects.update('aKey', { a: 1 });
    t.assert.equal(key, 'aKey');
    t.assert.deepEqual(result, { a: 1 });
    [key, result] = await objects.update('aKey', { b: 2 });
    t.assert.equal(key, 'aKey');
    t.assert.deepEqual(result, { b: 2 });
  });

  await t.test('must returned empty when not found', async t => {
    const objects = db.store('objects');

    const o = await objects.get('oKey');
    t.assert.ok(!o);
  });

  await t.test('must empty store on clear', async t => {
    const buffers = db.store('buffers');

    await buffers.put('aKey', data);
    await buffers.put('bKey', data);
    await buffers.clear();
    const acount = await buffers.count('aKey');
    t.assert.equal(acount, 0);
    const bcount = await buffers.count('bKey');
    t.assert.equal(bcount, 0);
  });
});

test('select implementation', async t => {
  let db;

  t.afterEach(async () => {
    await db.remove();
  });

  await t.test('select dummy', async t => {
    globalThis._mlasq_old_browser = true;
    db = database('test', ['cats']);
    const cats = db.store('cats');
    await cats.put('1', { name: 'fluffy' });
    const count = await cats.count('1');
    t.assert.equal(count, 0);
  });
});
