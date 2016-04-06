'use strict';

const sinon = require('sinon');

/**
 * Mock https://www.npmjs.com/package/streamqueue
 */
module.exports = function streamqueue() {
  return {
    done: sinon.stub(),
    queue: sinon.stub()
  };
}
