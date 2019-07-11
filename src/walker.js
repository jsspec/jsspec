'use strict';

class Walker {
  constructor(fileList) {
    this.fileList = [...fileList];
  }
  get all() {
    return [...this.fileList];
  }
}

module.exports = Walker;