### Toggle Protection on Branch

This is a github action to enable or disable protection no specified branch osthat other actions can be carried out as part of CI action.

#### Usage
```yaml
...
- uses: jagadish-k/toggle-gh-protection@master
  with:
    github-token: ${{ env.REPO_TOKEN }}
    repo: ${{ github.event.repository.name }}
    owner: ${{ github.repository_owner }}
    branch: main
    protection-on: off
...... Do Something

- uses: jagadish-k/toggle-gh-protection@master
  with:
    github-token: ${{ env.REPO_TOKEN }}
    repo: ${{ github.event.repository.name }}
    owner: ${{ github.repository_owner }}
    branch: main
    users: alphauser,betauser
    team: core
    protection-on: on
...
```