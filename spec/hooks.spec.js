'use strict';
const nonExecutor = require('./spec_helper').nonExecutor;

const pinger = () => {
  let value = 0;
  return (offset = 1, set = false) => {
    if (set) value = offset;
    else value += offset;
    return value;
  };
};

describe('hooks', () => {
  context('hooks only run if there is an example', () => {
    before(nonExecutor);
    after(nonExecutor);
  });
});

describe('before', () => {
  set('ping', pinger);

  describe('before hook call types', () => {
    before('Named hook with option', {}, () => ping());
    before('Named hook', () => ping());
    before(() => ping());
    it('each hook is called', () => expect(ping()).to.eql(4)); // 4th one is for the expectation
  });

  describe('before hook call order', () => {
    before('first', () => ping(100, true));
    before('second', () => ping(5, true));
    it('runs in order of definition', () => expect(ping(0)).to.eql(5));
  });

  describe('calling with no function to execute', () => {
    try {
      before('what even is this');
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('fails', () =>
      expect(() =>
        before('I should throw', nonExecutor)
      ).to.throw(ReferenceError, 'example block (`before`) can not be defined inside another')
    );
  });

  describe('nested execution', () => {
    before(() => ping(10));
    let hasRun = false; // this is required for random order processing
    const expectedResult = () => hasRun ? 1 : 11;

    context('one deep', () => {
      it('executes', () => {
        expect(ping()).to.eql(expectedResult());
        hasRun = true;
      });

      context('two deep', () => {
        it('doesn\'t execute again', () =>{
          expect(ping()).to.eql(expectedResult());
          hasRun = true;
        });
      });
    });

    context('parallel', () => {
      it('doesn\'t execute again', () =>{
        expect(ping()).to.eql(expectedResult());
        hasRun = true;
      });
    });
  });
});

describe('after', () => {
  set('ping', pinger);

  describe('after hook call types', () => {
    it('block for after hook test', () => {});
    after('Named hook with option', {}, () => ping());
    after('Named hook', () => ping());
    after(() => ping());
    after('each hook is called', () => expect(ping()).to.eql(4)); // 4th one is for the expectation
  });

  describe('after hook call order', () => {
    it('block for after hook test', () => {});
    after('first', () => ping(100, true));
    after('second', () => ping(5, true));
    after('runs in order of definition', () => expect(ping(0)).to.eql(5));
  });

  describe('calling with no function to execute', () => {
    try {
      after('what even is this');
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('fails', () =>
      expect(() =>
        after('I should throw', nonExecutor)
      ).to.throw(ReferenceError, 'example block (`after`) can not be defined inside another')
    );
  });

  describe('nested execution', () => {
    after('order is maintained', () => expect(ping(10)).to.eql(12));
    after(() => ping(0, true));

    context('one deep', () => {
      it('block for after hook test', () => {});

      after('executes', () => expect(ping()).to.eql(2));

      context('two deep', () => {
        it('block for after hook test', () => {});
        it('block 2 for after hook test', () => {});

        after('executes only once', () => expect(ping()).to.eql(1));
      });
    });
  });
});

describe('after hook ends block execution', { random: false }, () => {
  set('ping', pinger);

  context('after hook runner', () => {
    after(() => ping(100, true));
    it('block for after hook test', () => {});
  });

  context('new block run', () => {
    it('is a clean block', () => expect(ping()).to.eql(1));
  });
});
