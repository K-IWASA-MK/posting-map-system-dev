export interface IDeploymentProvider {
  readonly providerId: string;
  readonly providerType: string;
  initialize(config?: Record<string, unknown>): Promise<void>;
  healthCheck(): Promise<boolean>;
}

export interface IBuildProvider extends IDeploymentProvider {
  build(repositoryId: string, buildConfig: Record<string, unknown>): Promise<{ artifactUrl: string, digest: string }>;
}

export interface ITestProvider extends IDeploymentProvider {
  runTests(repositoryId: string, testConfig: Record<string, unknown>): Promise<{ passed: boolean, coverage: number, testReportUrl?: string }>;
}

export interface IDeployProvider extends IDeploymentProvider {
  deploy(artifactUrl: string, environment: string, deployConfig: Record<string, unknown>): Promise<{ deploymentUrl: string, environmentId: string }>;
}

export interface IRollbackProvider extends IDeploymentProvider {
  rollback(environment: string, previousDeploymentUrl: string, rollbackConfig: Record<string, unknown>): Promise<{ success: boolean }>;
}
