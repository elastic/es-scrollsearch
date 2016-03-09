'use strict';

module.exports = function responseBody(id) {
  return JSON.stringify({
    _scroll_id: id || '123',
    hits:{
      hits:[
        { _source: { foo: 'bar' } },
        { _source: { foo: 'notbar' } }
      ]
    }
  });
}
