'use strict';

const fs = require('fs');
const cp = require('child_process');

let testExecutor = cp.fork('./bin/jsspec', ['-r', 'chai/register-expect', '/some/non/file', '-Rw', './watch_spec/bland.spec.js', './watch_spec/bland2.spec.js'], { stdio: 'pipe' });
let stdout = '';

let changed;

testExecutor.stdout.on('data', data => {
  stdout += data.toString();
  changed = true;
});

const awaitChange = async (trigger = () => { }) => {
  changed = false;
  await trigger();
  return new Promise(resolve => {
    let repeater = setInterval(() => {
      if (changed) {
        clearInterval(repeater);
        resolve();
      }
    }, 50);
  });
};

const awaitNoChange = () => {
  changed = false;
  return new Promise(resolve => {
    let repeater = setInterval(() => {
      if (changed) {
        /* c8 ignore next */
        changed = false;
      } else {
        clearInterval(repeater);
        resolve();
      }
    }, 50);
  });
};

describe('watched', { random: false }, () => {
  it('runs without a summary', { timeout: 0 }, async () => {
    await awaitChange();
    await awaitNoChange();
    expect(stdout).not.to.match(/.* examples?, .* failure/);
    await awaitChange(() => new Promise(resolve => fs.writeFile('./watch_spec/bland2.spec.js', ' ', { flag: 'a' }, resolve)));
    await awaitNoChange();
    await awaitChange(() => new Promise(resolve => fs.writeFile('./watch_spec/bland.spec.js', ' ', { flag: 'a' }, resolve)));
    await awaitNoChange();
    await awaitChange(() => new Promise(resolve => fs.writeFile('./watch_spec/bland2.spec.js', ' ', { flag: 'a' }, resolve)));
    await awaitNoChange();

    expect(stdout).not.to.match(/.* examples?, .* failure/);
  });

  it('can be cancelled to end', { timeout: 0 }, async () => {
    if (process.platform == "win32") {
      // On windows, under test, the running process has no tty, so can't handle
      // signals. Sending 'x' on the input stream provides the same behaviour
      await awaitChange(() => testExecutor.stdin.write('x'));
    } else {
      await awaitChange(() => testExecutor.kill('SIGINT'));
    }
    await awaitNoChange();

    expect(stdout).to.match(/.* examples?, .* failure/);
  });

  it('ran each spec for each change', () => {
    // a file change can sometimes trigger the watcher more than once.
    // this doesn't really matter as only failures are reported, and the same ones
    // would appear anyway.
    expect(stdout.split('nothing to see here')).to.have.a.lengthOf.at.least(4); // = run at least 3 times
    expect(stdout.split('expected 0 to deeply equal 1')).to.have.a.lengthOf.at.least(3); // = run at least twice
  });

  after(() => {
    fs.writeFileSync('./watch_spec/bland.spec.js', fs.readFileSync('./watch_spec/bland.spec.js', 'utf-8').trim());
    fs.writeFileSync('./watch_spec/bland2.spec.js', fs.readFileSync('./watch_spec/bland2.spec.js', 'utf-8').trim());
  });
});
