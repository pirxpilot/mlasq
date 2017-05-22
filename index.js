var mlasq = require('./lib/mlasq');
var dummy = require('./lib/dummy');

/* global self */

module.exports = detect() ? mlasq : dummy;

function detect() {
  return typeof self !== 'undefined' && ('indexedDB' in self) && !('_mlasq_old_browser' in self);
}
