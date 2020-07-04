[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][deps-image]][deps-url]
[![Dev Dependency Status][deps-dev-image]][deps-dev-url]

# mlasq

Yet another indexedDB facade. Supports callbacks and promises API.

## Install

```sh
$ npm install --save mlasq
```

## Usage

With callbacks:

```js
const mlasq = require('mlasq');


// create database and storage

const db = mlasq('My DB', [ 'horses', 'cats' ]);

// put, get, count, remove etc.
const cats = db.store('cats');

cats.put('burek', {
  name: 'burek',
  age: 3
}, function(err, key) {
  assert.equal(key, 'burek');
  // 'burek' now in DB
});

// close and remove db
db.close(function(err) {
  console.log('closed now');
});
db.remove(function(err) {
  console.log('all stores removed now');
});

```


With promises:

```js
const mlasq = require('mlasq');


// create database and storage

async function doSometing() {
  const db = mlasq('My DB', [ 'horses', 'cats' ]);

  // put, get, count, remove etc.
  const cats = db.store('cats');

  const key = await cats.put('burek', {
    name: 'burek',
    age: 3
  });

  assert.equal(key, 'burek');

  // close and remove db
  await db.close();
  console.log('closed now');
  await db.remove();
  console.log('all stores removed now');  
}

```



## API

For all methods `fn` callback is optional. If `fn` is not provided `Promise` is returned that resolves to the result.

These are the object store methods:

### `put(key, item, fn)`

Puts `item` under the `key`. Returns the `key`.

### `get(key, fn)`

Retrieves `item` identified by `key`.

### `getAll(fn)`

Retrieves all items in the store.

### `getAllKeys(fn)`

Retrieves all keys in the store.

### `update(key, item, fn)`

Upserts item: if item identified by `key` already exists it is merged (using `Onject.assign`) with the passed `item`.
Returns the `key` *and* the updated value of the item.

### `remove(key, fn)`

Removes item identified by the `key`.

### `count(key, fn)`

Counts number of items in store.

### `clear(fn)`

Clears the store: removes all the items.

## License

MIT © [Damian Krzeminski](https://furkot.com)

[npm-image]: https://img.shields.io/npm/v/mlasq.svg
[npm-url]: https://npmjs.org/package/mlasq

[travis-url]: https://travis-ci.org/pirxpilot/mlasq
[travis-image]: https://img.shields.io/travis/pirxpilot/mlasq.svg

[deps-image]: https://img.shields.io/david/pirxpilot/mlasq.svg
[deps-url]: https://david-dm.org/pirxpilot/mlasq

[deps-dev-image]: https://img.shields.io/david/dev/pirxpilot/mlasq.svg
[deps-dev-url]: https://david-dm.org/pirxpilot/mlasq?type=dev
