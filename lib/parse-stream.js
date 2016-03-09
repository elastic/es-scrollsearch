'use strict';

const highland = require('highland');
const JSONStream = require('JSONStream');

/**
 * Parses a stream of scrolling search results into a single readable stream
 * that emits events whenever a new scroll id or hit is parsed.
 *
 * The given stream should be the equivalent of json response bodies from the
 * Elasticsearch search/scroll api.
 *
 * The "next_id" event is emitted whenever a scroll id is encountered.
 *
 * The "hit" event is emitted whenever a hit is encountered. This event is
 * nearly identical to the standard "data" event, but unlike "data",
 * registering a listener on the "hit" event does not drain the stream.
 *
 * @param {ReadableStream} stream - A search/scroll stream to parse
 * @returns {object} A ReadableStream with custom events: next_id hit
 */
module.exports = function parseStream(stream) {
  const hl = highland(stream);

  const id = highland(idStream(hl));
  const hits = highland(hitStream(hl));

  id.each(id => hits.emit('next_id', id));
  hits.observe().each(hit => hits.emit('hit', hit));

  return hits;
};

function extractHits() {
  return JSONStream.parse('hits.hits.*._source'); // todo: what to do if _source is not stored?
}

function extractScrollId() {
  return JSONStream.parse('_scroll_id');
}

function hitStream(stream) {
  return stream.pipe(extractHits());
}

function idStream(stream) {
  return stream.observe().pipe(extractScrollId());
}
