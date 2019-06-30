'use strict';

const Context = require('../context');

class XContext extends Context {}

module.exports = {
  global(description, block) {
    new XContext(description, block, this.currentContext);
  }
};
