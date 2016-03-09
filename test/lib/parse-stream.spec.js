'use strict';

const PassThrough = require('stream').PassThrough;
const JSONStream = require('JSONStream');
const parseStream = require('../../lib/parse-stream');
const responseBody = require('../support/response-body');

describe('parse-stream', () => {
  let stream;
  beforeEach(() => {
    stream = new PassThrough();
  });

  it('returns a single stream of hits', (done) => {
    const hits = [];
    parseStream(stream)
      .on('data', hit => hits.push(hit))
      .on('end', () => {
        expect(hits).to.deep.equal([
          { foo: 'bar' }, { foo: 'notbar' },
          { foo: 'bar' }, { foo: 'notbar' }
        ]);
        done();
      });

    stream.write(responseBody());
    stream.write(responseBody());
    stream.end();
  });

  describe('returned stream', () => {
    it('emits next_id whenever scroll id is encountered', (done) => {
      const ids = [];
      parseStream(stream)
        .on('data', () => {}) // drain it
        .on('next_id', id => ids.push(id))
        .on('end', () => {
          expect(ids).to.deep.equal([
            '1', '2', '3'
          ]);
          done();
        });

      stream.write(responseBody('1'));
      stream.write(responseBody('2'));
      stream.write(responseBody('3'));
      stream.end();
    });

    it('emits hit whenever a hit is encountered', (done) => {
      const hits = [];
      parseStream(stream)
        .on('data', () => {}) // drain it
        .on('hit', hit => hits.push(hit))
        .on('end', () => {
          expect(hits).to.deep.equal([
            { foo: 'bar' }, { foo: 'notbar' }
          ]);
          done();
        });

      stream.write(responseBody());
      stream.end();
    });
  });
});
