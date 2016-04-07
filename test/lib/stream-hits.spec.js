'use strict';

const PassThrough = require('stream').PassThrough;

const request = require('request');
const sinon = require('sinon');

const urlHelpers = require('../support/url-helpers');
const makeUrl = urlHelpers.makeUrl;
const toUrlObj = urlHelpers.toUrlObj;

const response1 = require('../support/fixtures/response1.json');
const response2 = require('../support/fixtures/response2.json');
const response3 = require('../support/fixtures/response3.json');

const streamHits = require('../../lib/stream-hits');

describe('stream-hits', function () {
  // we do setTimeouts in the tests, so we allow for slightly slower tests
  this.slow(150);

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

    stream1.write(JSON.stringify(response1));
    stream2.write(JSON.stringify(response2));
    stream3.write(JSON.stringify(response3));

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
    const stream = streamHits(url, params);
    expect(stream.pipe).to.be.a('function');
  });

  it('returns a stream comprised of hit objects from scroll requests', done => {
    const stream = streamHits(url, params);

    const timestamps1 = response1.hits.hits.map(hit => hit._source['@timestamp']);
    const timestamps2 = response2.hits.hits.map(hit => hit._source['@timestamp']);
    const expected = timestamps1.concat(timestamps2);

    const timestamps = [];
    stream.on('data', data => timestamps.push(data['@timestamp']));

    stream.on('end', () => {
      expect(timestamps).to.deep.equal(expected);
      done();
    });

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });

  it('sends requests for all scroll results until empty', done => {
    const stream = streamHits(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      expect(request.post).to.be.calledThrice;
      done();
    });

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });

  it('only includes given params on the first request', done => {
    const stream = streamHits(url, params);

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

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });

  it('only includes sort on the first request', done => {
    const stream = streamHits(url, params);

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

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });

  it('only includes scroll_id on subsequent requests', done => {
    const stream = streamHits(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const body1 = JSON.parse(request.post.getCall(0).args[0].body);
      const body2 = JSON.parse(request.post.getCall(1).args[0].body);
      const body3 = JSON.parse(request.post.getCall(2).args[0].body);

      expect(body1).not.to.have.property('scroll_id');
      expect(body2).to.have.property('scroll_id', response1._scroll_id);
      expect(body3).to.have.property('scroll_id', response2._scroll_id);

      done();
    });

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });

  it('includes scroll on every request', done => {
    url += '?scroll=1m'
    const stream = streamHits(url, params);

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

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });

  it('defaults scroll duration to 30s', done => {
    const stream = streamHits(url, params);

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

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });

  it('defaults sort to _doc', done => {
    const stream = streamHits(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const body1 = JSON.parse(request.post.getCall(0).args[0].body);
      expect(body1).to.have.property('sort').deep.equal(['_doc']);
      done();
    });

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });

  it('allows for custom sorting', done => {
    params.sort = ['foo'];
    const stream = streamHits(url, params);

    stream.on('data', () => {}); // drain
    stream.on('end', () => {
      const body1 = JSON.parse(request.post.getCall(0).args[0].body);
      expect(body1).to.have.property('sort').deep.equal(['foo']);
      done();
    });

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 25);
  });
});
