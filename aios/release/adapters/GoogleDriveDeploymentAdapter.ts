import * as fs from "fs";
import * as path from "path";
import { DeploymentAdapter } from "./DeploymentAdapter";

export class GoogleDriveDeploymentAdapter implements DeploymentAdapter {
  public readonly name = "GoogleDrive";
  private readonly deployRoot: string;

  constructor(deployRoot: string) {
    this.deployRoot = deployRoot;
  }

  public async deploy(
    releaseId: string,
    filePath: string,
    content: string
  ): Promise<{ success: boolean; destination: string; error?: string }> {
    try {
      const filename = path.basename(filePath);
      const destPath = path.join(this.deployRoot, "gdrive-deploy", filename);

      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, content, "utf-8");

      return { success: true, destination: destPath };
    } catch (err: any) {
      return { success: false, destination: "", error: err.message };
    }
  }
}
