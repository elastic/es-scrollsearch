'use strict';

const request = require('request');

function makeRequest(url, params) {
  const body = JSON.stringify(params);
  const headers = { 'content-type': 'application/json' };
  return request.post({ body, headers, url });
}

function nextRequestFn(url, scroll) {
  return scroll_id => {
    return makeRequest(url, { scroll, scroll_id });
  };
}

module.exports = {
  makeRequest,
  nextRequestFn
};
