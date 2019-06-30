'use strict';

const Context = require('../context');

class Describe extends Context {}

module.exports = {
  global(description, optionsOrBlock, block) {
    let context;
    if (block instanceof Function)
      context = new Describe(description, optionsOrBlock, block, this.currentContext);
    else if (optionsOrBlock instanceof Function)
      context = new Describe(description, {}, optionsOrBlock, this.currentContext);
    else
      throw TypeError('`describe` must be provided with an executable block');
    context.prepare();
  },
  Describe
};
