'use strict';

const { Describe } = require('./describe');

class XDescribe extends Describe {}

const nullExecutor = () => {};

module.exports = {
  global(description) {
    new XDescribe(description, {}, nullExecutor, this.currentContext);
  }
};
