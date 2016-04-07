'use strict';

const sinon = require('sinon');
const PassThrough = require('stream').PassThrough;
const scrollStreams = require('../../lib/scroll-streams');
const scrollResponse = require('../support/scroll-response');

describe('scroll-streams', () => {
  let stream1;
  let stream2;
  let stream3;
  let next;
  let streamFns;

  beforeEach(() => {
    stream1 = new PassThrough();
    stream2 = new PassThrough();
    stream3 = new PassThrough();

    next = sinon.stub();
    next.onFirstCall().returns(stream2);
    next.returns(stream3);
  });

  it('returns a pipeable stream', () => {
    const stream = scrollStreams(stream1, next);
    expect(stream.pipe).to.be.a('function');
  });

  it('returns a single steam of hit objects', done => {
    const stream = scrollStreams(stream1, next);

    const expected = [
      { foo: 'one' }, { foo: 'two' },
      { foo: 'three' }, { foo: 'four' }
    ];
    const input1 = scrollResponse([ expected[0], expected[1] ]);
    const input2 = scrollResponse([ expected[2], expected[3] ]);
    const input3 = scrollResponse([]);

    stream1.write(JSON.stringify(input1));
    stream2.write(JSON.stringify(input2));
    stream3.write(JSON.stringify(input3));

    const hits = [];
    stream.on('data', data => hits.push(data));

    stream.on('end', () => {
      expect(hits).to.deep.equal(expected);
      done();
    });

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 10);
  });

  it('invokes next with scroll id from previous stream', done => {
    const stream = scrollStreams(stream1, next);

    const input1 = scrollResponse([ {} ]);
    const input2 = scrollResponse([ {} ]);
    const input3 = scrollResponse([]);

    stream1.write(JSON.stringify(input1));
    stream2.write(JSON.stringify(input2));
    stream3.write(JSON.stringify(input3));

    stream.on('data', () => {});

    stream.on('end', () => {
      expect(next).to.be.calledWith(input1._scroll_id);
      expect(next).to.be.calledWith(input2._scroll_id);
      done();
    });

    setTimeout(() => {
      stream1.end();
      stream2.end();
      stream3.end();
    }, 10);
  });
});
