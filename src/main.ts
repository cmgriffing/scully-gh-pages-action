import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as io from '@actions/io'
import * as ioUtil from '@actions/io/lib/io-util'
import { executeScully } from './scully'

const DEFAULT_DEPLOY_BRANCH = 'master'

export async function run(): Promise<void> {
  try {
    const accessToken = core.getInput('access-token')
    if (!accessToken) {
      core.setFailed(
        'No personal access token found. Please provide one by setting the `access-token` input for this action.'
      )
      return
    }

    let deployBranch = core.getInput('deploy-branch')
    if (!deployBranch) deployBranch = DEFAULT_DEPLOY_BRANCH

    if (github.context.ref === `refs/heads/${deployBranch}`) {
      console.log(`Triggered by branch used to deploy: ${github.context.ref}.`)
      console.log('Nothing to deploy.')
      return
    }

    const pkgManager = (await ioUtil.exists('./yarn.lock')) ? 'yarn' : 'npm'
    const installCmd =
      pkgManager === 'yarn' ? 'install --frozen-lockfile' : 'ci'
    let installArgs = core.getInput('install-args')?.trim() || ''
    if (installArgs) {
      installArgs = installArgs.startsWith('--')
        ? installArgs
        : `-- ${installArgs}`
    }
    console.log(`Installing your site's dependencies using ${pkgManager}.`)
    await exec.exec(`${pkgManager} ${installCmd} ${installArgs}`.trim())
    console.log('Finished installing dependencies.')

    let buildArgs = core.getInput('build-args')?.trim() || ''
    // Add dashes if a user passes args and doesnt have them.
    if (buildArgs !== '' && !buildArgs.startsWith('-- ')) {
      buildArgs = `-- ${buildArgs}`
    }

    console.log('Ready to build your Scully site!')
    console.log(`Building with: ${pkgManager} run build ${buildArgs}`)
    await exec.exec(`${pkgManager} run build ${buildArgs}`.trim(), [])
    console.log('Finished building your site.')

    executeScully(pkgManager)

    const cnameExists = await ioUtil.exists('./CNAME')
    if (cnameExists) {
      console.log('Copying CNAME over.')
      await io.cp('./CNAME', './dist/static/CNAME', { force: true })
      console.log('Finished copying CNAME.')
    }

    const repo = `${github.context.repo.owner}/${github.context.repo.repo}`
    const repoURL = `https://${accessToken}@github.com/${repo}.git`
    console.log('Ready to deploy your new shiny site!')
    console.log(`Deploying to repo: ${repo} and branch: ${deployBranch}`)
    console.log(
      'You can configure the deploy branch by setting the `deploy-branch` input for this action.'
    )
    await exec.exec(`git init`, [], { cwd: './dist/static' })
    await exec.exec(`git config user.name`, [github.context.actor], {
      cwd: './dist/static'
    })
    await exec.exec(
      `git config user.email`,
      [`${github.context.actor}@users.noreply.github.com`],
      {
        cwd: './dist/static'
      }
    )
    await exec.exec(`git add`, ['.'], { cwd: './dist/static' })
    await exec.exec(
      `git commit`,
      ['-m', `deployed via Scully Publish Action 🎩 for ${github.context.sha}`],
      {
        cwd: './dist/static'
      }
    )
    await exec.exec(`git push`, ['-f', repoURL, `master:${deployBranch}`], {
      cwd: './dist/static'
    })
    console.log('Finished deploying your site.')

    console.log('Enjoy! ✨')
    core.setOutput('success', true)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
