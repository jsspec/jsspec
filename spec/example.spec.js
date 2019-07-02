'use strict';

const expect = require('chai').expect;

const Example = require('../src/example');

describe('Example', () => {
  subject('example', () => new Example(description, kind, options, block, myContext));
  set('myContext', () => ({ fullDescription: 'A Context' }));
  set('options', {});
  set('description', 'an Example');
  set('kind', 'it');
  set('block', () => (() => {}));
  describe('#fullDescription', () => {
    subject(() => example.fullDescription);

    it('contains the context description', () => {
      expect(subject).to.eql('A Context an Example');
    });
  });

  describe('#location', () => {
    subject(() => example.location);

    it('has the file and line of the instantiation', () => {
      expect(subject).to.eql(`${__filename}:8`);
    });

    context('when indexed', () => {
      it('returns the one based index locations', () => {
        example.index = [5,4,3];
        expect(subject).to.eql(`${__filename}[6:5:4]`);
      });
    });
  });
});
