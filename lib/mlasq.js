module.exports = database;

/* global indexedDB */

function database(name, stores, version = 1) {
  let dbFuture;

  const self = {
    store: getStore,
    execute,
    close,
    remove
  };

  return self;

  function getStore(name) {
    return store(self, name);
  }

  async function execute(operation) {
    if (!dbFuture) {
      dbFuture = do_open(name, stores, version);
    }
    return operation(await dbFuture);
  }

  async function close() {
    if (dbFuture) {
      const db = await dbFuture;
      db.close();
      dbFuture = undefined;
    }
  }

  async function remove() {
    await close();
    const request = indexedDB.deleteDatabase(name);
    await addHandlers(request);
  }
}

function store(db, name) {
  return {
    put,
    get,
    getAll,
    getAllKeys,
    update,
    remove,
    count,
    clear
  };

  function put(key, item) {
    return db.execute(db => do_put(db, name, key, item));
  }

  function get(key) {
    return db.execute(db => do_get(db, name, key));
  }

  function getAll() {
    return db.execute(db => do_getAll(db, name));
  }

  function getAllKeys() {
    return db.execute(db => do_getAllKeys(db, name));
  }

  function update(key, item) {
    return db.execute(db => do_update(db, name, key, item));
  }

  function count(key) {
    return db.execute(db => do_count(db, name, key));
  }

  function remove(key) {
    return db.execute(db => do_delete(db, name, key));
  }

  function clear() {
    return db.execute(db => do_clear(db, name));
  }
}

function do_open(name, stores, version) {
  const request = indexedDB.open(name, version);

  request.onupgradeneeded = ({ target }) => {
    const db = target.result;

    const existing = new Set(db.objectStoreNames);
    const desired = new Set(stores);

    existing.forEach(store => {
      if (!desired.has(store)) {
        db.deleteObjectStore(store);
      }
    });

    desired.forEach(store => {
      if (!existing.has(store)) {
        db.createObjectStore(store);
      }
    });
  };

  return addHandlers(request);
}

function do_put(db, store, key, item) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .put(item, key);

  return addHandlers(request);
}

function do_get(db, store, key) {
  const request = db.transaction(store)
    .objectStore(store)
    .get(key);

  return addHandlers(request);
}

function do_getAll(db, store) {
  const request = db.transaction(store)
    .objectStore(store)
    .getAll();

  return addHandlers(request);
}

function do_getAllKeys(db, store) {
  const request = db.transaction(store)
    .objectStore(store)
    .getAllKeys();

  return addHandlers(request);
}

async function do_update(db, store, key, item) {
  const s = db.transaction(store, 'readwrite')
    .objectStore(store);

  const getRequest = s.get(key);
  const result = await addHandlers(getRequest);
  const updated = result ? Object.assign(result, item) : item;
  const putRequest = s.put(updated, key);
  key = await addHandlers(putRequest);

  return [key, updated];
}

function do_count(db, store, key) {
  const request = db.transaction(store)
    .objectStore(store)
    .count(key);

  return addHandlers(request);
}

function do_delete(db, store, key) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .delete(key);

  return addHandlers(request);
}

function do_clear(db, store) {
  const request = db.transaction(store, 'readwrite')
    .objectStore(store)
    .clear();

  return addHandlers(request);
}

function addHandlers(request) {
  return new Promise((resolve, reject) => {
    request.onerror = e => reject(e.target.error);
    request.onsuccess = e => resolve(e.target.result);
  });
}
