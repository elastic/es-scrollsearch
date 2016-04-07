'use strict';

const url = require('url');

function assertValidUrlObj(urlObj) {
  if (urlObj.search || urlObj.query) throw new Error(
    'Url cannot include a query string (e.g. ?foo=bar)'
  );
  if (urlObj.hash) throw new Error(
    'Url cannot include a hash fragment (e.g. #foo)'
  );
}

function getInitialUrl(urlObj) {
  const baseUrl = url.format(urlObj);
  return url.resolve(baseUrl, `${urlObj.pathname}/_search/scroll`);
}

function getSubsequentUrl(urlObj) {
  const baseUrl = url.format(urlObj);
  return url.resolve(baseUrl, '/_search/scroll');
}

module.exports = {
  assertValidUrlObj,
  getInitialUrl,
  getSubsequentUrl
};
