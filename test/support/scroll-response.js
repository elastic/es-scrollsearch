'use strict';

const uuid = require('node-uuid');

module.exports = function scrollResponse(hits) {
  return {
    _scroll_id: uuid.v4(),
    hits: {
      hits: hits.map(hit => ({ _source: hit }))
    }
  };
}
