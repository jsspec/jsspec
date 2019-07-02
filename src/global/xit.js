'use strict';
const Example = require('../example');

module.exports = {
  global(description) {
    this.currentContext.addExecutor(new Example(description, 'pending', {}, () => {}, this.currentContext));
  }
};
