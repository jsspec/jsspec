'use strict';

const nonExecutor = require('./spec_helper').nonExecutor;

describe('running', function funThing() {
  set('first', () => 1);
  subject('second', () => 2);

  subject('not 2');

  it('nests correctly', { timeout: 0 }, () => {
    expect(second).to.eql(2);
    expect(subject).to.eql('not 2');
  });

  context('nested', () => {
    subject('second', 3);

    it('runs this test', () => {
      let finale = global['first'];
      expect(finale).to.eql(1);

      first = 'changed';
      expect(first).to.eql('changed');

      expect(subject).to.eql(3);
      expect(second).to.eql(3);

      subject = 'not 3';
      expect(subject).to.eql('not 3');
      expect(second).to.eql(3);
    });

    [1, 2].forEach(nr => {
      it(`runs test in nested iterators (${nr})`, () =>
        expect([1, 2]).to.include.members([nr])
      );
    });
  });
});

xcontext('pending context');
xdescribe('pending describe');

describe('directly assigning to a `set` variable', () => {
  set('target', 1);

  it('assigning a value works', () => {
    target = 5;
    expect(target).to.eql(5);
  });

  it('assigning a value works', () => {
    target = input => input * 5;
    expect(target).to.be.an.instanceOf(Function);
    expect(target(2)).to.eql(10);
  });
});

context('running2', function funThing2() {
  describe('nested2', () => {
    xcontext('nested pending context');

    it('runs this test', () =>
      expect(() => expect(subject).to.be(1)).to.throw(ReferenceError, /Subject is not defined in this context/)
    );

    xit('nested pending example (xit)', nonExecutor);
    pend('nested pending example (pend)', nonExecutor);
  });
});

describe('using keys that are not set in the context', {random: false}, () => {
  context('not defined yet here', () => {
    it('fails', () =>
      expect(() => isSet).to.throw(ReferenceError, 'isSet is not defined')
    );
  });

  context('set here', () => {
    set('isSet', () => 1);
    it('works', () =>
      expect(() => isSet).not.to.throw()
    );
  });

  context('not set here', () => {
    it('fails', () =>
      expect(() => isSet).to.throw(ReferenceError, '`isSet` is not set in this context')
    );
  });
});

describe('calling set with a non string', () => {
  try {
    set(Symbol('badness'), 5);
    it('should not execute this block', nonExecutor);
  }catch (e) {
    it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
  }
});

describe('accessing a `set` value outside of an example', () => {
  set('value', 1);
  try {
    let otherValue = value; // eslint-disable-line no-unused-vars
    it('should not execute this block', nonExecutor);
  }catch (e) {
    it('fails', () => expect(e).to.be.an.instanceOf(ReferenceError));
  }
});

describe('setting a class', () => {
  class Test {}
  set('testClass', Test);
  it('returns the constructor', () =>
    expect(new testClass()).to.be.an.instanceOf(Test)
  );
});

describe('_coverage_', { timeout: 0 }, () => {
  describe('accessing an already computed value', () => {
    set('value', () => 7);

    it('retrieves the already computed value', () => {
      expect(value).to.eql(7);
      expect(value * 2).to.eql(14);
    });
  });
});

describe('incorrect nesting', () => {
  set('value', 1);
  context('assigning to a value outside of an example', {timeout: 200}, () => {
    try {
      value = 2;
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(ReferenceError));
    }

    it('should not execute here', () => {
      expect(value).to.eql(1);
      value = 3;
      expect(value).to.eql(3);
    });
  });

  it('calling set within an example is not allowed', () => {
    expect(() =>
      set('newThing', 0)
    ).to.throw(ReferenceError, 'Setting lazy evaluators within a running context is not permitted');
  });

  it('nesting "it" blocks is not allowed', () => {
    expect(() =>
      it('this is not good', nonExecutor)
    ).to.throw(ReferenceError, 'example block (`it`) can not be defined inside another');
  });

  it('contexts in "it" blocks are not allowed', () => {
    expect(() => 
      context('this is not good', nonExecutor)
    ).to.throw(ReferenceError, 'A context block can not be defined inside an example');
  });
  const wrap = () => it('finds a wrapped function', () =>
    expect(1).to.eql(1)
  );
  wrap();
});

describe('calling without blocks', () => {
  describe('describe', () => {
    try {
      describe('no block');
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
    }
  });
  describe('context', () => {
    try {
      context('no block');
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
    }
  });
  describe('it', () => {
    try {
      it('no block');
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
    }
  });
});
