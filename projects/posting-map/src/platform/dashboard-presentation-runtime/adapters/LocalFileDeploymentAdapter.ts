import * as fs from "fs";
import * as path from "path";
import { DeploymentAdapter } from "./DeploymentAdapter";
import { PublicDashboardDataContract } from "../contract/PresentationContract";
import { DeploymentResult } from "./DeploymentResult";
import { PostingMapPathResolver } from "../../../shared/PostingMapPathResolver";

export class LocalFileDeploymentAdapter implements DeploymentAdapter {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Writes the public-dashboard-data.json file locally to the district's branch directory.
   */
  public async deploy(artifact: PublicDashboardDataContract, districtName: string): Promise<DeploymentResult> {
    try {
      const pathResolver = new PostingMapPathResolver(this.workspaceRoot);
      const branchFolder = pathResolver.getBranchDirectory(districtName);

      if (!fs.existsSync(branchFolder)) {
        fs.mkdirSync(branchFolder, { recursive: true });
      }

      const outputPath = path.join(branchFolder, "public-dashboard-data.json");
      
      // We can also inject deploymentUrl inside metadata before writing to simulate real provider behaviors
      const finalizedArtifact: PublicDashboardDataContract = {
        ...artifact,
        metadata: {
          ...artifact.metadata,
          deploymentUrl: `file://${outputPath}`
        }
      };

      fs.writeFileSync(outputPath, JSON.stringify(finalizedArtifact, null, 2), "utf-8");

      return {
        success: true,
        provider: "LocalFile",
        location: outputPath
      };
    } catch (err: any) {
      return {
        success: false,
        provider: "LocalFile",
        error: err.message
      };
    }
  }
}
