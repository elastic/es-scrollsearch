'use strict';

const sinon = require('sinon');
const Stream = require('stream');
const PassThrough = Stream.PassThrough;
const responseBody = require('../support/response-body');
const hitStream = require('../../lib/hit-stream');

describe('hitStream()', () => {
  let retrieve;
  beforeEach(() => {
    retrieve = sinon.stub();
  });

  it('returns a json array as a stream', (done) => {
    const stream = new PassThrough();

    retrieve.returns(stream);

    const chunks = [];
    hitStream(retrieve)
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => {
        const actual = JSON.parse(chunks.join(''));
        expect(actual).to.be.an('array');
        done();
      });

    stream.end();
  });

  it('stream is a stream2 readable interface', () => {
    retrieve.returns(new PassThrough());
    const stream = hitStream(retrieve);

    expect(stream).to.be.instanceOf(Stream);
    expect(stream).to.have.property('_read').is.a('function');
    expect(stream).to.have.property('_readableState').is.an('object');
  });

  it('array is empty if there are no hits', (done) => {
    const stream = new PassThrough();

    retrieve.returns(stream);

    const chunks = [];
    hitStream(retrieve)
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => {
        const actual = JSON.parse(chunks.join(''));
        expect(actual).to.have.length(0);
        done();
      });

    stream.end();
  });

  it('includes all hits from every call to retrieve()', (done) => {
    const stream1 = new PassThrough();
    const stream2 = new PassThrough();
    const stream3 = new PassThrough();

    retrieve.onFirstCall().returns(stream1);
    retrieve.onSecondCall().returns(stream2);
    retrieve.onThirdCall().returns(stream3);

    const chunks = [];
    hitStream(retrieve)
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => {
        const actual = JSON.parse(chunks.join(''));
        const expected = [
          { foo: 'bar' }, { foo: 'notbar' },
          { foo: 'bar' }, { foo: 'notbar' }
        ];
        expect(actual).to.deep.equal(expected);
        done();
      });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody('someid', [])));

    stream1.end(responseBody());
  });

  it('ends when it encounters a stream that has no hits', (done) => {
    const stream1 = new PassThrough();
    const stream2 = new PassThrough();
    const stream3 = new PassThrough();

    retrieve.onFirstCall().returns(stream1);
    retrieve.onSecondCall().returns(stream2);
    retrieve.onThirdCall().returns(stream3);

    hitStream(retrieve)
      .on('data', () => {})
      .on('end', () => {
        expect(retrieve).to.have.been.calledTwice;
        done();
      });

    stream1.on('end', () => stream2.end(responseBody('someid', [])));
    stream1.end(responseBody());
  });

  it('first invocation of retrieve() passes no arguments', (done) => {
    const stream = new PassThrough();

    retrieve.returns(stream);

    hitStream(retrieve)
      .on('data', () => {})
      .on('end', () => {
        expect(retrieve.firstCall.args).to.have.length(0);
        done();
      });

    stream.end();
  });

  it('subsequent invocations of retrieve() pass the scroll id from the previous stream', (done) => {
    const stream1 = new PassThrough();
    const stream2 = new PassThrough();
    const stream3 = new PassThrough();

    retrieve.onFirstCall().returns(stream1);
    retrieve.onSecondCall().returns(stream2);
    retrieve.onThirdCall().returns(stream3);

    hitStream(retrieve)
      .on('data', () => {})
      .on('end', () => {
        expect(retrieve.secondCall.args[0]).to.equal('123');
        expect(retrieve.thirdCall.args[0]).to.equal('234');
        done();
      });

    stream1.on('end', () => stream2.end(responseBody('234')));
    stream2.on('end', () => stream3.end(responseBody('someid', [])));

    stream1.end(responseBody('123'));
  });

  it('emits an error when any retrieve() stream has a non-200-level response status code', (done) => {
    const stream = new PassThrough();

    retrieve.returns(stream);

    hitStream(retrieve)
      .on('data', () => {})
      .on('error', (err) => {
        expect(err).to.have.property('message').equal('Unexpected status code 300');
        done();
      });

    stream.emit('response', { statusCode: 300 });
  });
});
