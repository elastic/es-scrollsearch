'use strict';

const isFunction = require('lodash').isFunction;

/**
 * Returns an object that can be used to track whether we need to continue
 * scrolling based on whether there is a known scroll id at the same time as
 * there are known hits.
 *
 * @param {Function} next - Returns a hit stream when given an id
 * @returns {object}
 */
module.exports = function nextStream(next) {
  if (!isFunction(next)) throw new TypeError(
    'The first argument of nextStream() must be a function that returns a new stream'
  );

  let scrollId = undefined;
  let total = 0;

  function reset() {
    scrollId = undefined;
    total = 0;
  }

  return {
    next() {
      if (scrollId === undefined) throw new Error(
        'Cannot create next stream without first specifying a scroll id via setId()'
      );

      if (!total) {
        return null;
      }

      const id = scrollId;
      reset();
      return next(id);
    },

    setId(id) {
      scrollId = id;
    },

    increment() {
      total++;
    }
  };
}
