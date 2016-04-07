'use strict';

const requests = require('./requests');
const makeRequest = requests.makeRequest;
const nextRequestFn = requests.nextRequestFn;

const urls = require('./urls');
const assertValidUrlObj = urls.assertValidUrlObj;
const getInitialUrl = urls.getInitialUrl;
const getSubsequentUrl = urls.getSubsequentUrl;
const parseUrl = urls.parseUrl;

const scrollStreams = require('./scroll-streams');

const DEFAULT_SCROLL = '30s';

/**
 * Makes consecutive requests to the elasticsearch scroll search api
 * and returns all hits as a single stream.
 *
 * @param {object} url - The fully qualified search url
 * @param {object} params - Search request body parameters
 * @returns {ReadableStream} A stream of hits
 */
module.exports = function streamHits(url, params) {
  params || (params = {});

  const urlObj = parseUrl(url);
  urlObj.query.scroll || (urlObj.query.scroll = DEFAULT_SCROLL);

  const body = Object.assign({ sort: ['_doc'] }, params);

  const initial = makeRequest(getInitialUrl(urlObj), body);
  const getNext = nextRequestFn(getSubsequentUrl(urlObj), urlObj.query.scroll);
  return scrollStreams(initial, getNext);
}
