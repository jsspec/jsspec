'use strict';

const cp = require('child_process');

const absolute = require('path').join(process.cwd(), 'fail_spec/bad_format.spec.js');
let spawned = cp.spawnSync(process.argv[0], ['./bin/jsspec', '-r', 'not/a/file.js', absolute, '-RR', './fail_spec/*.spec.js', './fail_spec/not.a.file.js', absolute], { stdio: 'pipe' });

let result = spawned.stdout.toString();

describe('failures', () => {
  set('failures', 8);
  set('contextLevelFailures', 2);
  set('total', () => failures - contextLevelFailures);

  it('exits with a non-zero result', () => {
    expect(spawned.status).not.to.eql(0);
  });

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
    expect(result).to.match(/\d+\) \[In after hook\] after hook fails with it's own report/);

    // TODO: silently ignores missing require files - and bad file

    // Error preparation coverage
    expect(result).to.match(/\d+\) Error preparation hits the non-filename code for an eval/);
    expect(result).to.match(/\d+\) Location extraction hits the non-filename code/);

    // Bad invocation
    expect(result).to.match(/\d+\) Bad invocation/);
    expect(result).to.include('No shared example named \'a shared example that does not exist\' available in this context');
    expect(result).to.include('No shared context named \'a shared context that does not exist\' available in this context');

  });
});
