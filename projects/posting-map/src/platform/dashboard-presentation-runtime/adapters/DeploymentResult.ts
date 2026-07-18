export interface DeploymentResult {
  readonly success: boolean;
  readonly provider: string;
  readonly location?: string;
  readonly error?: string;
}
