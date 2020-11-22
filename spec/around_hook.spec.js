'use strict';

const { nonExecutor, callTrace } = require('./spec_helper');

describe('aroundEach', () => {
  set('trace', callTrace);

  describe('call types and ordering', { random: false }, () => {
    const afterTrace = callTrace();

    aroundEach('Named with option', {}, async eg => {
      afterTrace('A');
      await eg();
      afterTrace('B');
    });
    aroundEach('Named', async eg => {
      afterTrace('C');
      await eg();
      afterTrace('D');
    });
    aroundEach(async eg => {
      afterTrace('E');
      await eg();
      afterTrace('F');
    });

    it('all are called in order, once per example', () => expect(afterTrace('x')).to.eq('ACEx'));
    it('all are called in order, once per example', () => expect(afterTrace('y')).to.eq('ACExFDBACEy'));
    after(() => expect(afterTrace()).to.eq('ACExFDBACEyFDB'));
  });

  describe('calling with no function', () => {
    try {
      aroundEach('what even is this');
      it(nonExecutor);
    } catch (error) {
      it('throws', () => expect(error).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('throws', () =>
      expect(() => aroundEach('called in executor', nonExecutor)).to.throw(ReferenceError, 'A hook (`aroundEach`) can not be defined inside an example block'));
  });

  context('passed a generator', () => {
    set('endState', 'acb');

    aroundEach(function* () {
      trace('a');
      yield;
      trace('b');

      expect(trace()).to.eq(endState);
    });

    it('wraps correctly', () => {
      expect(trace('c')).to.eq('ac');
    });

    describe('at depth', () => {
      set('endState', 'adfeb');

      aroundEach(function* () {
        trace('d');
        yield;
        trace('e');

        expect(trace()).to.eq('adfe');
      });

      it('wraps correctly', () => {
        expect(trace('f')).to.eq('adf');
      });
    });
  });

  context('passed an async generator', () => {
    set('endState', 'gih');

    aroundEach(async function* () {
      trace('g');
      yield;
      trace('h');

      expect(trace()).to.eq(endState);
    });

    it('wraps correctly', () => {
      expect(trace('i')).to.eq('gi');
    });
  });

  context('passed an regular method (example as promise)', () => {
    set('endState', 'jlk');

    aroundEach(example => {
      trace('j');
      return example().then(() => {
        trace('k');
        expect(trace()).to.eq(endState);
      });
    });

    it('wraps correctly', () => {
      expect(trace('l')).to.eq('jl');
    });
  });

  context('passed an async method', () => {
    set('endState', 'mon');

    aroundEach(async example => {
      trace('m');
      await example();
      trace('n');
      expect(trace()).to.eq(endState);
    });

    it('wraps correctly', () => {
      expect(trace('o')).to.eq('mo');
    });
  });

  describe('ordering of hooks', () => {
    const afterTrace = callTrace();

    set('endState', 'ptqvrus');

    before(() => afterTrace('p'));
    beforeEach(() => afterTrace('q'));
    afterEach(() => afterTrace('r'));
    after(() => {
      expect(afterTrace('s')).to.eq(endState);
    });
    aroundEach(function* () {
      afterTrace('t');
      yield;
      afterTrace('u');
    });

    it('enters in order', () => expect(afterTrace('v')).to.eq('ptqv'));
  });
});
