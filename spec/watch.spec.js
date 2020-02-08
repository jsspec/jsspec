'use strict';

const fs = require('fs');
const cp = require('child_process');

let spawned = cp.spawn(process.argv[0], ['./bin/jsspec', '-r', 'chai/register-expect', '/some/non/file', '-Rw', './watch_spec/bland.spec.js', './watch_spec/bland2.spec.js'], { stdio: 'pipe' });

let stdout = '';

spawned.stdout.on('data', data => stdout += data.toString());

describe('watched', () => {
  it('can be cancelled', { timeout: 4000 }, () => {
    return new Promise(resolve => spawned.stdout.on('data', data => {
      if (resolve && data.toString().includes('does nothing')) {
        expect(stdout).not.to.match(/\d* examples?, \d* failures?/);

        fs.writeFile('./watch_spec/bland2.spec.js', ' ', { flag: 'a' },
          () => setTimeout(
            () => {
              fs.writeFileSync('./watch_spec/bland.spec.js', ' ', { flag: 'a' });
              fs.writeFile('./watch_spec/bland2.spec.js', ' ', { flag: 'a' },
                () => setTimeout(() => {
                  if (resolve) resolve();
                  resolve = null;
                }, 100)
              );
            }, 20));
      }
    })).then(() => new Promise(resolve => spawned.stdout.on('data', data => {
      if (resolve && data.toString().includes('does nothing')) {
        setTimeout(() => {
          if (resolve) resolve();
          resolve = null;
        }, 100);
      }
    }))).then(() => new Promise(resolve => {
      spawned.kill('SIGINT');
      spawned.once('exit', () => {
        expect(stdout).to.include('2 examples, 2 failures');
        expect(stdout.split('nothing to see here')).to.have.length(3); // = run twice only
        resolve();
      });
    }));
  });

  after(() => {
    fs.writeFileSync('./watch_spec/bland.spec.js', fs.readFileSync('./watch_spec/bland.spec.js', 'utf-8').trim());
    fs.writeFileSync('./watch_spec/bland2.spec.js', fs.readFileSync('./watch_spec/bland2.spec.js', 'utf-8').trim());
  });
});

