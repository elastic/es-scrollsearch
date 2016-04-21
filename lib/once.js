'use strict';

module.exports = function once(fn) {
  let called = false;
  let returnValue;
  return function () {
    if (!called) {
      called = true;
      returnValue = fn.apply(null, arguments);
    }
    return returnValue;
  };
};
