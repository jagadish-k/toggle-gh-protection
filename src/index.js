const core = require('@actions/core');
const { getOctokit } = require('@actions/github');

const owner = core.getInput('owner');
const repo = core.getInput('repo');
const branch = core.getInput('branch');
const users = (core.getInput('users') || '').split(',');
const teams = (core.getInput('teams') || '').split(',');
const protectionOn = core.getInput('protection-on') === 'on' ? true : false;
const githubToken = core.getInput('github-token') || '';
const run = async () => {
  try {
    const octokit = getOctokit(githubToken);

    if (protectionOn) {
      await github.rest.repos.setAdminBranchProtection({
        owner,
        repo,
        branch,
      });

      await github.rest.repos.updateBranchProtection({
        owner,
        repo,
        branch,
        required_status_checks: {
          strict: true,
          contexts: [],
        },
        enforce_admins: true,
        required_pull_request_reviews: {
          dismiss_stale_reviews: true,
          required_approving_review_count: 1,
          dismissal_restrictions: {},
          require_code_owner_reviews: false,
          bypass_pull_request_allowances: {
            users: [],
            teams: [],
          },
        },
        enforce_admins: null,
        restrictions: {
          users,
          teams,
        },
      });

      await github.rest.repos.updatePullRequestReviewProtection({
        owner,
        repo,
        branch,
        dismiss_stale_reviews: true,
        required_approving_review_count: 1,
        bypass_pull_request_allowances: {
          users: [],
          teams: [],
        },
      });
      
      core.info("Protection has been turned on.");
    } else {
      await octokit.rest.repos.deleteAdminBranchProtection({
        owner,
        repo,
        branch,
      });

      await octokit.rest.repos.deletePullRequestReviewProtection({
        owner,
        repo,
        branch,
      });

      await octokit.rest.repos.removeStatusCheckProtection({
        owner,
        repo,
        branch,
      });

      core.info("Protection has been turned off.");
    }
    
  } catch (e) {
    console.error(e);
    core.setFailed(error.message);
  }
};

run();