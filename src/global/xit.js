'use strict';
const {Example} = require('./it');

class XExample extends Example {}

module.exports = {
  global(description) {
    this.currentContext.addExecutor(new XExample(description, {}, () => {}, this.currentContext));
  }
};
