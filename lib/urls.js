'use strict';

const url = require('url');

function getInitialUrl(urlObj) {
  return url.format(urlObj);
}

function getSubsequentUrl(urlObj) {
  return url.resolve(urlObj, '/_search/scroll');
}

function parseUrl(urlStr) {
  const urlObj = url.parse(urlStr, true);
  urlObj.search = null; // we want to use .query internally
  urlObj.hash = null; // we definitely do not need or want a hash fragment
  return urlObj;
}

module.exports = {
  getInitialUrl,
  getSubsequentUrl,
  parseUrl
};
