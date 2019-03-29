// empty implementation for browsers that do not support indexedDB

module.exports = database;

function database() {
  const self = {
    store,
    close: noopCallback(),
    remove: noopCallback()
  };

  return self;
}


function store() {
  const self = {
    put: noopCallback(null, undefined),
    get: noopCallback(null, undefined),
    remove: noopCallback(null, undefined),
    clear: noopCallback(null, undefined),
    count: noopCallback(null, 0)
  };

  return self;
}

function noopCallback(...args) {
  return function() {
    const fn = arguments[arguments.length - 1];
    if (typeof fn === 'function') {
      fn(...args);
    }
  };
}
