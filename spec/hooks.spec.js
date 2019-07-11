'use strict';
const nonExecutor = require('./spec_helper').nonExecutor;

describe('before', () => {
  set('ping', () => {
    let value = 0;
    return (offset = 1, set = false) => {
      if (set) value = offset;
      else value += offset;
      return value;
    };
  });

  context('hooks only run if there is an example', () => {
    before(nonExecutor);
  });

  describe('before hook call types', () => {
    before('Named hook with option', {}, () => ping());
    before('Named hook', () => ping());
    before(() => ping());
    it('pings for each hook, plus the expectation call', () => expect(ping()).to.eql(4));
  });

  describe('before hook call order', () => {
    before('first', () => ping(100, true));
    before('second', () => ping(5, true));
    it('runs in order of definition', () => expect(ping(0)).to.eql(5));
  });

  describe('calling with no function to execute', () => {
    try {
      before('what even is this');
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('fails', () =>
      expect(() =>
        before('I should throw', nonExecutor)
      ).to.throw(ReferenceError, 'example block (`before`) can not be defined inside another')
    );
  });

  describe('nested execution', () => {
    before(() => ping(10));
    let hasRun = false; // this is required for random order processing
    const expectedResult = () => hasRun ? 1 : 11;

    context('one deep', () => {
      it('executes', () => {
        expect(ping()).to.eql(expectedResult());
        hasRun = true;
      });

      context('two deep', () => {
        it('doesn\'t execute again', () =>{
          expect(ping()).to.eql(expectedResult());
          hasRun = true;
        });
      });
    });

    context('parallel', () => {
      it('doesn\'t execute again', () =>{
        expect(ping()).to.eql(expectedResult());
        hasRun = true;
      });
    });
  });
});
