'use strict';

const request = require('request');
const sinon = require('sinon');

const makeUrl = require('../support/url-helpers').makeUrl;
const requests = require('../../lib/requests');

describe('requests', () => {
  let url;

  beforeEach(() => {
    sinon.stub(request, 'post').returns('result');
    url = makeUrl('/foo');
  });

  afterEach(() => {
    request.post.restore();
  });

  describe('#makeRequest()', () => {
    it('makes a POST request', () => {
      requests.makeRequest(url, {});
      expect(request.post).to.be.calledOnce;
    });

    it('returns the result of the post request', () => {
      const returned = requests.makeRequest(url, {});
      expect(returned).to.equal('result');
    });

    describe('request', () => {
      it('is to given url', () => {
        requests.makeRequest(url, {});
        const params = request.post.getCall(0).args[0];
        expect(params).to.have.property('url', url);
      });

      it('includes a json content-type header', () => {
        requests.makeRequest(url, {});
        const params = request.post.getCall(0).args[0];
        expect(params.headers).to.have.property('content-type', 'application/json');
      });

      it('includes the given data as a json stringified body', () => {
        const data = { foo: 'bar' };
        requests.makeRequest(url, data);

        const expected = JSON.stringify(data);
        const params = request.post.getCall(0).args[0];
        expect(params).to.have.property('body', expected);
      });
    });
  });

  describe('#nextRequestFn()', () => {
    let scroll;
    beforeEach(() => {
      scroll = '1m';
    });

    it('is a thunk', () => {
      const next = requests.nextRequestFn(url, scroll);
      expect(next).to.be.a('function');
    });

    it('subroutine makes a POST request', () => {
      const next = requests.nextRequestFn(url, scroll);
      next('garbage');
      expect(request.post).to.be.calledOnce;
    });

    it('subroutine returns the result of the post request', () => {
      const next = requests.nextRequestFn(url, scroll);
      const returned = next('garbage');
      expect(returned).to.equal('result');
    });

    describe('subroutine request', () => {
      it('is to given url', () => {
        const next = requests.nextRequestFn(url, scroll);
        next('garbage');

        const params = request.post.getCall(0).args[0];
        expect(params).to.have.property('url', url);
      });

      it('includes a json content-type header', () => {
        const next = requests.nextRequestFn(url, scroll);
        next('garbage');

        const params = request.post.getCall(0).args[0];
        expect(params.headers).to.have.property('content-type', 'application/json');
      });

      it('includes scroll and scroll_id as a json stringified body', () => {
        const scroll_id = '123';
        const next = requests.nextRequestFn(url, scroll);
        next(scroll_id);

        const expected = JSON.stringify({scroll, scroll_id});

        const params = request.post.getCall(0).args[0];
        expect(params).to.have.property('body', expected);
      });
    });
  });
});
