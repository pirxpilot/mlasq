const once = require('run-first-only');
const waterfall = require('run-waterfall');

module.exports = database;

/* global indexedDB */

function database(name, stores, version = 1) {
  const open = once(fn => do_open(name, stores, version, fn));

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
    let p;
    if (!fn) {
      const { promise, callback } = promiseAndCallback();
      p = promise;
      fn = callback;
    }
    waterfall([
      open,
      operation
    ], fn);
    return p;
  }

  function close(fn) {
    return execute(do_close, fn);

    function do_close(db, fn) {
      db.close();
      fn();
    }
  }

  function remove(fn) {
    return close().then(() => {
      const request = indexedDB.deleteDatabase(name);
      return addHandlers(request, fn);
    });
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
    return db.execute(function(db, fn) {
      do_put(db, name, key, item, fn);
    }, fn);
  }

  function get(key, fn) {
    return db.execute(function(db, fn) {
      do_get(db, name, key, fn);
    }, fn);
  }

  function getAll(fn) {
    return db.execute(function(db, fn) {
      do_getAll(db, name, fn);
    }, fn);
  }

  function getAllKeys(fn) {
    return db.execute(function(db, fn) {
      do_getAllKeys(db, name, fn);
    }, fn);
  }

  function update(key, item, fn) {
    return db.execute(function(db, fn) {
      do_update(db, name, key, item, fn);
    }, fn);
  }

  function count(key, fn) {
    return db.execute(function(db, fn) {
      do_count(db, name, key, fn);
    }, fn);
  }

  function remove(key, fn) {
    return db.execute(function(db, fn) {
      do_delete(db, name, key, fn);
    }, fn);
  }

  function clear(fn) {
    return db.execute(function(db, fn) {
      do_clear(db, name, fn);
    }, fn);
  }

  return self;
}

function do_open(name, stores, version, fn) {
  const request = indexedDB.open(name, version);

  request.onupgradeneeded = function() {
    const db = request.result;

    const existing = new Set(db.objectStoreNames);
    const desired = new Set(stores);

    existing.forEach(function(store) {
      if (!desired.has(store)) {
        db.deleteObjectStore(store);
      }
    });

    desired.forEach(function(store) {
      if (!existing.has(store)) {
        db.createObjectStore(store);
      }
    });
  };

  return addHandlers(request, fn);
}

function do_put(db, store, key, item, fn) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .put(item, key);

  return addHandlers(request, fn);
}

function do_get(db, store, key, fn) {
  const request = db.transaction(store)
    .objectStore(store)
    .get(key);

  return addHandlers(request, fn);
}

function do_getAll(db, store, fn) {
  const request = db.transaction(store)
    .objectStore(store)
    .getAll();

  return addHandlers(request, fn);
}

function do_getAllKeys(db, store, fn) {
  const request = db.transaction(store)
    .objectStore(store)
    .getAllKeys();

  return addHandlers(request, fn);
}

function do_update(db, store, key, item, fn) {
  const s = db.transaction(store, 'readwrite')
    .objectStore(store);

  const getRequest = s.get(key);
  let updated;

  return addHandlers(getRequest)
    .then(result => {
      updated = result ? Object.assign(result, item) : item;
      const putRequest = s.put(updated, key);
      return addHandlers(putRequest);
    })
    .then(key => fn(null, key, updated))
    .catch(fn);
}

function do_count(db, store, key, fn) {
  const request = db.transaction(store)
    .objectStore(store)
    .count(key);

  return addHandlers(request, fn);
}

function do_delete(db, store, key, fn) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .delete(key);

  return addHandlers(request, fn);
}

function do_clear(db, store, fn) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .clear();

  return addHandlers(request, fn);
}

function addHandlers(request, fn) {
  if (fn) {
    request.onerror = ({ target }) => fn(target.error);
    request.onsuccess = ({ target }) => fn(null, target.result);
  } else {
    return promise(request);
  }
}

function promise(request) {
  return new Promise(function(resolve, reject) {
    request.onerror = function(e) {
      reject(e.target.error);
    };
    request.onsuccess = function(e) {
      resolve(e.target.result);
    };
  });
}

function promiseAndCallback() {
  let resolve, reject;

  const promise = new Promise((f, r) => {
    resolve = f;
    reject = r;
  });

  function callback(err, ...args) {
    if (err) {
      reject(err);
    } else {
      const result = args.length < 2 ? args[0] : args;
      resolve(result);
    }
  }

  return { promise, callback };
}
