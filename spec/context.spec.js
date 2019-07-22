'use strict';

const Context = require('../src/context');

describe('Context', () => {
  set('description', 'test context');
  set('options', {});
  set('block', () => () => {});

  subject(() => new Context(description, options, block));

  beforeEach(() => {
    subject.children = [{ _location: { line: 5 } }, { _location: { line: 10 } }];
    subject.examples = [{ line: 6 },{ line: 12, index: [1] }];
  });

  describe('sub context selection', () => {
    context('with a line set', () => {
      set('options', { line: 6 });

      it('selects the last child with a line lower than `line`', () => {
        expect(subject.selectedContexts()).to.eql([0]);
      });
    });

    context('with a runIndex of depth 1 set', () => {
      set('options', { runIndex: [1] });

      it('selects no contexts', () => {
        expect(subject.selectedContexts()).to.eql([]);
      });

      it('sets the exampleIndex', () => {
        expect(subject.exampleIndex).to.eql(1);
      });
    });

    context('with a runIndex of depth 2 set', () => {
      set('options', { runIndex: [1, 2] });

      it('selects only the index of the first listed context', () => {
        expect(subject.selectedContexts()).to.eql([1]);
      });

      it('sets the sub run index', () => {
        expect(subject.runIndex).to.eql([2]);
      });
    });

    context('with a runIndex set out of range', () => {
      set('options', { runIndex: [10, 2] });

      it('selects none', () => {
        expect(subject.selectedContexts()).to.eql([]);
      });
    });
  });

  describe('example selection', () => {
    context('with a line set', () => {
      set('options', { line: 6 });

      it('selects the example on that line', () => {
        expect(subject.selectedExamples()).to.eql([0]);
      });
    });

    context('with a runIndex of depth 1 set', () => {
      set('options', { runIndex: [1] });

      it('selects the correct example', () => {
        expect(subject.selectedExamples()).to.eql([1]);
      });
    });

    context('with a runIndex of depth 2 set', () => {
      set('options', { runIndex: [1, 2] });

      it('selects no examples', () => {
        expect(subject.selectedExamples()).to.eql([]);
      });
    });

    context('with a runIndex set out of range', () => {
      set('options', { runIndex: [10] });

      it('selects none', () => {
        expect(subject.selectedExamples()).to.eql([]);
      });
    });
  });
});
