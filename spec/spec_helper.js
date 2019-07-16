'use strict';

const nonExecutor = () => expect(false).to.be.true;

try {
  nonExecutor();
}catch (_) { void(_); }


const pinger = () => {
  let value = 0;
  return (offset = 1, set = false) => {
    if (set) value = offset;
    else value += offset;
    return value;
  };
};

exports.pinger = pinger;
exports.nonExecutor = nonExecutor;
