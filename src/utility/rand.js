'use strict';

let current;

const Rand = {
  rand() {
    current = ((current << 3) ^ (current >> 30) ^ (current >> 2)) & 0x7fffffff;
    return current - 1;
  },
  randSort() { return Rand.rand() & 1 ? 1 : -1; },
  seed(value) { if (value) { current = value & 0x7fffffff; } },
  looseSeed() { return current = Math.random() * 100000 | 0; } // provides a human readable seed value (5 digits)
};

Rand.looseSeed();

module.exports = Rand;
