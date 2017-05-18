// empty implementation for browsers that do not support indexedDB

module.exports = database;

function database() {
  var self = {
    store: store,
    close: noopCallback(),
    remove: noopCallback()
  };

  return self;
}


function store() {
  var self = {
    put: noopCallback(null, undefined),
    get: noopCallback(null, undefined),
    remove: noopCallback(null, undefined),
    count: noopCallback(null, 0)
  };

  return self;
}

function noopCallback() {
  var args = [].slice.call(arguments);
  return function() {
    var fn = arguments[arguments.length - 1];
    if (typeof fn === 'function') {
      fn.apply(null, args);
    }
  };
}

