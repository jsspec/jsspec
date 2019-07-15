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

describe('before and after', () => {
  context('are only run if there is an example', () => {
    beforeEach(nonExecutor);
    afterEach(nonExecutor);
  });
});

describe('beforeEach', () => {
  set('ping', pinger);

  describe('beforeEach call types', () => {
    beforeEach('Named with option', {}, () => ping());
    beforeEach('Named', () => ping());
    beforeEach(() => ping());
    it('all are called', () => expect(ping()).to.eql(4)); // 4th one is for the expectation
  });

  describe('beforeEach call order', () => {
    beforeEach('first', () => ping(100, true));
    beforeEach('second', () => ping(5, true));
    it('runs in order of definition', () => expect(ping(0)).to.eql(5));
  });

  describe('calling with no function to execute', () => {
    try {
      beforeEach('what even is this');
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('fails', () =>
      expect(() =>
        beforeEach('I should throw', nonExecutor)
      ).to.throw(ReferenceError, 'example block (`beforeEach`) can not be defined inside another')
    );
  });

  describe('nested execution', () => {
    beforeEach(() => ping());

    context('one deep', () => {
      it('executes', () => {
        expect(ping()).to.eql(2);
      });

      context('two deep', () => {
        it('executes again - afresh', () =>{
          expect(ping()).to.eql(2);
        });
      });
    });

    context('parallel', () => {
      it('executes again - afresh', () =>{
        expect(ping()).to.eql(2);
      });
    });
  });
});

describe('after', () => {
  set('ping', pinger);

  describe('afterEach call types', () => {
    it('block for afterEach test', () => {});
    afterEach('Named with option', {}, () => ping());
    afterEach('Named', () => ping());
    afterEach(() => ping());
    afterEach('All are called', () => expect(ping()).to.eql(4)); // 4th one is for the expectation
  });

  describe('afterEach call order', () => {
    it('block for afterEach test', () => {});
    afterEach('first', () => ping(100, true));
    afterEach('second', () => ping(5, true));
    afterEach('runs in order of definition', () => expect(ping(0)).to.eql(5));
  });

  describe('calling with no function to execute', () => {
    try {
      afterEach('what even is this');
      it('should not execute this block', nonExecutor);
    }catch (e) {
      it('fails', () => expect(e).to.be.an.instanceOf(TypeError));
    }
  });

  describe('calling from within an example', () => {
    it('fails', () =>
      expect(() =>
        afterEach('I should throw', nonExecutor)
      ).to.throw(ReferenceError, 'example block (`afterEach`) can not be defined inside another')
    );
  });

  describe('nested execution', () => {
    set('expected', 0);
    afterEach('order is maintained', () => expect(ping(10)).to.eql(expected + 10));
    afterEach(() => ping(0, true));

    context('one deep', () => {
      set('expected', 1);
      it('block for after hook test', () => {});

      afterEach('executes last', () => {
        expect(ping()).to.eql(expected);
      });

      context('two deep', () => {
        set('expected', 2);
        let executed = 0;

        it('block for afterEach test', () => {});
        it('block 2 for afterEach test', () => {});
        afterEach(() => {
          executed ++;
          ping();
        });

        after('executes for each `it`', () => expect(executed).to.eql(2));
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
