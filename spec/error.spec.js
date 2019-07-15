'use strict';

const nonExecutor = require('./spec_helper').nonExecutor;

describe('Error stack preparation', () => {
  subject('error', () => { throw Error('hello'); });

  context('when not DEBUGging', () => {
    it('contains the context description', () => {
      try {
        subject;
        nonExecutor();
      }catch (error) {
        expect(error.stack).not.to.match(/.src.global.(it|set|subject)\.js/);
      }
    });
  });

  context('when DEBUGging', () => {
    it('keeps the full stack', () => {
      process.env.DEBUG = 1;
      try {
        subject;
        nonExecutor();
      }catch (error) {
        expect(error.stack).to.match(/.src.global.(it|set|subject)\.js/);
      }
      delete process.env.DEBUG;
    });
  });
});
