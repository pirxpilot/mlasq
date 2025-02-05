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
    put: noopCallback(id => id),
    get: noopCallback(),
    update: noopCallback((id, item) => [id, item]),
    remove: noopCallback(),
    clear: noopCallback(),
    count: noopCallback(() => 0)
  };

  return self;
}

function noopCallback(processArgs = () => {}) {
  return function (...myArgs) {
    if (typeof myArgs.at(-1) !== 'function') {
      return processArgs(...myArgs);
    }
    const fn = myArgs.pop();
    const result = processArgs(...myArgs);
    return Array.isArray(result) ? fn(null, ...result) : fn(null, result);
  };
}
