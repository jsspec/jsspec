'use strict';

const Context = require('../context');

class Describe extends Context {}

module.exports = {
  global(description, optionOrBlock, block) {
    if (block instanceof Function) { /* noop */ }
    else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else throw TypeError('`describe` must be provided with an executable block');

    new Describe(description, optionOrBlock, block, this.currentContext);
  },
  Describe
};
