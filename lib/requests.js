'use strict';

const request = require('request');

function makeRequest(url, params, customHeaders) {
  const body = JSON.stringify(params);
  const headers = createHeaders(customHeaders);
  return request.post({ body, headers, url });
}

function nextRequestFn(url, scroll, customHeaders) {
  return scroll_id => {
    const headers = createHeaders(customHeaders);
    return makeRequest(url, { scroll, scroll_id }, headers);
  };
}

function createHeaders(headers) {
  const defaults = {
    'content-type': 'application/json'
  };
  return Object.assign({}, defaults, headers);
}

module.exports = {
  makeRequest,
  nextRequestFn
};
