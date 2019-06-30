'use strict';

const Context = require('../context');

// only the globalised method sits here. The functionallity is in the base class
module.exports = {
  global(description, optionsOrBlock, block) {
    let context;
    if (block instanceof Function)
      context = new Context(description, optionsOrBlock, block, this.currentContext);
    else if (optionsOrBlock instanceof Function)
      context = new Context(description, {}, optionsOrBlock, this.currentContext);
    else
      throw TypeError('`context` must be provided with an executable block');
    context.prepare();
  }
};
