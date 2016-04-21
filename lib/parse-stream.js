'use strict';

const highland = require('highland');
const JSONStream = require('JSONStream');

const once = require('./once');

module.exports = function parseStream(stream, handleHit, handleScrollId, onError) {
  const hl = highland(stream).stopOnError(onError);

  observeHits(hl, handleHit, onError);
  observeScrollId(hl, handleScrollId, onError);

  return hl.pipe(extractHits()).on('error', onError);
}

function observeHits(stream, cb, onError) {
  const hits = stream
    .observe()
    .pipe(extractHits())
    .on('error', onError);

  return highland(hits).each(cb);
}

function observeScrollId(stream, cb, onError) {
  const ids = stream
    .observe()
    .pipe(extractScrollId())
    .on('error', onError);

  return highland(ids).each(once(cb));
}

function extractHits() {
  return JSONStream.parse('hits.hits.*');
}

function extractScrollId() {
  return JSONStream.parse('_scroll_id');
}
