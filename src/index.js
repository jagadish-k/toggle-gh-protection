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

      await octokit.rest.repos.setAdminBranchProtection({
        owner,
        repo,
        branch,
      });

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

      await octokit.rest.repos.updatePullRequestReviewProtection({
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

      core.info('Protection has been turned on.');
    } else {
      const currentAdminBranchProtection =
        await octokit.rest.repos.getAdminBranchProtection({
          owner,
          repo,
          branch,
        });
      if (currentAdminBranchProtection.status === 200) {
        await octokit.rest.repos.deleteAdminBranchProtection({
          owner,
          repo,
          branch,
        });
      }

      const currentPullRequestReviewProtection =
        await octokit.rest.repos.getPullRequestReviewProtection({
          owner,
          repo,
          branch,
        });
      if (currentPullRequestReviewProtection.status === 200) {
        await octokit.rest.repos.deletePullRequestReviewProtection({
          owner,
          repo,
          branch,
        });
      }
      try {
        const currentStatusCheckStatus =
          await octokit.rest.repos.getStatusChecksProtection({
            owner,
            repo,
            branch,
          });

        if (currentStatusCheckStatus) {
          await octokit.rest.repos.removeStatusCheckProtection({
            owner,
            repo,
            branch,
          });
        }
      } catch (e) { 
        core.info('No status check enabled');
      }

      core.info('Protection has been turned off.');
    }
  } catch (e) {
    console.error(e);
    core.setFailed(e.message);
  }
};

run();
