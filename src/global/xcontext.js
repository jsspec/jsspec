'use strict';

const Context = require('../context');

class XContext extends Context {}

const nullExecutor = () => {};

module.exports = {
  global(description) {
    new XContext(description, {}, nullExecutor, this.currentContext);
  }
};
