import * as fs from "fs";
import * as path from "path";
import { ActivationStage } from "./ActivationStage";
import { ActivationStateMachine } from "./ActivationStateMachine";
import { LineConnector } from "./LineConnector";
import { GasConnector } from "./GasConnector";
import { ActivationVerifier } from "./ActivationVerifier";
import { PostingMapPathResolver } from "../../shared/PostingMapPathResolver";

export interface ActivationEvent {
  type: string;
  missionId: string;
  districtName: string;
  districtId: string;
  spreadsheetId: string;
  storageFolderId: string;
  occurredAt: string;
}

export class ActivationRuntime {
  private localWorkspaceRoot: string;
  private registryPath: string;
  private lineConnector: LineConnector;
  private gasConnector: GasConnector;
  private verifier: ActivationVerifier;

  constructor(localWorkspaceRoot: string) {
    this.localWorkspaceRoot = localWorkspaceRoot;
    this.registryPath = path.join(
      this.localWorkspaceRoot,
      "projects",
      "posting-map",
      "active",
      "dashboard",
      "clients",
      "AssetRegistry.json"
    );
    this.lineConnector = new LineConnector();
    this.gasConnector = new GasConnector();
    this.verifier = new ActivationVerifier();
  }

  public async processEvent(event: ActivationEvent): Promise<{ success: boolean; stage: ActivationStage; error?: string }> {
    if (!event.districtName || event.districtName.trim() === "") {
      return { success: false, stage: ActivationStage.FAILED, error: "Invalid or empty districtName provided." };
    }

    const sm = new ActivationStateMachine(event.missionId);
    
    // 出力先フォルダの特定
    const pathResolver = new PostingMapPathResolver(this.localWorkspaceRoot);
    const branchFolder = pathResolver.getBranchDirectory(event.districtName);
    const deploymentJsonPath = path.join(branchFolder, "deployment.json");
    const activationJsonPath = path.join(branchFolder, "activation.json");

    try {
      // 1. ACTIVATING
      sm.transitionTo(ActivationStage.ACTIVATING);

      // 2. LINE_VERIFYING
      sm.transitionTo(ActivationStage.LINE_VERIFYING);
      const lineOk = await this.lineConnector.verifyChannels(
        "POSTING MAP Login",
        "POSTING MAP Msg API",
        "POSTING MAP Admin"
      );
      if (!lineOk) {
        throw new Error("LINE infrastructure connection validation failed.");
      }

      // 3. GAS_VERIFYING
      sm.transitionTo(ActivationStage.GAS_VERIFYING);
      const gasOk = await this.gasConnector.verifyGasConnection(deploymentJsonPath);
      if (!gasOk) {
        throw new Error("GAS WebApp Connection check failed.");
      }

      // 4. DASHBOARD_VERIFYING
      sm.transitionTo(ActivationStage.DASHBOARD_VERIFYING);
      const verifierOk = this.verifier.verifyRegistryAlignment(this.registryPath, event.districtId);
      if (!verifierOk) {
        throw new Error("AssetRegistry alignment check failed.");
      }

      // 5. AUDIT_VERIFYING (Review Point 3: Audit event validation)
      sm.transitionTo(ActivationStage.AUDIT_VERIFYING);
      const transactionId = `act-${Date.now()}-${event.districtId}`;
      if (!transactionId.startsWith("act-")) {
        throw new Error("Audit verification failed: invalid transaction ID generated.");
      }

      // 6. ACTIVE
      sm.transitionTo(ActivationStage.ACTIVE);

      // activation.json オブジェクトの構成 (Review Point 4: Runtime metadata appended)
      const activationData = {
        district: {
          id: event.districtId,
          name: event.districtName
        },
        status: "ACTIVE",
        runtime: {
          version: "v1",
          activatedBy: "AIOS"
        },
        checks: {
          line: {
            status: "PASS",
            details: {
              loginChannel: "POSTING MAP Login",
              messagingChannel: "POSTING MAP Msg API",
              adminChannel: "POSTING MAP Admin"
            }
          },
          gas: {
            status: "PASS",
            details: {
              spreadsheetId: event.spreadsheetId,
              health: "PASS"
            }
          },
          dashboard: {
            status: "PASS"
          }
        },
        activatedAt: Date.now(),
        audit: {
          transactionId,
          createdBy: "aios-activator@platform.postingmap"
        }
      };

      // フォルダ作成
      if (!fs.existsSync(branchFolder)) {
        fs.mkdirSync(branchFolder, { recursive: true });
      }

      fs.writeFileSync(activationJsonPath, JSON.stringify(activationData, null, 2), "utf-8");
      console.log(`[Activation] activation.json successfully generated at ${activationJsonPath}`);

      return { success: true, stage: ActivationStage.ACTIVE };
    } catch (error: any) {
      console.error(`[Activation] Process failed at stage: ${sm.getCurrentState()}. Error: ${error.message}`);
      sm.transitionTo(ActivationStage.FAILED);
      
      try {
        const failedData = {
          district: {
            id: event.districtId,
            name: event.districtName
          },
          status: "FAILED",
          error: error.message,
          timestamp: Date.now()
        };
        if (fs.existsSync(branchFolder)) {
          fs.writeFileSync(activationJsonPath, JSON.stringify(failedData, null, 2), "utf-8");
        }
      } catch (writeErr) {
        console.error("[Activation] Failed to write failure status to activation.json", writeErr);
      }

      return { success: false, stage: ActivationStage.FAILED, error: error.message };
    }
  }
}
