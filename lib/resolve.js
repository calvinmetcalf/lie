'use strict';

var Promise = require('./promise');
var INTERNAL = require('./INTERNAL');

module.exports = resolve;

function internalResolve(value) {
	var promise = new Promise(INTERNAL);
	return promise.resolve(value);
}

var TRUE = new internalResolve(true);
var FALSE = new internalResolve(false);
var NULL = new internalResolve(null);
var UNDEFINED = new internalResolve(void 0);
var ZERO = new internalResolve(0);
var EMPTYSTRING = new internalResolve('');

function resolve(value) {
  var valueType = typeof value;
  switch (valueType) {
    case 'boolean':
      if (value) {
        return TRUE;
      }
      return FALSE;
    case 'undefined':
      return UNDEFINED;
    case 'object':
      if (value === null) {
        return NULL;
      }
      break;
    case 'number':
      if (!value) {
        return ZERO;
      }
      break;
    case 'string':
      if (!value) {
        return EMPTYSTRING;
      }
      break;
  }
  return internalResolve(value);
}