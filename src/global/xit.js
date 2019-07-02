'use strict';
const {Example} = require('./it');

module.exports = {
  global(description) {
    this.currentContext.addExecutor(new Example(description, 'pending', {}, () => {}, this.currentContext));
  }
};
