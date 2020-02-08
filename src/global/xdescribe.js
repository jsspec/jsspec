'use strict';

const { Describe } = require('./describe');

class XDescribe extends Describe {}

const noOp = () => undefined;

module.exports = {
  global(description) {
    new XDescribe(description, {}, noOp, this.currentContext);
  }
};
