'use strict';

describe('timeout', {timeout: 20}, () => {
  it('times out', () => {
    return new Promise(resolve => setTimeout(resolve, 100));
  });
});

describe('before hook', () => {
  before(() => expect(1).to.eql(2));

  it('fails on the initial call', () => {});

  context('at depth', () => {
    it('fails further calls', () => {});
  });
});

describe('after hook', () => {
  after('fails with it\'s own report', () => expect(1).to.eql(2));

  it('block for after test', () => {});
});

describe('Error preparation', () => {
  set('code', 'const a=1; a=2;');

  it('hits the non-filename code for an eval', () => {
    eval(code);
  });
});

eval('describe("Location extraction", () => it("hits the non-filename code", () => { expect(1).to.eql(2)}));');


describe('Bad invocation', () => {
  itBehavesLike('a shared example that does not exist');
});

describe('Bad invocation', () => {
  includeContext('a shared context that does not exist');
});
