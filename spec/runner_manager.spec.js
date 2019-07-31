'use spec';

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const RunnerManager = require('../src/runner_manager.js');


describe('RunnerManager', () => {
  subject('manager', () => new RunnerManager({
    watch: true,
  }));

  describe('#addWatch', () => {
    set('file', {name: __filename});

    it('only watches once', () => {
      const runFile = sinon.spy(manager, 'runFile');
      try {
        expect(manager.watched).to.have.length(0);
        manager.addWatch(file);
        expect(manager.watched).to.have.length(1);
        manager.addWatch(file);
        expect(manager.watched).to.have.length(1);
        expect(runFile).to.have.been.calledWith(file);
      } finally {
        runFile.restore();
      }
    });
  });
});
