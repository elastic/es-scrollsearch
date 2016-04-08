'use strict';

const urls = require('../../lib/urls');
const urlHelpers = require('../support/url-helpers');

const makeUrl = urlHelpers.makeUrl;
const toUrlObj = urlHelpers.toUrlObj;

describe('urls', () => {
  describe('#getInitialUrl()', () => {
    it('returns url string representation of given url object', () => {
      const urlObj = toUrlObj(makeUrl('/foo/bar?scroll=1m'));
      const url = urls.getInitialUrl(urlObj);
      expect(url).to.equal(makeUrl('/foo/bar?scroll=1m'));
    });
  });

  describe('#getSubsequentUrl()', () => {
    it('returns scroll search url string without initial path or query', () => {
      const urlObj = toUrlObj(makeUrl('/foo/bar?scroll=30s'));
      const url = urls.getSubsequentUrl(urlObj);
      expect(url).to.equal(makeUrl('/_search/scroll'));
    });
  });

  describe('#parseUrl()', () => {
    it('returns url object', () => {
      const url = makeUrl('/foo/bar?scroll=45s');
      const urlObj = urls.parseUrl(url);
      expect(urlObj).to.have.property('protocol', 'http:');
      expect(urlObj).to.have.property('auth', null);
      expect(urlObj).to.have.property('hostname', 'example.com');
      expect(urlObj).to.have.property('port', '1234');
      expect(urlObj).to.have.deep.property('query.scroll', '45s');
      expect(urlObj).to.have.property('pathname', '/foo/bar');
    });

    it('returned url object does not contain "search"', () => {
      const url = makeUrl('/foo/bar?scroll=45s');
      const urlObj = urls.parseUrl(url);
      expect(urlObj).to.have.property('search', null);
    });

    it('returned url object does not contain "hash"', () => {
      const url = makeUrl('/foo/bar?scroll=45s#blah');
      const urlObj = urls.parseUrl(url);
      expect(urlObj).to.have.property('hash', null);
    });
  });
});
