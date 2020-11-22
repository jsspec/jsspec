'use strict';
const filterStack = require('../src/filter_stack');

const { nonExecutor } = require('./spec_helper');

describe('Error stack preparation', () => {
  subject('error', () => {
    throw Error('hello');
  });

  it('contains the context description', () => {
    try {
      subject;
      nonExecutor();
    } catch (error) {
      expect(error.stack).not.to.match(/.src.global.(it|set|subject)\.js/);
    }
  });

  context('when DEBUGging', () => {
    it('keeps the full stack', () => {
      process.env.DEBUG = 1;
      try {
        subject;
        nonExecutor();
      } catch (error) {
        expect(error.stack).to.match(/.src.global.(it|set|subject)\.js/);
      }
      delete process.env.DEBUG;
    });
  });

  context('when stack prep has been overridden', () => {
    set('replacementPrep', () => (error, stack) => [error, ...stack.map(frame => frame.toString().replace(/\((.*)\)/g, '(replaced $1)'))].join('\n    at '));

    it('filters, but returns the `original`', () => {
      try {
        subject;
        nonExecutor();
      } catch (error) {
        filterStack(error, replacementPrep);
        expect(error.stack).not.to.match(/.src.global.(it|set|subject)\.js/);
        expect(error.stack).to.include('(replaced ');
      }
    });

    context('with debug set', () => {
      it('keeps the full (original) stack', () => {
        process.env.DEBUG = 1;
        try {
          subject;
          nonExecutor();
        } catch (error) {
          filterStack(error, replacementPrep);
          expect(error.stack).to.match(/.src.global.(it|set|subject)\.js/);
          expect(error.stack).to.include('(replaced ');
        }
        delete process.env.DEBUG;
      });
    });
  });
});
