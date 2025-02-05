[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# mlasq

Yet another indexedDB facade. Supports callbacks and promises API.

## Install

```sh
$ npm install --save mlasq
```

## Usage

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

All methods are asyn - that is a `Promise` is returned that resolves to the result.

These are the object store methods:

### `put(key, item)`

Puts `item` under the `key`. Returns the `key`.

### `get(key)`

Retrieves `item` identified by `key`.

### `getAll()`

Retrieves all items in the store.

### `getAllKeys()`

Retrieves all keys in the store.

### `update(key, item)`

Upserts item: if item identified by `key` already exists it is merged (using `Onject.assign`) with the passed `item`.
Returns the `key` *and* the updated value of the item.

### `remove(key)`

Removes item identified by the `key`.

### `count(key)`

Counts number of items in store.

### `clear()`

Clears the store: removes all the items.

## License

MIT © [Damian Krzeminski](https://furkot.com)

[npm-image]: https://img.shields.io/npm/v/mlasq
[npm-url]: https://npmjs.org/package/mlasq

[build-url]: https://github.com/pirxpilot/mlasq/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/pirxpilot/mlasq/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/mlasq
[deps-url]: https://libraries.io/npm/mlasq
