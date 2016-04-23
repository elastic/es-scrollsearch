'use strict';

const Stream = require('stream');
const PassThrough = Stream.PassThrough;

const JSONStream = require('JSONStream');
const request = require('request');
const sinon = require('sinon');

const responseBody = require('../support/response-body');
const urlHelpers = require('../support/url-helpers');
const makeUrl = urlHelpers.makeUrl;
const toUrlObj = urlHelpers.toUrlObj;

const search = require('../../lib/search');

describe('search()', function () {
  let params;
  let stream1;
  let stream2;
  let stream3;
  let url;

  beforeEach(() => {
    params = { query: { foo: 'bar' } };
    url = makeUrl('/foo/bar');

    stream1 = new PassThrough();
    stream2 = new PassThrough();
    stream3 = new PassThrough();

    sinon.stub(request, 'post');
    request.post.onCall(0).returns(stream1);
    request.post.onCall(1).returns(stream2);
    request.post.onCall(2).returns(stream3);
    request.post.throws(); // in this test, there should never be a fourth call
  });

  afterEach(() => {
    request.post.restore();
  });

  it('returns a pipeable stream', () => {
    const stream = search(url, params);
    expect(stream.pipe).to.be.a('function');
  });

  it('stream is a stream2 readable interface', () => {
    const stream = search(url, params);

    expect(stream).to.be.instanceOf(Stream);
    expect(stream).to.have.property('_read').is.a('function');
    expect(stream).to.have.property('_readableState').is.an('object');
  });

  it('returns a stream comprised of hit objects from scroll requests', (done) => {
    const stream = search(url, params);

    const hits1 = JSON.parse(responseBody()).hits.hits;
    const hits2 = JSON.parse(responseBody()).hits.hits;
    const expected = hits1.concat(hits2).map(hit => hit._id);

    const chunks = [];
    stream
      .on('data', chunk => chunks.push(chunk))
      .on('end', () => {
        const actual = JSON.parse(chunks.join(''));
        expect(actual.map(x => x._id)).to.deep.equal(expected);
        done();
      });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('sends requests for all scroll results until empty', done => {
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      expect(request.post).to.be.calledThrice;
      done();
    });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('defaults to sending application/json content-type header', done => {
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const match = { headers: { 'content-type': 'application/json' } };
      expect(request.post).to.always.be.calledWithMatch(match);
      done();
    });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('allows overriding application/json content-type header', done => {
    const stream = search(url, params, { 'content-type': 'wat', 'foo': 'bar' });

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const match = { headers: { 'content-type': 'wat', 'foo': 'bar' } };
      expect(request.post).to.always.be.calledWithMatch(match);
      done();
    });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('emits an error when any request returns a non-200-level response status code', (done) => {
    const stream = search(url, params);

    stream
      .on('data', () => {}) // drain
      .on('error', (err) => {
        expect(request.post).to.be.calledTwice;
        expect(err).to.have.property('message').equal('Unexpected status code 400');
        done();
      });

    stream1.on('end', () => stream2.emit('response', { statusCode: 400 }));
    stream1.end(responseBody());
  });

  it('only includes given params on the first request', done => {
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const body1 = JSON.parse(request.post.getCall(0).args[0].body);
      const body2 = JSON.parse(request.post.getCall(1).args[0].body);
      const body3 = JSON.parse(request.post.getCall(2).args[0].body);

      expect(body1).to.have.property('query').deep.equal(params.query);
      expect(body2).not.to.have.property('query');
      expect(body3).not.to.have.property('query');

      done();
    });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('only includes sort on the first request', done => {
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const body1 = JSON.parse(request.post.getCall(0).args[0].body);
      const body2 = JSON.parse(request.post.getCall(1).args[0].body);
      const body3 = JSON.parse(request.post.getCall(2).args[0].body);

      expect(body1).to.have.property('sort').deep.equal([ '_doc' ]);
      expect(body2).not.to.have.property('sort');
      expect(body3).not.to.have.property('sort');

      done();
    });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('only includes scroll_id on subsequent requests', done => {
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const body1 = JSON.parse(request.post.getCall(0).args[0].body);
      const body2 = JSON.parse(request.post.getCall(1).args[0].body);
      const body3 = JSON.parse(request.post.getCall(2).args[0].body);

      expect(body1).not.to.have.property('scroll_id');
      expect(body2).to.have.property('scroll_id', JSON.parse(responseBody())._scroll_id);
      expect(body3).to.have.property('scroll_id', JSON.parse(responseBody())._scroll_id);

      done();
    });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('includes scroll on every request', done => {
    url += '?scroll=1m'
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const url1 = request.post.getCall(0).args[0].url;
      const body2 = JSON.parse(request.post.getCall(1).args[0].body);
      const body3 = JSON.parse(request.post.getCall(2).args[0].body);

      expect(url1).to.include('?scroll=1m');
      expect(body2).to.have.property('scroll', '1m');
      expect(body3).to.have.property('scroll', '1m');

      done();
    });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('defaults scroll duration to 30s', done => {
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const url1 = request.post.getCall(0).args[0].url;
      const body2 = JSON.parse(request.post.getCall(1).args[0].body);
      const body3 = JSON.parse(request.post.getCall(2).args[0].body);

      expect(url1).to.include('?scroll=30s');
      expect(body2).to.have.property('scroll', '30s');
      expect(body3).to.have.property('scroll', '30s');

      done();
    });

    stream1.on('end', () => stream2.end(responseBody()));
    stream2.on('end', () => stream3.end(responseBody(null, [])));
    stream1.end(responseBody());
  });

  it('defaults sort to _doc', done => {
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const body1 = JSON.parse(request.post.getCall(0).args[0].body);
      expect(body1).to.have.property('sort').deep.equal(['_doc']);
      done();
    });

    stream1.on('end', () => stream2.end());
    stream2.on('end', () => stream3.end());
    stream1.end();
  });

  it('allows for custom sorting', done => {
    params.sort = ['foo'];
    const stream = search(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const body1 = JSON.parse(request.post.getCall(0).args[0].body);
      expect(body1).to.have.property('sort').deep.equal(['foo']);
      done();
    });

    stream1.on('end', () => stream2.end());
    stream2.on('end', () => stream3.end());
    stream1.end();
  });
});
