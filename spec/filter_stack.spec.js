'use strict';
const filterStack = require('../src/filter_stack');

const nonExecutor = require('./spec_helper').nonExecutor;

describe('Error stack preparation', () => {
  subject('error', () => { throw Error('hello'); });

  it('contains the context description', () => {
    try {
      subject;
      nonExecutor();
    }catch (error) {
      filterStack(error);
      expect(error.stack).not.to.match(/.src.global.(it|set|subject)\.js/);
    }
  });

  context('when DEBUGging', () => {
    it('keeps the full stack', () => {
      process.env.DEBUG = 1;
      try {
        subject;
        nonExecutor();
      }catch (error) {
        filterStack(error);
        expect(error.stack).to.match(/.src.global.(it|set|subject)\.js/);
      }
      delete process.env.DEBUG;
    });
  });

  context('when stack prep has been overridden', () => {
    let storedPrep;
    before('override stack prep', () => {
      storedPrep = Error.prepareStackTrace;
      Error.prepareStackTrace = (error, stack) => [
        error,
        ...stack.map(frame => frame.toString().replace(/\((.*)\)/g, '(replaced $1)'))
      ].join('\n    at ');
    });

    after('return stack prep', () => Error.prepareStackTrace = storedPrep);

    it('filters, but returns the `original`', () => {
      try {
        subject;
        nonExecutor();
      }catch (error) {
        filterStack(error);
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
        }catch (error) {
          filterStack(error);
          expect(error.stack).to.match(/.src.global.(it|set|subject)\.js/);
          expect(error.stack).to.include('(replaced ');
        }
        delete process.env.DEBUG;
      });
    });
  });
});
