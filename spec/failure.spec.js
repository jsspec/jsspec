'use strict';

const cp = require('child_process');

const result = cp.spawnSync(process.argv[0], [process.argv[1], '-r', './not/a/file.js', '--', './fail_spec/failure.spec.js', './fail_spec/not.a.file.js'], { stdio: 'pipe' }).stdout.toString();

describe('failures', () => {
  set('failures', 5);

  it('fails as expected', () => {
    expect(result).to.include(`${failures} examples, ${failures} failures`);
    // timeout
    expect(result).to.match(/\d+\) timeout times out/);
    expect(result).to.match(/example timeout \(200ms\) exceeded/);

    // missing file
    expect(result).to.match(/LOAD ERROR Error: Cannot find module.*not\.a\.file\.js/);

    // failure in before hook
    expect(result).to.match(/\d+\) hooks fails on the initial call/);
    expect(result).to.match(/\d+\) hooks at depth fails further calls/);

    // silently ignores missing require files

    // Error preparation coverage
    expect(result).to.match(/\d+\) Error preparation hits the non-filename code for an eval/);
    expect(result).to.match(/\d+\) Location extraction hits the non-filename code/);
  });
});
