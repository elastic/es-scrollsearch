'use strict';

const createHitStream = require('./hit-stream');

const requests = require('./requests');
const makeRequest = requests.makeRequest;
const nextRequestFn = requests.nextRequestFn;

const urls = require('./urls');
const getInitialUrl = urls.getInitialUrl;
const getSubsequentUrl = urls.getSubsequentUrl;
const parseUrl = urls.parseUrl;

module.exports = function search(url, params) {
  params || (params = {});

  const urlObj = parseUrl(url);
  urlObj.query.scroll || (urlObj.query.scroll = '30s');

  const body = Object.assign({ sort: ['_doc'] }, params);

  const search = () => makeRequest(getInitialUrl(urlObj), body);
  const scroll = nextRequestFn(getSubsequentUrl(urlObj), urlObj.query.scroll);

  const retrieve = createRetrieve(search, scroll);

  return createHitStream(retrieve);
}

function createRetrieve(search, scroll) {
  return (id) => {
    return id ? scroll(id) : search();
  };
}
