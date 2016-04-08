'use strict';

const url = require('url');

function makeUrl(path) {
  return url.resolve('http://example.com:1234', path);
}

function toUrlObj(urlStr) {
  return url.parse(urlStr);
}

module.exports = {
  makeUrl,
  toUrlObj
};
