'use strict';

const PassThrough = require('stream').PassThrough;

module.exports = function createQueue() {
  let through;
  const functions = [];
  const maps = [];

  const chainStreams = () => {
    if (functions.length > 0) {
      const nextFn = functions.shift();
      // is nextFn() ever actually ended? What about after mapped?
      const stream = maps.reduce((stream, fn) => fn(stream), nextFn());
      stream.pipe(through, { end: false });
      stream.on('end', chainStreams);
    } else {
      through.end();
    }
  };

  return {
    stream() {
      if (!through) {
        through = new PassThrough({ objectMode: true });
        chainStreams();
      }
      return through;
    },

    error(err) {
      through.emit('error', err);
    },

    enqueue(fn) {
      functions.push(fn);
    },

    lazyMap(fn) {
      maps.push(fn);
    }
  };
}
