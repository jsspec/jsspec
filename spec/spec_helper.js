'use strict';

const nonExecutor = () => expect(false).to.be.true;

try {
  nonExecutor();
}catch (_) { void(_); }

exports.nonExecutor = nonExecutor;
