import dummy from './lib/dummy.js';
import mlasq from './lib/mlasq.js';

const database = detect() ? mlasq : dummy;
export default database;

function detect() {
  return (
    typeof globalThis !== 'undefined' &&
    'indexedDB' in globalThis &&
    !('_mlasq_old_browser' in globalThis)
  );
}
