'use strict';

const sinon = require('sinon');
const once = require('../../lib/once');

describe('once()', () => {
  describe('returned function', () => {
    let orig;
    beforeEach(() => orig = sinon.stub().returns('woah'));

    it('invokes original with all args', () => {
      const fn = once(orig);
      fn('foo', 'bar');
      expect(orig).to.have.been.calledWith('foo', 'bar');
    });

    it('is only invoked once', () => {
      const fn = once(orig);
      fn('foo', 'bar');
      fn('foo', 'bar');
      fn('hmm');
      expect(orig).to.have.been.calledOnce;
    });

    it('returns the original result on subsequent invocations', () => {
      const fn = once(orig);
      const ret = fn('foo', 'bar');
      expect(fn()).to.equal(ret);
    });
  })
});
