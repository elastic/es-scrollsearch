'use strict';

const sinon = require('sinon');
const PassThrough = require('stream').PassThrough;
const parseStream = require('../../lib/parse-stream');
const responseBody = require('../support/response-body');

describe('parseStream()', () => {
  let handleHit;
  let handleScrollId;
  let onError;
  let stream;
  beforeEach(() => {
    stream = new PassThrough();
    handleHit = sinon.stub();
    handleScrollId = sinon.stub();
    onError = sinon.stub();
  });

  it('returns a stream of only the hits', (done) => {
    const hits = [];
    parseStream(stream, handleHit, handleScrollId, onError)
      .on('data', hit => hits.push(hit))
      .on('end', () => {
        expect(hits).to.deep.equal([
          { foo: 'bar' }, { foo: 'notbar' }
        ]);
        done();
      });

    stream.end(responseBody());
  });

  it('invokes handleHit whenever a hit is encountered', (done) => {
    parseStream(stream, handleHit, handleScrollId, onError)
      .on('end', () => {
        expect(handleHit).to.have.been.calledTwice;
        expect(handleHit).to.have.been.calledWith({ foo: 'bar' });
        expect(handleHit).to.have.been.calledWith({ foo: 'notbar' });
        done();
      });

    stream.end(responseBody());
  });

  it('invokes handleScrollId when the scroll id is encountered', (done) => {
    parseStream(stream, handleHit, handleScrollId, onError)
      .on('end', () => {
        expect(handleScrollId).to.have.been.calledOnce;
        expect(handleScrollId).to.have.been.calledWith('123');
        done();
      });

    stream.end(responseBody());
  });

  it('invokes onError if given stream emits an error', (done) => {
    parseStream(stream, handleHit, handleScrollId, onError)
      .on('end', () => {
        expect(onError).to.have.been.calledOnce;
        expect(onError).to.have.been.calledWith('some error');
        done();
      });

    stream.emit('error', 'some error');
  });
});
