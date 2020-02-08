'use strict';
const { nonExecutor, callTrace, noOp } = require('./spec_helper');


describe('hooks', () => {
  context('hooks only run if there is an example', () => {
    before(nonExecutor);
    after(nonExecutor);
  });
});

describe('before', () => {
  describe('call types and ordering', { random: false }, () => {
    const trace = callTrace();

    before('Named with option', {}, () => trace('f'));
    before('Named', () => trace('g'));
    before(() => trace('h'));

    it('all are called in order, only once', () => expect(trace('x')).to.eq('fghx'));
    it('all are called in order, only once', () => expect(trace('y')).to.eq('fghxy'));
  });

  describe('calling with no function', () => {
    try {
      before('what even is this');
      it(nonExecutor);
    }catch (error) {
      it('throws', () => expect(error).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('throws', () => expect(
      () => before('called in executor', nonExecutor)
    ).to.throw(ReferenceError, 'hook (`before`) can not be defined inside an example block'));
  });

  describe('calling from within a hook', () => {
    before('throws', () => expect(
      () => before('called in executor', nonExecutor)
    ).to.throw(ReferenceError, 'hook (`before`) can not be defined inside an example block'));

    it('', noOp);
  });

  describe('nesting', { random: false }, () => {
    const trace = callTrace();

    before(() => trace('i'));

    describe('nested', () => {
      before(() => trace('j'));

      it('executes parents first', () => expect(trace('k')).to.eq('ijk'));
    });
  });
});

describe('after', () => {
  describe('call types and ordering', () => {
    const trace = callTrace();

    after('Named with option', {}, () => trace('f'));
    after('Named', () => trace('g'));
    after(() => trace('h'));

    it('example 1', noOp);
    it('example 2', noOp);

    after('all are called in order, only once', () => expect(trace()).to.eq('fgh'));
  });

  describe('calling with no function', () => {
    try {
      after('what even is this');
      it(noOp);
    }catch (error) {
      it('throws', () => expect(error).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('throws', () => expect(
      () => after('called in executor', nonExecutor)
    ).to.throw(ReferenceError, 'hook (`after`) can not be defined inside an example block'));
  });

  describe('calling from within a hook', () => {
    after('throws', () => expect(
      () => after('called in executor', nonExecutor)
    ).to.throw(ReferenceError, 'hook (`after`) can not be defined inside an example block'));

    it('', noOp);
  });

  describe('nesting', () => {
    const trace = callTrace();

    after(() => trace('i'));

    describe('nested', () => {
      after(() => trace('j'));

      it('executes parents first', () => trace('k'));
    });

    after(() => expect(trace()).to.eq('kji'));
  });
});