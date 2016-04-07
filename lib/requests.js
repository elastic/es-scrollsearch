'use strict';

const request = require('request');

function makeRequest(url, body) {
  const json = true;
  return request.post({ body, json, url });
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
