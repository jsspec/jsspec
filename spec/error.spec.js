'use strict';

const expect = require('chai').expect;

const nonExecutor = () => expect(false).to.be.true;

describe('Error stack preparation', () => {
  subject('error', () => { throw Error('hello'); });

  context('when not DEBUGging', () => {
    it('contains the context description', () => {
      const pre = process.env.DEBUG;
      process.env.DEBUG='';
      try{
        subject;
        nonExecutor();
      } catch(error) {
        expect(error.stack).not.to.match(/.src.global.(it|set|subject)\.js/);
      }
      process.env.DEBUG = pre;
    });
  });

  context('when DEBUGging', () => {
    it('keeps the full stack', () => {
      const pre = process.env.DEBUG;
      process.env.DEBUG=1;
      try{
        subject;
        nonExecutor();
      } catch(error) {
        expect(error.stack).to.match(/.src.global.(it|set|subject)\.js/);
      }
      process.env.DEBUG = pre;
    });
  });
});
