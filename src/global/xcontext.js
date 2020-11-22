'use strict';

const Context = require('../context');

class XContext extends Context {}

const noOp = () => undefined;

module.exports = {
  global(description) {
    new XContext(description, {}, noOp, this.currentContext);
  },
};
