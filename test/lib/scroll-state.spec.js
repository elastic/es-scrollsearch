'use strict';

const PassThrough = require('stream').PassThrough;
const createScrollState = require('../../lib/scroll-state');

describe('createScrollState()', () => {
  let callback;
  let state;
  beforeEach(() => {
    callback = sinon.stub();
    state = createScrollState(callback);
  });

  describe('#handleHit()', () => {
    it('has no effect if scroll id was not set previously', () => {
      state.handleHit();
      expect(callback).not.to.have.been.called;
    });
    it('invokes original callback with scroll id if it was set previously', () => {
      const id = 'wat';
      state.handleScrollId(id);
      state.handleHit();
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWithExactly(id);
    });
  });

  describe('#handleScrollId()', () => {
    it('has no effect if no hits were registered previously', () => {
      state.handleScrollId();
      expect(callback).not.to.have.been.called;
    });
    it('invokes original callback with scroll id if hits were registered previously', () => {
      const id = 'wat';
      state.handleHit();
      state.handleScrollId(id);
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWithExactly(id);
    });
  });
});
