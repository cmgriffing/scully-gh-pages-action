import * as core from '@actions/core';
import * as exec from '@actions/exec';

export async function installDependencies(
  pkgManager: 'yarn' | 'npm'
): Promise<void> {
  const installCmd = pkgManager === 'yarn' ? 'install --frozen-lockfile' : 'ci';
  let installArgs = core.getInput('install-args')?.trim() || '';
  if (installArgs) {
    installArgs = installArgs.startsWith('--')
      ? installArgs
      : `-- ${installArgs}`;
  }
  console.log(`Installing your site's dependencies using ${pkgManager}.`);
  await exec.exec(`${pkgManager} ${installCmd} ${installArgs}`.trim());
  console.log('Finished installing dependencies.');
}
