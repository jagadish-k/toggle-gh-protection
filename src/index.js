const core = require('@actions/core');
const { getOctokit, context } = require('@actions/github');

const githubToken = core.getInput('github-token') || '';
const branch = core.getInput('branch');
const users = (core.getInput('users') || '').split(',');
const teams = (core.getInput('teams') || '').split(',');
const protectionOn = core.getInput('protection') === 'on' ? true : false;

const run = async () => {
  try {
    const octokit = getOctokit(githubToken);
    const { owner, repo } = context.repo;

    if (protectionOn) {
      await octokit.rest.repos.updateBranchProtection({
        owner,
        repo,
        branch,
        required_status_checks: {
          strict: true,
          contexts: [],
        },
        enforce_admins: true,

        required_pull_request_reviews: {
          dismissal_restrictions: {
            users,
            teams,
          },
          dismiss_stale_reviews: true,
          require_code_owner_reviews: false,
          required_approving_review_count: 1,
          bypass_pull_request_allowances: {
            users,
            teams,
          },
        },

        enforce_admins: null,
        restrictions: {
          users,
          teams,
        },
      });

      core.info('Protection has been turned on.');

      if (users.length == 0) {
        core.info('No users have special privileges to bypass protections');
      }
    } else {
      await octokit.rest.repos.deleteBranchProtection({
        owner,
        repo,
        branch,
      });

      core.info('Protection has been turned off.');
    }
  } catch (e) {
    console.error(e);
    core.setFailed(e.message);
  }
};

run();
