'use strict';

module.exports = function responseBody(id, hits) {
  return JSON.stringify({
    _scroll_id: id || '123',
    hits:{
      hits: hits || [
        { foo: 'bar' },
        { foo: 'notbar' }
      ]
    }
  });
}
