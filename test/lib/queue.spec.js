'use strict';

const PassThrough = require('stream').PassThrough;
const responseBody = require('../support/response-body');
const createQueue = require('../../lib/queue');

describe('createQueue()', () => {
  let queue;
  beforeEach(() => {
    queue = createQueue();
  });

  describe('#stream()', () => {
    it('returns a single stream combining all function streams', (done) => {
      const stream1 = new PassThrough({ objectMode: true });
      const stream2 = new PassThrough({ objectMode: true });
      queue.enqueue(() => stream1);
      queue.enqueue(() => stream2);

      const data = [];
      queue.stream()
        .on('data', (datum) => data.push(datum))
        .on('end', () => {
          expect(data).to.deep.equal([
            { foo: 'bar' }, { no: 'wai' }
          ]);
          done();
        });

      stream1.end({foo:'bar'});
      stream2.end({no:'wai'});
    });

    it('returns the same stream on subsequent calls', () => {
      expect(queue.stream()).to.equal(queue.stream());
    });

    it('ends if no functions are defined', (done) => {
      const data = [];
      queue.stream()
        .on('data', (datum) => data.push(datum))
        .on('end', () => {
          expect(data).to.deep.equal([]);
          done();
        });
    });
  });

  describe('#error()', () => {
    it('emits argument as error on #stream()', (done) => {
      queue.stream()
        .on('error', (err) => {
          expect(err).to.equal('wat');
          done();
        });

      queue.error('wat');
    });
  });

  describe('#enqueue()', () => {
    it('pipes the returned input stream from the given function into #stream()', (done) => {
      const stream = new PassThrough({ objectMode: true });
      queue.enqueue(() => stream);

      const data = [];
      queue.stream()
        .on('data', (datum) => data.push(datum))
        .on('end', () => {
          expect(data).to.deep.equal([
            { foo: 'bar' }
          ]);
          done();
        });

      stream.end({foo:'bar'});
    });

    it('can enqueue multiple streams at any time so long as at least one stream is not yet ended', (done) => {
      const stream1 = new PassThrough({ objectMode: true });
      const stream2 = new PassThrough({ objectMode: true });

      queue.enqueue(() => stream1);
      stream1.write({foo:'bar'});

      const data = [];
      queue.stream()
        .on('data', (datum) => data.push(datum))
        .on('end', () => {
          expect(data).to.deep.equal([
            { foo: 'bar' }, { no: 'wai' }
          ]);
          done();
        });

      queue.enqueue(() => stream2);

      stream1.end();
      stream2.end({no:'wai'});
    });
  });

  describe('#lazyMap()', () => {
    it('given function is invoked on every input stream prior to being piped', (done) => {
      const stream1 = new PassThrough();
      const stream2 = new PassThrough();

      queue.enqueue(() => stream1);
      queue.enqueue(() => stream2);

      queue.lazyMap(stream => {
        stream.__touchedForTest = true;
        return stream;
      });

      const data = [];
      queue.stream()
        .on('data', (datum) => data.push(datum))
        .on('end', () => {
          expect(stream1).to.have.property('__touchedForTest').equal(true);
          expect(stream2).to.have.property('__touchedForTest').equal(true);
          done();
        });

      stream1.end();
      stream2.end();
    });

    it('the returned stream is piped instead of the original input stream', (done) => {
      const stream = new PassThrough({ objectMode: true });
      const mappedStream = new PassThrough({ objectMode: true });

      queue.enqueue(() => stream);

      queue.lazyMap(() => mappedStream);

      const data = [];
      queue.stream()
        .on('data', (datum) => data.push(datum))
        .on('end', () => {
          expect(data).to.deep.equal([
            { no: 'wai' }
          ]);
          done();
        });

      stream.end({foo:'bar'}); // not really necessary, but just for test clarity's sake
      mappedStream.end({no:'wai'});
    });
  });
});
