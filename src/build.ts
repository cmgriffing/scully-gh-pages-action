import * as core from '@actions/core'
import * as exec from '@actions/exec'

export async function buildSite(pkgManager: 'yarn' | 'npm'): Promise<void> {
  let buildArgs = core.getInput('build-args')?.trim() || ''
  // Add dashes if a user passes args and doesnt have them.
  if (buildArgs !== '' && !buildArgs.startsWith('-- ')) {
    buildArgs = `-- ${buildArgs}`
  }

  console.log('Ready to build your Scully site!')
  console.log(`Building with: ${pkgManager} run build ${buildArgs}`)
  await exec.exec(`${pkgManager} run build ${buildArgs}`.trim(), [])
  console.log('Finished building your site.')
}
