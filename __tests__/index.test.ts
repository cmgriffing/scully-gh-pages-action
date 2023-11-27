import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as io from '@actions/io'
import * as path from 'path'

import { run } from '../src/main'

const originalContext = { ...github.context }
const originalGitHubWorkspace = process.env['GITHUB_WORKSPACE']
const gitHubWorkspace = path.resolve('/checkout-tests/workspace')

type InputsMock = {
  [name: string]: string
}

let inputs: InputsMock = {}
let execSpy: jest.SpyInstance

beforeAll(() => {
  execSpy = jest.spyOn(exec, 'exec').mockImplementation(jest.fn())
  jest.spyOn(io, 'cp').mockImplementation(jest.fn())

  jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
    return inputs[name]
  })

  jest.spyOn(github.context, 'repo', 'get').mockImplementation(() => {
    return {
      owner: 'foo',
      repo: 'foo.github.io'
    }
  })

  github.context.ref = 'refs/heads/some-ref'
  github.context.sha = '1234567890123456789012345678901234567890'

  process.env['GITHUB_WORKSPACE'] = gitHubWorkspace
})

afterAll(() => {
  delete process.env['GITHUB_WORKSPACE']
  if (originalGitHubWorkspace) {
    process.env['GITHUB_WORKSPACE'] = originalGitHubWorkspace
  }

  github.context.ref = originalContext.ref
  github.context.sha = originalContext.sha

  jest.restoreAllMocks()
})

beforeEach(() => {
  jest.resetModules()
  inputs = {
    'access-token': 'SECRET'
  }
})

describe('scully Publish action', () => {
  it('returns an error when no access token is given', async () => {
    inputs['access-token'] = ''
    const setFailedSpy = jest.spyOn(core, 'setFailed')

    await run()

    expect(setFailedSpy).toHaveBeenCalledWith(
      'No personal access token found. Please provide one by setting the `access-token` input for this action.'
    )
  })

  it('calls the install script without additional args', async () => {
    inputs['install-args'] = ''

    await run()

    expect(execSpy).toHaveBeenCalledWith('npm ci')
  })

  it('calls the install script with additional args', async () => {
    inputs['install-args'] = '--force'

    await run()

    expect(execSpy).toHaveBeenCalledWith('npm ci --force')
  })

  it('skips if deploy branch is the same as the current git head', async () => {
    inputs['deploy-branch'] = 'some-ref'
    github.context.ref = 'refs/heads/some-ref'

    await expect(run()).resolves.not.toThrow()
  })

  it('calls angular build without args', async () => {
    inputs['build-args'] = ''
    inputs['scully-args'] = ''

    await run()

    expect(execSpy).toHaveBeenCalledWith('npm run build', [])
  })

  it('calls angular build with args', async () => {
    inputs['build-args'] = '--prefix-paths --no-uglify'
    inputs['scully-args'] = ''

    await run()

    expect(execSpy).toHaveBeenCalledWith(
      'npm run build -- --prefix-paths --no-uglify',
      []
    )
  })
})
