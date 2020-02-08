'use strict';

const fs = require('fs');
const cp = require('child_process');

const pause = () => new Promise(resolve => setTimeout(() => resolve(), 10));

let testExecutor = cp.fork('./bin/jsspec', ['-r', 'chai/register-expect', '/some/non/file', '-Rw', './watch_spec/bland.spec.js', './watch_spec/bland2.spec.js'], { stdio: 'pipe' });
let stdout = '';

let changed;

testExecutor.stdout.on('data', data => {
  stdout += data.toString();
  changed = true;
});

const awaitChange = (trigger = () => { }) => {
  changed = false;
  let count = 0;
  trigger();
  return new Promise(resolve => {
    let repeater = setInterval(() => {
      count++;
      if (changed) {
        clearInterval(repeater);
        resolve();
      }
    }, 10);
  });
};

const awaitNoChange = () => {
  let count = 0;
  changed = false;
  return new Promise(resolve => {
    let repeater = setInterval(() => {
      count++;
      if (changed) {
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

  it('can be cancelled', { timeout: 0 }, async () => {
    if (process.platform == "win32") {
      // under test, the running process has no tty, so can't handle
      // signals. Sending 'x' on the input stream provides the same behaviour
      await awaitChange(() => testExecutor.stdin.write('x'));
    } else {
      await awaitChange(() => testExecutor.kill('SIGINT'));
    }
    await awaitNoChange();
    expect(stdout).to.include('2 examples, 2 failures');
  });

  it('ran each spec for each change', () => {
    expect(stdout.split('nothing to see here')).to.have.length(4); // = run 3 times
    expect(stdout.split('expected 0 to deeply equal 1')).to.have.length(3); // = run twicd
  });

  after(() => {
    fs.writeFileSync('./watch_spec/bland.spec.js', fs.readFileSync('./watch_spec/bland.spec.js', 'utf-8').trim());
    fs.writeFileSync('./watch_spec/bland2.spec.js', fs.readFileSync('./watch_spec/bland2.spec.js', 'utf-8').trim());
  });
});
