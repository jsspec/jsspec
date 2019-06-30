class Walker {
  constructor(fileList) {
    this.fileList = fileList;
  }
  get all() {
    return Array.from(this.fileList);
  }
}

module.exports = Walker;