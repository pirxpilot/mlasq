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
    put: noopCallback((id) => [id]),
    get: noopCallback(),
    update: noopCallback((id, item) => [id, item]),
    remove: noopCallback(),
    clear: noopCallback(),
    count: noopCallback(() => [0])
  };

  return self;
}

function noopCallback(processArgs = () => [ undefined ]) {
  return function(...myArgs) {
    const fn = myArgs.pop();
    if (typeof fn === 'function') {
      const callbackArgs = processArgs(...myArgs);
      fn(null, ...callbackArgs);
    }
  };
}
