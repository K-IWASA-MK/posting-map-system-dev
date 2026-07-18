import { PublicDashboardDataContract } from "../contract/PresentationContract";
import { DeploymentResult } from "./DeploymentResult";

export interface DeploymentAdapter {
  /**
   * Publishes the presentation artifact to the target provider.
   */
  deploy(artifact: PublicDashboardDataContract, districtName: string): Promise<DeploymentResult>;
}
