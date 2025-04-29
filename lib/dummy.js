// empty implementation for browsers that do not support indexedDB

export default function database() {
  return {
    store,
    close: noop,
    remove: noop
  };
}

function store() {
  return {
    put: async id => id,
    get: noop,
    getAll: async () => [],
    getAllKeys: async () => [],
    update: async (id, item) => [id, item],
    remove: noop,
    clear: noop,
    count: async () => 0
  };
}

async function noop() {}
