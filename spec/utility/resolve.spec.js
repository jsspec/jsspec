'use strict';

const resolve = require('../../src/utility/resolve');

describe('resolve', () => {
  context('when the error is not related to the fs', () => {
    it('throws the original error', () => {
      expect(() => resolve({ not: 'a string' })).to.throw(TypeError);
    });
  });
});
