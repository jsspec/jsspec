'use strict';

const { Describe } = require('./describe');

class XDescribe extends Describe {}

module.exports = {
  global(description) {
    new XDescribe(description, {}, () => {}, this.currentContext);
  }
};
