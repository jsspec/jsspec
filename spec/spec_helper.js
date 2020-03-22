'use strict';

const nonExecutor = () => expect(false).to.be.true;

try { nonExecutor(); }catch (_) { }

const noOp = () => undefined;

const callTrace = () => {
  let value = "";
  return (key = '') => value += key;
};

exports.noOp = noOp;
exports.callTrace = callTrace;
exports.nonExecutor = nonExecutor;
