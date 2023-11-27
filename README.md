# Scully Publish

GitHub Action to build and deploy your Scully site to GitHub Pages ❤️🎩

## Node Version

As of Angular 12, you will need to explicitly set you Node version since the `node12` within Github actions is outdated.

You can set it as your node version using [setup-node](https://github.com/actions/setup-node):

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: actions/setup-node@v2
        with:
          node-version: "20"
      - uses: cmgriffing/scully-gh-pages-action@v11
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
```

## Usage

This GitHub Action will run `npm run build --prod && npm run scully` at the root of your repository and
deploy it to GitHub Pages for you! Here's a basic workflow example:

```yml
name: Scully Publish

on:
  push:
    branches:
      - master

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: cmgriffing/scully-gh-pages-action@v11
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
```

> **NOTE:** In order to support `npm` and `yarn`, this Action relies on having a
> `build` script defined in your `package.json` file. Angular automatically creates one for you when you create a project via Angular CLI.

### Knobs & Handles

This Action is fairly simple but it does provide you with a couple of
configuration options:

- **access-token**: A [GitHub Personal Access Token][github-access-token] with
  the `repo` scope. This is **required** to push the site to your repo after
  Scully finishes building it. You should store this as a [secret][github-repo-secret]
  in your repository. Provided as an [input][github-action-input].

- **deploy-branch**: The branch expected by GitHub to have the static files
  needed for your site. For org and user pages it should always be `master`.
  This is where the output of `npm run scully` will be pushed to. Provided as an
  [input][github-action-input].
  Defaults to `master`.

- **build-args**: Additional arguments that get passed to `npm run build`. See the
  [Angular documentation][angular-build-docs] for a list of allowed options.
  Provided as an [input][github-action-input].
  Defaults to nothing.

- **scully-args**: Additional arguments that get passed to `npm run scully`. See the
  [Scully documentation][scully-build-docs] for a list of allowed options.
  Provided as an [input][github-action-input].
  Defaults to nothing.

### Org or User Pages

Create a repository with the format `<YOUR/ORG USERNAME>.github.io`, push your
Scully source code to a branch other than `master` and add this GitHub Action to
your workflow! 🚀😃

<!-- ### Repository Pages

Repo pages give you the option to push your static site to either `master` or
`gh-pages` branches. They also work a little different because the URL includes
a trailing path with the repository name, like
`https://username.github.io/reponame/`. You need to tell Scully what the path
prefix is via `gatsby-config.js`:

```js
module.exports = {
  pathPrefix: "/reponame"
};
```

Additionally, you need to tell the `gatsby build` command to use it by passing
the `--prefix-paths` as an argument. Here's an example workflow for that:

```yml
name: Scully Publish

on:
  push:
    branches:
      - dev

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: enriikke/gatsby-gh-pages-action@v2
        with:
          access-token: ${{ secrets.ACCESS_TOKEN }}
          deploy-branch: gh-pages
          gatsby-args: --prefix-paths
``` -->

### CNAME

You have a custom domain you would like to use? Fancy! 😎 This Action's got you
covered! Assuming you have already set up your DNS provider as defined in the
[GitHub Pages docs][github-pages-domain-docs], all we need next is a `CNAME`
file at the root of your project with the domain you would like to use. For
example:

```CNAME
example.com
```

> Notice that it's **all capitals CNAME** 😊.

This is how GitHub keeps track of the domain you want to use. This action will
copy the file to the `dist/static` directory generated by Scully before pushing your
site so that the domain is persisted between deploys.

### Assumptions

This Action assumes that your Scully code sits at the root of your repository
and `npm run scully` outputs to the `dist/static` directory.

<!-- As of this writing, Scully
doesn't provide a way to customize the build directory so this should be a safe
assumption. -->

Additionally, a `build` script on `package.json` is expected for this Action to
to work (as mentioned at the beginning). Ultimately, this is what builds your Angular assets.

## That's It

Have fun building! ✨

[angular-build-docs]: https://angular.io/cli/build
[scully-build-docs]: https://github.com/scullyio/scully/blob/master/docs/getting-started.md#build
[github-access-token]: https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line
[github-action-input]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#using-encrypted-secrets-in-a-workflow
[github-pages-domain-docs]: https://help.github.com/en/articles/using-a-custom-domain-with-github-pages
[github-repo-secret]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets

## Special Thanks

This repo would not have been possible without inspiration and guidance from the fantastic Gatsby-based example here: [https://github.com/enriikke/gatsby-gh-pages-action](https://github.com/enriikke/gatsby-gh-pages-action)
