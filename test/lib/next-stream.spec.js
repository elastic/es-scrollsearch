'use strict';

const PassThrough = require('stream').PassThrough;
const nextStream = require('../../lib/next-stream');

describe('next-stream()', () => {
  let next;
  let nextScrollId;
  let stream;

  beforeEach(() => {
    stream = new PassThrough();
    nextScrollId = 'wat';
    next = sinon.stub().returns(stream);
  });

  it('throws if not given a function', () => {
    expect(nextStream).to.throw(TypeError);
  });

  describe('returned object', () => {
    let onDeck;
    beforeEach(() => onDeck = nextStream(next));

    describe('.next()', () => {
      it('throws an error if no scroll id is set', () => {
        expect(onDeck.next).to.throw();
      });

      context('when we have hits', () => {
        beforeEach(() => {
          onDeck.setId(nextScrollId);
          onDeck.increment();
        });
        it('invokes original next() with scroll id', () => {
          onDeck.next();
          expect(next).to.have.been.calledWith(nextScrollId);
        });
        it('returns result', () => {
          const result = onDeck.next();
          expect(result).to.equal(stream);
        });
        it('resets scroll id', () => {
          onDeck.next();
          expect(onDeck.next).to.throw();
        });
        it('resets hits', () => {
          onDeck.next();
          onDeck.setId(nextScrollId);
          expect(onDeck.next()).to.equal(null);
        });
      });

      context('when we do not have hits', () => {
        beforeEach(() => onDeck.setId(nextScrollId));
        it('returns null', () => {
          expect(onDeck.next()).to.equal(null);
        });
      });
    });
  });
});
