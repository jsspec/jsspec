'use strict';

const locator = require('../src/locator');

describe('Location is the last callsite not in `src`', () => {
  subject('location', () => locator.location);

  it('contains the context description', () => {
    expect(subject).to.include({
      fileName: __filename,
      line: 6
    });
  });
});
