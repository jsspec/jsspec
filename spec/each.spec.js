'use strict';
const { nonExecutor, callTrace, noOp } = require('./spec_helper');

describe('before and after', () => {
  context('are only run if there is an example', () => {
    beforeEach(nonExecutor);
    afterEach(nonExecutor);
  });
});

describe('beforeEach', () => {
  set('trace', callTrace);

  describe('call types and ordering', () => {
    beforeEach('Named with option', {}, () => trace('a'));
    beforeEach('Named', () => trace('b'));
    beforeEach(() => trace('c'));

    it('all are called in order, per example', () => expect(trace('y')).to.eq('abcy'));
    it('all are called in order, per example', () => expect(trace('z')).to.eq('abcz'));
  });

  describe('calling with no function', () => {
    try {
      beforeEach('what even is this');
      it(nonExecutor);
    }catch (error) {
      it('throws', () => expect(error).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('throws', () => expect(
      () => beforeEach('called in executor', nonExecutor)
    ).to.throw(ReferenceError, 'example block (`beforeEach`) can not be defined inside another'));
  });

  describe('nesting', () => {
    beforeEach(() => trace('d'));

    describe('nested', () => {
      beforeEach(() => trace('e'));

      it('executes parents first', () => expect(trace()).to.eq('de'));
    });

    describe('sibling contexts', () => {
      it('does not execute the sibling\'s hook', () => expect(trace()).to.eq('d'));
    })
  });
});

describe('afterEach', () => {
  set('trace', callTrace);
  set('expected', false);

  afterEach(() => expect(trace()).to.eq(expected));

  describe('call types and ordering', () => {
    afterEach('Named with option', {}, () => trace('f'));
    afterEach('Named', () => trace('g'));
    afterEach(() => trace('h'));

    set('expected', '_fgh');
    it('all are called in order, per example', () => {expected = 'yfgh'; trace('y');});
    it('all are called in order, per example', () => {expected = 'zfgh'; trace('z');});
  });

  describe('calling with no function', () => {
    set('expected', '');
    try {
      afterEach('what even is this');
      it(noOp);
    }catch (error) {
      it('throws', () => expect(error).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    set('expected', '');
    it('throws', () => expect(
      () => afterEach('called in executor', nonExecutor)
    ).to.throw(ReferenceError, 'example block (`afterEach`) can not be defined inside another'));
  });

  describe('nesting', () => {
    beforeEach(() => trace('i'));

    describe('nested', () => {
      set('expected', 'ijk');
      beforeEach(() => trace('j'));

      it('executes parents first', () => trace('k'));
    });

    describe('siblings', () => {
      set('expected', 'il');
      it('does not execute sibling\'s hook', () => trace('l'));
    })
  });
});
