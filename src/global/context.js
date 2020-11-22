'use strict';

const Context = require('../context');

// only the globalised method sits here. The functionality is in the base class
module.exports = {
  global(description, optionOrBlock, block) {
    if (block instanceof Function) {
      /* noop */
    } else if (optionOrBlock instanceof Function) [optionOrBlock, block] = [{}, optionOrBlock];
    else throw TypeError('`context` must be provided with an executable block');

    new Context(description, optionOrBlock, block, this.currentContext);
  },
};
