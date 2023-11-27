import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function executeScully(pkgManager: 'yarn' | 'npm'): Promise<void> {
  let scullyArgs = core.getInput('scully-args')?.trim() || '';
  // Remove dashes if the scullyArgs have them
  //  This is because we now pass --nw by default.
  if (scullyArgs.startsWith('-- ')) {
    scullyArgs = scullyArgs.slice(3);
  }

  await exec.exec(`${pkgManager} run scully -- ${scullyArgs}`.trim(), []);
  console.log('Finished Scullying your site.');
}
