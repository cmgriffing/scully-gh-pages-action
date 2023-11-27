import * as exec from '@actions/exec'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import * as io from '@actions/io'
import * as ioUtil from '@actions/io/lib/io-util'

export async function deploy(
  accessToken: string,
  deployBranch: string,
  context: Context
): Promise<void> {
  const cnameExists = await ioUtil.exists('./CNAME')
  if (cnameExists) {
    console.log('Copying CNAME over.')
    await io.cp('./CNAME', './dist/static/CNAME', { force: true })
    console.log('Finished copying CNAME.')
  }

  const repo = `${context.repo.owner}/${context.repo.repo}`
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
}
