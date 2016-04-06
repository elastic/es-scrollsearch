'use strict';

/**
 * Adds the given stream to the queue, and when that stream ends, add the next
 * stream to the queue. When no more streams remain, mark the queue as done.
 *
 * @param {ReadableStream} stream - A stream to chain on the queue
 * @param {Function} next - Returns the next stream to queue
 * @param {StreamQueue} queue - The queue to modify
 */
module.exports = function queueAndContinue(stream, next, queue) {
  stream.on('end', () => {
    const nextStream = next();
    if (nextStream) {
      queueAndContinue(nextStream, next, queue);
    } else {
      queue.done();
    }
  });

  queue.queue(stream);
}
