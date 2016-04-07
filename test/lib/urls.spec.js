'use strict';

const urls = require('../../lib/urls');
const urlHelpers = require('../support/url-helpers');

const makeUrl = urlHelpers.makeUrl;
const toUrlObj = urlHelpers.toUrlObj;

describe('urls', () => {
  describe('#assertValidUrlObj()', () => {
    it('throws if url includes query string', () => {
      const urlObj = toUrlObj(makeUrl('/foo?bar'));
      expect(() => urls.assertValidUrlObj(urlObj)).to.throw();
    });
    it('throws if url includes even an empty query string', () => {
      const urlObj = toUrlObj(makeUrl('/foo?'));
      expect(() => urls.assertValidUrlObj(urlObj)).to.throw();
    });
    it('throws if url includes a hash', () => {
      const urlObj = toUrlObj(makeUrl('/foo#bar'));
      expect(() => urls.assertValidUrlObj(urlObj)).to.throw();
    });
    it('throws if url includes even an empty hash', () => {
      const urlObj = toUrlObj(makeUrl('/foo#'));
      expect(() => urls.assertValidUrlObj(urlObj)).to.throw();
    });
  });

  describe('#getInitialUrl()', () => {
    it('returns url string with /_search/scroll appended', () => {
      const urlObj = toUrlObj(makeUrl('/foo/bar'));
      const url = urls.getInitialUrl(urlObj);
      expect(url).to.equal(makeUrl('/foo/bar/_search/scroll'));
    });
  });

  describe('#getSubsequentUrl()', () => {
    it('returns scroll search url string without initial path', () => {
      const urlObj = toUrlObj(makeUrl('/foo/bar'));
      const url = urls.getSubsequentUrl(urlObj);
      expect(url).to.equal(makeUrl('/_search/scroll'));
    });
  });
});
