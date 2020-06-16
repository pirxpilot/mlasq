const once = require('run-first-only');
const waterfall = require('run-waterfall');

module.exports = database;

/* global indexedDB */

function database(name, stores) {
  const open = once(fn => do_open(name, 1, stores, fn));

  const self = {
    store: getStore,
    execute,
    close,
    remove
  };

  function getStore(name) {
    return store(self, name);
  }

  function execute(operation, fn) {
    waterfall([
      open,
      operation
    ], fn);
  }

  function close(fn = noop) {
    execute(function(db, fn) {
      db.close();
      fn();
    }, fn);
  }

  function remove(fn) {
    close();
    const request = indexedDB.deleteDatabase(name);
    addHandlers(request, fn);
  }

  return self;
}

function store(db, name) {
  const self = {
    put,
    get,
    getAll,
    getAllKeys,
    update,
    remove,
    count,
    clear
  };

  function put(key, item, fn) {
    db.execute(function(db, fn) {
      do_put(db, name, key, item, fn);
    }, fn);
  }

  function get(key, fn) {
    db.execute(function(db, fn) {
      do_get(db, name, key, fn);
    }, fn);
  }

  function getAll(fn) {
    db.execute(function(db, fn) {
      do_getAll(db, name, fn);
    }, fn);
  }

  function getAllKeys(fn) {
    db.execute(function(db, fn) {
      do_getAllKeys(db, name, fn);
    }, fn);
  }

  function update(key, item, fn) {
    db.execute(function(db, fn) {
      do_update(db, name, key, item, fn);
    }, fn);
  }

  function count(key, fn) {
    db.execute(function(db, fn) {
      do_count(db, name, key, fn);
    }, fn);
  }

  function remove(key, fn) {
    db.execute(function(db, fn) {
      do_delete(db, name, key, fn);
    }, fn);
  }

  function clear(fn) {
    db.execute(function(db, fn) {
      do_clear(db, name, fn);
    }, fn);
  }

  return self;
}

function do_open(name, version, stores, fn) {
  const request = indexedDB.open(name, version);

  request.onupgradeneeded = function() {
    const db = request.result;
    stores.forEach(store => db.createObjectStore(store));
  };

  addHandlers(request, fn);
}

function do_put(db, store, key, item, fn) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .put(item, key);

  addHandlers(request, fn);
}

function do_get(db, store, key, fn) {
  const request = db.transaction(store)
    .objectStore(store)
    .get(key);

  addHandlers(request, fn);
}

function do_getAll(db, store, fn) {
  const request = db.transaction(store)
    .objectStore(store)
    .getAll();

  addHandlers(request, fn);
}

function do_getAllKeys(db, store, fn) {
  const request = db.transaction(store)
    .objectStore(store)
    .getAllKeys();

  addHandlers(request, fn);
}

function do_update(db, store, key, item, fn) {
  const s = db.transaction(store, 'readwrite')
    .objectStore(store);

  const getRequest = s.get(key);
  getRequest.onerror = ({ target }) => fn(target.error);
  getRequest.onsuccess = onget;

  function onget({ target: { result } }) {
    const updated = result ? Object.assign(result, item) : item;
    const putRequest = s.put(updated, key);
    addHandlers(putRequest, err => fn(err, key, updated));
  }
}

function do_count(db, store, key, fn) {
  const request = db.transaction(store)
    .objectStore(store)
    .count(key);

  addHandlers(request, fn);
}

function do_delete(db, store, key, fn) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .delete(key);

  addHandlers(request, fn);
}

function do_clear(db, store, fn) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .clear();

  addHandlers(request, fn);
}

function addHandlers(request, fn) {
  request.onerror = ({ target }) => fn(target.error);
  request.onsuccess = ({ target }) => fn(null, target.result);
}

function noop() {}
