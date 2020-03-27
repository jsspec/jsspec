'use strict';

const Walker = require('../src/walker');

describe('Walker', () => {
  set('random', true);

  describe('constructor', () => {
    set('list', []);
    subject(() => new Walker(list, random));

    context('with a line marker', () => {
      set('list', ['file:17']);

      it('adds a file with a line', () => {
        expect(subject.fileList[0]).to.include({ runLine: 17 });
      });
    });

    context('with an index marker', () => {
      set('list', ['file[11:17]']);

      it('adds a file with a line', () => {
        expect(subject.fileList[0]).to.deep.include({ runIndex: [10, 16] });
      });
    });
  });
});
