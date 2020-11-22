'use strict';

const { Glob, hasMagic } = require('glob');
const Rand = require('./utility/rand');

const promiseHold = {};

const getPromise = () =>
  new Promise(
    resolve =>
      (promiseHold.resolve = name => {
        promiseHold.resolve = null;
        resolve(name);
      })
  );

const resolveGlob = globOrFile => new Promise(resolve => new Glob(globOrFile, (_, matches) => resolve(matches)));

class FileDetail {
  static get re() {
    return /^(.*?)(?:\[(\d+(?::\d+)*)]|(?::(\d+)))?$/;
  }

  constructor(exampleSelector) {
    let [, name, runIndex, runLine] = exampleSelector.match(FileDetail.re);
    this.runIndex = runIndex && runIndex.split(':').map(value => parseInt(value) - 1);
    this.name = name;
    this.runLine = runLine && parseInt(runLine);
  }
  get magic() {
    return hasMagic(this.name);
  }
  get directed() {
    return this.runLine || this.runIndex;
  }
}

const nameToDetail = name => ({ name });

const addAll = (collected, items = []) => [...collected, ...items];
const flat = results => results.reduce(addAll, []);

const uniqueDetails = names => Array.from(new Set(flat(names)), nameToDetail);

class Walker {
  constructor(globOrFileList, random) {
    this.random = random;
    this.globList = [];
    this.fileList = [];
    globOrFileList.forEach(argName => {
      const detailed = new FileDetail(argName);
      if (detailed.magic) {
        return this.globList.push(argName);
      }
      this.fileList.push(detailed);
    });
    this.responded = new Set();
    this.globs = [];
  }

  async prepareOrdered() {
    const globResults = await Promise.all(this.globList.map(resolveGlob)).then(uniqueDetails);
    this.fileList = [...this.fileList, ...globResults];
    this.globComplete = true;
  }
  prepareRandom() {
    this.globs = this.globList.sort(Rand.randSort).map(pattern => ({
      pattern,
      done: false,
      glob: new Glob(pattern, { nosort: true }),
    }));
    this.globs.forEach(globTracker => {
      globTracker.glob
        .on('end', () => {
          globTracker.glob.removeAllListeners();

          globTracker.done = true;
          /* c8 ignore next 3 */
          if (promiseHold.resolve && this.globs.every(({ done }) => done)) {
            promiseHold.resolve();
          }
        })
        .on('match', name => {
          if (this.responded.has(name)) return;
          if (promiseHold.resolve) promiseHold.resolve(name);
          else this.fileList.push({ name });
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
        if (!selected.directed) {
          this.responded.add(selected.name); // we only track the ones we've run the whole file for
        }
        return selected;
      }
    }
    if (this.globComplete || this.globs.every(({ done }) => done)) return;

    // wait for one - responded test is done in event handler
    // guaranteed to be unique here.
    const name = await getPromise();

    this.responded.add(name);
    if (name) return { name };
  }
}

Walker.prototype.lister = async function* lister() {
  if (this.random) this.prepareRandom();
  else await this.prepareOrdered();

  while (1) {
    const value = await this.nextFile();
    if (!value) break;
    yield value;
  }
};

module.exports = Walker;
