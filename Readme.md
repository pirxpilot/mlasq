[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][deps-image]][deps-url]
[![Dev Dependency Status][deps-dev-image]][deps-dev-url]

# mlasq

Yet another indexedDB facade.
Uses node async callbacks conventsion. Best used with async, run-waterfall etc.

## Install

```sh
$ npm install --save mlasq
```

## Usage

```js
var mlasq = require('mlasq');


// create database and storage

var db = mlasq('My DB', [ 'horses', 'cats' ]);

// put, get, count, remove etc.
var cats = db.store('cats');

cats.put('burek', {
  'name': 'burek',
  'age': 3
}, function() {
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

