'use strict';

const Rand = require('../../src/utility/rand');

describe('Rand', () => {
  describe('.rand', () => {
    set('rand', () => Rand.rand());

    it('returns an positive int', () => {
      expect(rand).to.be.a('number');
      expect(rand % 1).to.equal(0);
      expect(rand).to.be.above(0);
    });

    context('successive calls', () => {
      it('returns unique values (mostly)', () => {
        const results = new Set();
        for(let i = 0; i < 10000; i++) {
          results.add(Rand.rand());
        }
        expect(results).to.have.lengthOf.above(9000);
      });
    });
  });

  describe('.randSort', () => {
    it('returns only -1 and 1', () => {
      const results = new Set();
      for(let i = 0; i < 10000; i++) {
        results.add(Rand.randSort());
      }
      expect(results).to.have.lengthOf(2);
      expect(results).to.include.keys([-1, 1]);
    });

    it('is near 50:50', () => {
      let result = 0;
      for(let i = 0; i < 100000; i++) {
        result += Rand.randSort();
      }
      expect(Math.abs(result) / 1000 | 0).to.equal(0);
    });
  });

  describe('.seed', () => {
    set('seed', 42);
    set('initialRun', () => {
      Rand.seed(seed);
      let results = [];
      for(let i=0; i < 100000; i++) { results.push(Rand.rand()) }
      return results;
    });

    context('when seeded with the same value', () => {
      set('secondSeed', 42);

      it('enables a repeatable sequence', () => {
        initialRun;
        Rand.seed(secondSeed);
        expect(initialRun.every(previous => previous === Rand.rand())).to.be.true;
      });
    });

    context('when called with a different value', () => {
      set('secondSeed', 43);

      it('is a different sequence', () => {
        initialRun;
        Rand.seed(secondSeed);
        expect(initialRun.every(previous => previous != Rand.rand())).to.be.true;
      });
    });
  });

  describe('.looseSeed', () => {
    it('creates a different seed (almost) every time', () => {
      let previous = Rand.looseSeed();
      let repeatCount = 0;
      for(let i = 0; i < 1000; i++) {
        let current = Rand.looseSeed();
        repeatCount += current === previous ? 1 : 0;
      }
      expect(repeatCount).to.be.below(5);
    });
  });
});
