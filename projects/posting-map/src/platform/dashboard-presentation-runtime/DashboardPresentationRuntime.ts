import * as fs from "fs";
import * as path from "path";
import { DashboardDataContract } from "../dashboard-data-runtime/contract/DashboardDataContract";
import { DashboardDataIntegrityVerifier } from "../dashboard-data-runtime/audit/DashboardDataIntegrityVerifier";
import { PresentationBuilder } from "./builder/PresentationBuilder";
import { PresentationHashGenerator } from "./utils/PresentationHashGenerator";
import { DeploymentAdapter } from "./adapters/DeploymentAdapter";
import { LocalFileDeploymentAdapter } from "./adapters/LocalFileDeploymentAdapter";
import { PresentationIntegrityVerifier } from "./validation/PresentationIntegrityVerifier";
import { PostingMapPathResolver } from "../../shared/PostingMapPathResolver";

export interface PresentationEvent {
  readonly type: "DASHBOARD_PRESENTATION_REQUESTED";
  readonly missionId: string;
  readonly districtName: string;
  readonly expectedSourceHash: string; // To ensure source level validation
}

export interface PresentationCompletedEvent {
  readonly type: "DASHBOARD_PRESENTATION_COMPLETED";
  readonly missionId: string;
  readonly districtName: string;
  readonly publicUrl: string;
  readonly presentationHash: string;
}

export class DashboardPresentationRuntime {
  private readonly workspaceRoot: string;
  private readonly adapter: DeploymentAdapter;

  constructor(workspaceRoot: string, adapter?: DeploymentAdapter) {
    this.workspaceRoot = workspaceRoot;
    this.adapter = adapter || new LocalFileDeploymentAdapter(workspaceRoot);
  }

  /**
   * Runs the complete Presentation compilation flow: Load -> Validate -> Transform -> Hash -> Package -> Deploy -> Verify.
   */
  public async processEvent(event: PresentationEvent): Promise<{ success: boolean; event?: PresentationCompletedEvent; error?: string }> {
    try {
      if (event.type !== "DASHBOARD_PRESENTATION_REQUESTED") {
        return { success: false, error: `Unsupported event type: ${event.type}` };
      }

      const pathResolver = new PostingMapPathResolver(this.workspaceRoot);
      const branchFolder = pathResolver.getBranchDirectory(event.districtName);

      const inputPath = path.join(branchFolder, "dashboard-data.json");

      // 1. Load & Validate input dashboard-data.json
      const verifyResult = DashboardDataIntegrityVerifier.verify({
        outputPath: inputPath,
        expectedSourceHash: event.expectedSourceHash,
        expectedSchemaVersion: "v1"
      });

      if (!verifyResult.valid) {
        return {
          success: false,
          error: `Input dashboard-data.json integrity check failed: ${verifyResult.errors.join(", ")}`
        };
      }

      const inputContent = fs.readFileSync(inputPath, "utf-8");
      const inputData: DashboardDataContract = JSON.parse(inputContent);

      // 2. Transform: map DashboardData to PublicPresentation model
      const publicData = PresentationBuilder.build(inputData);

      // 3. Hash: compute deterministic presentationHash
      const presentationHash = PresentationHashGenerator.generate(publicData);
      (publicData as any).metadata.presentationHash = presentationHash;

      // 4. Deploy: push public-dashboard-data via configured adapter
      const deployResult = await this.adapter.deploy(publicData, event.districtName);
      if (!deployResult.success) {
        return {
          success: false,
          error: `Deployment failed via ${deployResult.provider}: ${deployResult.error}`
        };
      }

      // 5. Verify: post-deploy integrity audit of the output file
      if (deployResult.provider === "LocalFile" && deployResult.location) {
        const outputVerification = PresentationIntegrityVerifier.verify({
          outputPath: deployResult.location,
          expectedOutputHash: inputData.lineage?.outputHash || ""
        });

        if (!outputVerification.valid) {
          return {
            success: false,
            error: `Deployment integrity verification failed: ${outputVerification.errors.join(", ")}`
          };
        }
      }

      const completedEvent: PresentationCompletedEvent = {
        type: "DASHBOARD_PRESENTATION_COMPLETED",
        missionId: event.missionId,
        districtName: event.districtName,
        publicUrl: deployResult.location || "",
        presentationHash
      };

      return { success: true, event: completedEvent };
    } catch (err: any) {
      console.error(`[DashboardPresentationRuntime] Presentation compiling failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}
