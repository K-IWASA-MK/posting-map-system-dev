export interface DeploymentAdapter {
  readonly name: string;
  /**
   * Deploys an artifact content to its target environment destination.
   */
  deploy(
    releaseId: string,
    filePath: string,
    content: string
  ): Promise<{
    success: boolean;
    destination: string;
    error?: string;
  }>;
}
