'use strict';

/* c8 ignore next */
const nonExecutor = () => expect(false).to.be.true;

const noOp = () => undefined;

const callTrace = () => {
  let value = '';
  return (key = '') => (value += key);
};

module.exports = { noOp, callTrace, nonExecutor };
