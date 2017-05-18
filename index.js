var mlasq = require('./lib/mlasq');
var dummy = require('./lib/dummy');

/* global window */

module.exports = detect() ? mlasq : dummy;

function detect() {
  return ('indexedDB' in window) && !('_mlasq_old_browser' in window);
}
