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
    it('makes a json post request to the given url', () => {
      const expected = {
        body: {}, json: true, url
      };
      requests.makeRequest(url, {});
      expect(request.post).to.be.calledWith(expected);
    });
    it('returns the result of the post request', () => {
      const returned = requests.makeRequest(url, {});
      expect(returned).to.equal('result');
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

    it('subroutine makes a json post request to the given url', () => {
      const scroll_id = '123';
      const next = requests.nextRequestFn(url, scroll);
      const expected = {
        body: { scroll, scroll_id }, json: true, url
      };
      next(scroll_id);
      expect(request.post).to.be.calledWith(expected);
    });

    it('subroutine returns the result of the post request', () => {
      const next = requests.nextRequestFn(url, scroll);
      const returned = next('123');
      expect(returned).to.equal('result');
    });
  });
});
