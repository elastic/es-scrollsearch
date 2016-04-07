'use strict';

const streamqueue = require('streamqueue');

const parseStream = require('./parse-stream');
const nextStream = require('./next-stream');
const queueAndContinue = require('./queue-and-continue');

/**
 * Strings multiple consecutive hit streams together into a single stream of
 * hits.
 *
 * @param {ReadableStream} stream - An initial stream
 * @param {Function} next - Returns the next stream given a scroll id
 * @returns {ReadableStream} A stream of hits
 */
module.exports = function scrollStreams(stream, next) {
  const main = streamqueue();
  const scrollHits = parseStream(main);
  const onDeck = nextStream(next);

  scrollHits.on('next_id', id => onDeck.setId(id));
  scrollHits.on('hit', () => onDeck.increment());

  queueAndContinue(stream, () => onDeck.next(), main);

  return scrollHits;
}
