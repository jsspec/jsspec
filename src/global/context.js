'use strict';

const Context = require('../context');

// only the globalised method sits here. The functionality is in the base class
module.exports = {
  global(description, optionsOrBlock, block) {
    if (block instanceof Function)
      new Context(description, optionsOrBlock, block, this.currentContext);
    else if (optionsOrBlock instanceof Function)
      new Context(description, {}, optionsOrBlock, this.currentContext);
    else
      throw TypeError('`context` must be provided with an executable block');
  }
};
