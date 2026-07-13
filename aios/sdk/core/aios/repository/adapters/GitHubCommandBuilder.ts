export class GitHubCommandBuilder {
  public buildCreateCommand(repositoryName: string, visibility: 'public' | 'private'): string {
    return `gh repo create ${repositoryName} --${visibility}`;
  }

  public buildCheckAuthCommand(): string {
    return `gh auth status`;
  }

  public buildDeleteCommand(owner: string, repositoryName: string): string {
    return `gh repo delete ${owner}/${repositoryName} --yes`;
  }

  public buildArchiveCommand(owner: string, repositoryName: string): string {
    return `gh repo archive ${owner}/${repositoryName} --yes`;
  }

  public buildRenameCommand(owner: string, oldName: string, newName: string): string {
    return `gh repo rename ${newName} --repo ${owner}/${oldName} --yes`;
  }

  public buildForkCommand(owner: string, repositoryName: string, org?: string): string {
    const orgArg = org ? `--org ${org}` : '';
    return `gh repo fork ${owner}/${repositoryName} ${orgArg} --clone=false`;
  }

  public buildListRepositoriesCommand(owner: string): string {
    return `gh repo list ${owner} --json name,description,url,updatedAt`;
  }

  public buildCreateReleaseCommand(owner: string, repositoryName: string, tag: string, title: string, notes: string): string {
    return `gh release create ${tag} --repo ${owner}/${repositoryName} --title "${title}" --notes "${notes}"`;
  }

  public buildCreatePullRequestCommand(owner: string, repositoryName: string, title: string, body: string, head: string, base: string): string {
    return `gh pr create --repo ${owner}/${repositoryName} --title "${title}" --body "${body}" --head ${head} --base ${base}`;
  }

  public buildMergePullRequestCommand(owner: string, repositoryName: string, prNumber: number): string {
    return `gh pr merge ${prNumber} --repo ${owner}/${repositoryName} --merge --delete-branch=false`;
  }
}
