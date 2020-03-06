const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github");
const io = require("@actions/io");
const ioUtil = require("@actions/io/lib/io-util");

async function run() {
  try {
    const accessToken = core.getInput("access-token");
    if (!accessToken) {
      core.setFailed(
        "No personal access token found. Please provide one by setting the `access-token` input for this action."
      );
      return;
    }

    const deployBranch = core.getInput("deploy-branch");
    if (!deployBranch) deployBranch = "master";

    if (github.context.ref === `refs/heads/${deployBranch}`) {
      console.log(`Triggered by branch used to deploy: ${github.context.ref}.`);
      console.log("Nothing to deploy.");
      return;
    }

    const pkgManager = (await ioUtil.exists("./yarn.lock")) ? "yarn" : "npm";
    console.log(`Installing your site's dependencies using ${pkgManager}.`);
    await exec.exec(`${pkgManager} install`);
    console.log("Finished installing dependencies.");

    let buildArgs = core.getInput("build-args").trim();
    // Add dashes if a user passes args and doesnt have them.
    if (buildArgs !== "" && scullyArgs.indexOf("-- ") !== 0) {
      buildArgs = `-- ${buildArgs}`;
    }

    let scullyArgs = core.getInput("scully-args").trim();
    // Remove dashes if the scullyArgs have them
    //  This is because we now pass --nw by default.
    if (scullyArgs.indexOf("-- ") === 0) {
      scullyArgs = scullyArgs.slice(3);
    }

    console.log("Ready to build your Scully site!");
    console.log(`Building with: ${pkgManager} run build ${buildArgs}`);
    await exec.exec(`${pkgManager} run build ${buildArgs}`, []);
    console.log("Finished building your site.");

    await exec.exec(`${pkgManager} run scully -- --nw ${scullyArgs}`, []);
    console.log("Finished Scullying your site.");

    const cnameExists = await ioUtil.exists("./CNAME");
    if (cnameExists) {
      console.log("Copying CNAME over.");
      await io.cp("./CNAME", "./dist/static/CNAME", { force: true });
      console.log("Finished copying CNAME.");
    }

    const repo = `${github.context.repo.owner}/${github.context.repo.repo}`;
    const repoURL = `https://${accessToken}@github.com/${repo}.git`;
    console.log("Ready to deploy your new shiny site!");
    console.log(`Deploying to repo: ${repo} and branch: ${deployBranch}`);
    console.log(
      "You can configure the deploy branch by setting the `deploy-branch` input for this action."
    );
    await exec.exec(`git init`, [], { cwd: "./dist/static" });
    await exec.exec(`git config user.name`, [github.context.actor], {
      cwd: "./dist/static"
    });
    await exec.exec(
      `git config user.email`,
      [`${github.context.actor}@users.noreply.github.com`],
      { cwd: "./dist/static" }
    );
    await exec.exec(`git add`, ["."], { cwd: "./dist/static" });
    await exec.exec(
      `git commit`,
      ["-m", `deployed via Scully Publish Action 🎩 for ${github.context.sha}`],
      { cwd: "./dist/static" }
    );
    await exec.exec(`git push`, ["-f", repoURL, `master:${deployBranch}`], {
      cwd: "./dist/static"
    });
    console.log("Finished deploying your site.");

    console.log("Enjoy! ✨");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
