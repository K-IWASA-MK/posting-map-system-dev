export enum DeploymentState {
  PENDING = 'PENDING',
  BUILDING = 'BUILDING',
  TESTING = 'TESTING',
  PACKAGE = 'PACKAGE',
  DEPLOYING = 'DEPLOYING',
  SUCCESS = 'SUCCESS',
  ROLLING_BACK = 'ROLLING_BACK',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum DeploymentStage {
  BUILD = 'BUILD',
  TEST = 'TEST',
  QUALITY_GATE = 'QUALITY_GATE',
  SECURITY_SCAN = 'SECURITY_SCAN',
  SBOM = 'SBOM',
  SIGN = 'SIGN',
  PACKAGE = 'PACKAGE',
  DEPLOY = 'DEPLOY'
}

export interface DeploymentJob {
  id: string;
  projectId: string;
  releaseId?: string;
  repositoryId?: string;
  state: DeploymentState;
  currentStage?: DeploymentStage;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorReason?: string;
}
