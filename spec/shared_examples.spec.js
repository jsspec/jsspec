'use strict';

const {nonExecutor} = require('./spec_helper');

describe('shared examples', () => {
  let callCount = 0;

  sharedExamples('a passing test', () => {
    afterEach(() => callCount++);
    it('executes', () => callCount++);
  });

  describe('sibling', () => {
    after(() => expect(callCount).to.eql(3));

    itBehavesLike('a passing test');

    it('local call', () => callCount++);
  });

  context('with args', () => {
    sharedExamples('an example that takes args', {}, (object) => {
      object.sharedCalled = true;
      it('caller does not need local tests for hooks to execute', () => {});
    });
    describe('caller', () => {
      let localObject = {};
      itBehavesLike('an example that takes args', localObject);

      after(() => expect(localObject.sharedCalled).to.be.true);
    });
  });
});

describe('bad use of shared examples', () => {
  it('can not be called inside of an example', () => {
    expect(() => sharedExamples('named', () => {})).to.throw(ReferenceError, 'A shared example can not be defined inside an example');
  });

  try {
    sharedExamples('no Executor');
    it('should not execute this block', nonExecutor);
  }catch (e) {
    it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
  }
});