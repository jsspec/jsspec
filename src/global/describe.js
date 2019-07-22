'use strict';

const Context = require('../context');

class Describe extends Context {}

module.exports = {
  global(description, optionsOrBlock, block) {
    if (block instanceof Function)
      new Describe(description, optionsOrBlock, block, this.currentContext);
    else if (optionsOrBlock instanceof Function)
      new Describe(description, {}, optionsOrBlock, this.currentContext);
    else
      throw TypeError('`describe` must be provided with an executable block');
  },
  Describe
};
