'use strict';

const sinon = require('sinon');
const PassThrough = require('stream').PassThrough;
const streamqueue = require('../support/streamqueue');
const queueAndContinue = require('../../lib/queue-and-continue');

describe('queue-and-continue', () => {
  let stream;
  let next;
  let queue;

  beforeEach(() => {
    stream = new PassThrough();
    next = sinon.stub();
    queue = streamqueue();
  });

  it('adds the stream to the queue', () => {
    queueAndContinue(stream, next, queue);
    expect(queue.queue).to.have.been.calledWith(stream);
  });

  it('continues queuing up the next stream if one exists', () => {
    queueAndContinue(stream, next, queue);

    const stream2 = new PassThrough();
    next.returns(stream2);
    stream.emit('end');
    expect(queue.queue).to.have.been.calledWith(stream2);

    const stream3 = new PassThrough();
    next.returns(stream3);
    stream2.emit('end');
    expect(queue.queue).to.have.been.calledWith(stream3);
  });

  it('marks the queue as done if there is no next stream', () => {
    queueAndContinue(stream, next, queue);
    stream.emit('end');
    expect(queue.done).to.have.been.called;
  });
});
