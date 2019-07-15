'use strict';

const cp = require('child_process');

const absolute = require('path').join(process.cwd(), 'fail_spec/bad_format.spec.js');
let spawned = cp.spawnSync(process.argv[0], [process.argv[1], '-r', 'not/a/file.js', absolute, '--', './fail_spec/failure.spec.js', './fail_spec/not.a.file.js', absolute], { stdio: 'pipe' });

let result = spawned.stdout.toString();

describe('failures', () => {
  set('failures', 6);
  set('total', () => failures);

  it('fails as expected', () => {
    expect(result).to.include(`${total} examples, ${failures} failures`);
    // timeout
    expect(result).to.match(/\d+\) timeout times out/);
    expect(result).to.match(/example timeout \(200ms\) exceeded/);

    // missing file
    expect(result).to.match(/LOAD ERROR (\{ )?Error: Cannot find module.*not\.a\.file\.js/);
    // bad file
    expect(result).to.match(/LOAD ERROR (\{ )?TypeError: Assignment to constant variable./);
    // failure in before hook
    expect(result).to.match(/\d+\) before hook fails on the initial call/);
    expect(result).to.match(/\d+\) before hook at depth fails further calls/);

    // failure in after hook
    expect(result).to.match(/\d+\) after hook In after hook: fails with it's own report/);

    // TODO: silently ignores missing require files - and bad file

    // Error preparation coverage
    expect(result).to.match(/\d+\) Error preparation hits the non-filename code for an eval/);
    expect(result).to.match(/\d+\) Location extraction hits the non-filename code/);
  });
});
