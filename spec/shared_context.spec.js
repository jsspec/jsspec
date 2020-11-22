'use strict';

const { nonExecutor, noOp } = require('./spec_helper');

describe('shared context', () => {
  let callCount = 0;

  sharedContext('a passing test', () => {
    afterEach(() => callCount++);
    it('executes', () => callCount++);
  });

  describe('sibling', () => {
    after(() => expect(callCount).to.eql(4));

    // the after each hooks get called for this one as well :thumbsup:
    // note that this test is deliberately here to prove this case
    it('local call', () => callCount++);

    includeContext('a passing test');
  });

  context('with args', () => {
    sharedContext('an example that takes args', {}, object => {
      object.sharedCalled = true;
      it('caller does not need local tests for hooks to execute', noOp);
    });
    describe('caller', () => {
      let localObject = {};
      includeContext('an example that takes args', localObject);

      after(() => expect(localObject.sharedCalled).to.be.true);
    });
  });

  sharedContext('value changer', expectedValue => {
    set('value', 1);

    it('keeps the last value set based on order of operation inside', () => expect(value).to.eql(expectedValue));
  });

  describe('affects the context it is called in to', () => {
    context('when called after value is set', () => {
      set('value', 0);

      includeContext('value changer', 1);

      it('keeps the value from the included context', () => expect(value).to.eql(1));
    });
  });
  context('when value is set after the call', () => {
    includeContext('value changer', 0);
    set('value', 0);

    it('keeps the value in the local context', () => expect(value).to.eql(0));
  });
});

describe('bad use of shared context', () => {
  it('can not be called inside of an example', () => {
    expect(() => sharedContext('named', noOp)).to.throw(ReferenceError, 'A shared context can not be defined inside an example');
  });

  try {
    sharedContext('no Executor');
    it('should not execute this block', nonExecutor);
  } catch (e) {
    it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
  }
});
