import * as core from '@actions/core';
import * as github from '@actions/github';
import * as ioUtil from '@actions/io/lib/io-util';

import { buildSite } from './build';
import { deploy } from './deploy';
import { installDependencies } from './install';
import { executeScully } from './scully';

const DEFAULT_DEPLOY_BRANCH = 'master';

export async function run(): Promise<void> {
  try {
    const accessToken = core.getInput('access-token');
    if (!accessToken) {
      core.setFailed(
        'No personal access token found. Please provide one by setting the `access-token` input for this action.'
      );
      return;
    }

    let deployBranch = core.getInput('deploy-branch');
    if (!deployBranch) deployBranch = DEFAULT_DEPLOY_BRANCH;

    if (github.context.ref === `refs/heads/${deployBranch}`) {
      console.log(`Triggered by branch used to deploy: ${github.context.ref}.`);
      console.log('Nothing to deploy.');
      return;
    }

    const pkgManager = (await ioUtil.exists('./yarn.lock')) ? 'yarn' : 'npm';

    await installDependencies(pkgManager);
    await buildSite(pkgManager);
    await executeScully(pkgManager);
    await deploy(accessToken, deployBranch, github.context);

    console.log('Enjoy! ✨');
    core.setOutput('success', true);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
