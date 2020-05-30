'use strict';

const { noOp, nonExecutor: fail } = require('../spec/spec_helper');

describe('timeout', { timeout: 20 }, () => {
  it('times out', () => new Promise(resolve => setTimeout(resolve, 100)));

  context('with a long running non-promise', () => {
    it('times out', () => {
      const time = Date.now() + 21;
      while (Date.now() < time) {
        for (let i = 0; i < 50000; i++) parseInt("0123");
      }
    });
  });
});

describe('before hook', () => {
  before(() => fail());

  it('fails on the initial call', noOp);

  context('at depth', () =>
    it('fails further calls', noOp)
  );
});

describe('after hook', () => {
  after('fails with it\'s own report', fail);

  it('block for after test', noOp);
});

describe('Error preparation', () => {
  set('code', 'const a=1; a=2;');

  it('hits the non-filename code for an eval', () => eval(code));
});

eval('describe("Location extraction", () => it("hits the non-filename code", () => { expect(1).to.eq(2)}));');


describe('Bad invocation', () => itBehavesLike('a shared example that does not exist'));
describe('Bad invocation', () => includeContext('a shared context that does not exist'));
