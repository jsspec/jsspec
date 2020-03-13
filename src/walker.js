'use strict';

const { Glob, hasMagic } = require('glob');
const Rand = require('./utility/rand');

let promiseHold = {};

const addAll = (collected, items = []) => new Set([...collected, ...items]);

const getPromise = holder => new Promise(resolve => holder.resolve = (name) => {
  holder.resolve = null;
  resolve(name);
});

class Walker {
  constructor(globOrFileList, random) {
    this.random = random;
    this.globList = [];
    this.fileList = [];
    globOrFileList.forEach(argName => {
      // let name = argName;
      let [, name, runIndex, line] = argName.match(/^(.*?)(?:\[(\d+(?::\d+)*)]|(?::(\d+)))?$/);
      if (hasMagic(name)) {
        return this.globList.push(argName);
      }
      if (runIndex) {
        this.fileList.push({ name, runIndex: runIndex.split(':').map(value => parseInt(value) - 1) });
      } else if (line) {
        this.fileList.push({ name, line: parseInt(line) });
      } else {
        this.fileList.push({ name });
      }
    });

    this.globResults = [];
    this.responded = new Set();
    this.globs = [];
  }
  async prepareOrdered() {
    this.prepared = true;
    this.globResults = await Promise.all(this.globList.map(
      globOrFile => new Promise(resolve => new Glob(globOrFile, (_, matches) => resolve(matches)))
    )).then(results => results.reduce(addAll, []));
    this.globResults = Array.from(this.globResults);
    this.globComplete = true;
  }
  prepareRandom() {
    this.prepared = true;
    this.globs = this.globList.sort(Rand.randSort)
      .map(pattern => ({
        pattern,
        done: false,
        glob: new Glob(pattern, { nosort: true })
      }));
    this.globs.forEach(globTracker => {
      globTracker.glob.on('end', () => {
        globTracker.done = true;
        if (promiseHold.resolve && this.globs.every(({ done }) => done)) {
          promiseHold.resolve();
        }
        globTracker.glob.removeAllListeners();
      });

      globTracker.glob.on('match', (match) => {
        if (this.responded.has(match)) return;
        if (promiseHold.resolve) promiseHold.resolve(match);
        else this.globResults.push(match);
      });
    });
  }
  async nextFile() {
    let os;
    // first, try the direct list
    while (this.fileList.length) {
      os = this.random ? Rand.rand() % this.fileList.length : 0;
      const selected = this.fileList.splice(os, 1)[0];

      if (!this.responded.has(selected.name)) {
        if (!(selected.runIndex || selected.line)) {
          this.responded.add(selected.name); // we only track the ones we've run the whole file for
        }
        return selected;
      }
    }
    // return one if we have it
    while (this.globResults.length) {
      os = this.random ? Rand.rand() % this.globResults.length : 0;
      const name = this.globResults.splice(os, 1)[0];
      if (!this.responded.has(name)) {
        this.responded.add(name);
        return { name };
      }
    }
    if (this.globComplete || this.globs.every(({ done }) => done)) return;

    // wait for one - responded test is done in event handler
    // guaranteed to be unique here.
    const name = await getPromise(promiseHold);

    this.responded.add(name);
    if (name) return { name };
  }
}

async function* lister() {
  if (this.random) this.prepareRandom();
  else await this.prepareOrdered();

  while (1) {
    const value = await this.nextFile();
    if (!value) break;
    yield value;
  }
}

Walker.prototype.lister = lister;

module.exports = Walker;
