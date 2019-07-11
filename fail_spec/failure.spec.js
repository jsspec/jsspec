'use strict';

const { expect } = require('chai');

describe('timeout', {timeout: 200}, () => {
  it('times out', () => {
    return new Promise(resolve => setTimeout(resolve, 300));
  });
});

describe('hooks', () => {
  before(() => expect(1).to.eql(2));

  it('fails on the initial call', () => {});

  context('at depth', () => {
    it('fails further calls', () => {});
  });
});

describe('Error preparation', () => {
  set('code', 'const a=1; a=2;');

  it('hits the non-filename code for an eval', () => {
    eval(code);
  });
});

eval('describe("Location extraction", () => it("hits the non-filename code", () => { expect(1).to.eql(2)}));');
