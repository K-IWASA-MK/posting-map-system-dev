import * as fs from "fs";
import * as path from "path";
import { ReleaseRequest, ReleaseResult, ReleaseEvent } from "../contracts/ReleaseContract";
import { ArtifactValidator } from "../validation/ArtifactValidator";
import { ReleaseIntegrityVerifier } from "../validation/ReleaseIntegrityVerifier";
import { DeploymentAdapter } from "../adapters/DeploymentAdapter";
import { ProductionVerifier } from "../verification/ProductionVerifier";

export type ReleaseEventSubscriber = (event: ReleaseEvent) => void;

export class ReleaseRuntime {
  private readonly workspaceRoot: string;
  private readonly adapters: DeploymentAdapter[] = [];
  private readonly subscribers: ReleaseEventSubscriber[] = [];
  private readonly releasedVersions = new Set<string>();

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  public registerAdapter(adapter: DeploymentAdapter): void {
    this.adapters.push(adapter);
  }

  public subscribe(sub: ReleaseEventSubscriber): () => void {
    this.subscribers.push(sub);
    return () => {
      const idx = this.subscribers.indexOf(sub);
      if (idx !== -1) {
        this.subscribers.splice(idx, 1);
      }
    };
  }

  private emit(event: ReleaseEvent): void {
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error(`[ReleaseRuntime] Subscriber dispatch failed:`, err);
      }
    }
  }

  /**
   * Orchestrates the delivery/release process:
   * Validation -> Replay Safety -> Integrity -> Artifact Integrity -> Adapter Deployment -> Production Verify.
   */
  public async processRelease(request: ReleaseRequest): Promise<ReleaseResult> {
    // 1. Emit Initial REQUESTED Event
    this.emit({
      type: "RELEASE_REQUESTED",
      releaseId: request.releaseId,
      version: request.version,
      timestamp: Date.now()
    });

    // 2. Contract Validation
    const requiredKeys: (keyof ReleaseRequest)[] = [
      "releaseId",
      "sprintId",
      "version",
      "targetEnvironment",
      "artifacts",
      "schemaVersion"
    ];
    let isContractValid = true;
    let contractError: string | undefined;

    for (const key of requiredKeys) {
      if (request[key] === undefined || request[key] === null) {
        isContractValid = false;
        contractError = `Missing required field: ${key}`;
        break;
      }
    }

    if (isContractValid && request.schemaVersion !== "v1") {
      isContractValid = false;
      contractError = `Unsupported schemaVersion: ${request.schemaVersion}. Expected: v1`;
    }

    if (!isContractValid) {
      this.emit({
        type: "RELEASE_BLOCKED",
        releaseId: request.releaseId,
        version: request.version,
        timestamp: Date.now(),
        error: contractError
      });
      return {
        status: "BLOCKED",
        releaseId: request.releaseId,
        version: request.version,
        deployedTargets: [],
        verified: false,
        error: `Contract validation failed: ${contractError}`
      };
    }

    // 3. Replay Safety Lock Check
    if (this.releasedVersions.has(request.version)) {
      const errorMsg = `Replay Safety: Version ${request.version} already successfully released.`;
      this.emit({
        type: "RELEASE_BLOCKED",
        releaseId: request.releaseId,
        version: request.version,
        timestamp: Date.now(),
        error: errorMsg
      });
      return {
        status: "BLOCKED",
        releaseId: request.releaseId,
        version: request.version,
        deployedTargets: [],
        verified: false,
        error: errorMsg
      };
    }

    // 4. Metadata Integrity & SemVer Format Check
    const integrityCheck = ReleaseIntegrityVerifier.validate(
      request.version,
      request.artifacts,
      this.workspaceRoot
    );
    if (!integrityCheck.valid) {
      this.emit({
        type: "RELEASE_BLOCKED",
        releaseId: request.releaseId,
        version: request.version,
        timestamp: Date.now(),
        error: integrityCheck.error
      });
      return {
        status: "BLOCKED",
        releaseId: request.releaseId,
        version: request.version,
        deployedTargets: [],
        verified: false,
        error: `Integrity verification failed: ${integrityCheck.error}`
      };
    }

    // 5. Artifact Existence & SHA-256 Hash Pre-check
    const artifactCheck = ArtifactValidator.validate(request.artifacts);
    if (!artifactCheck.valid) {
      this.emit({
        type: "RELEASE_BLOCKED",
        releaseId: request.releaseId,
        version: request.version,
        timestamp: Date.now(),
        error: artifactCheck.error
      });
      return {
        status: "BLOCKED",
        releaseId: request.releaseId,
        version: request.version,
        deployedTargets: [],
        verified: false,
        error: `Artifact pre-check failed: ${artifactCheck.error}`
      };
    }

    // Check adapter availability
    if (this.adapters.length === 0) {
      const errorMsg = "No deployment adapters registered.";
      this.emit({
        type: "RELEASE_FAILED",
        releaseId: request.releaseId,
        version: request.version,
        timestamp: Date.now(),
        error: errorMsg
      });
      return {
        status: "FAILED",
        releaseId: request.releaseId,
        version: request.version,
        deployedTargets: [],
        verified: false,
        error: errorMsg
      };
    }

    // 6. Sequential Deployment via Registered Adapters (No Rollback on failure)
    const deployedTargets: {
      adapter: string;
      destination: string;
      success: boolean;
      error?: string;
    }[] = [];
    let deployFailed = false;
    let deploymentError: string | undefined;

    for (const adapter of this.adapters) {
      for (const art of request.artifacts) {
        try {
          const fileContent = fs.readFileSync(art.filePath, "utf-8");
          const result = await adapter.deploy(request.releaseId, art.filePath, fileContent);

          deployedTargets.push({
            adapter: adapter.name,
            destination: result.destination,
            success: result.success,
            error: result.error
          });

          if (!result.success) {
            deployFailed = true;
            deploymentError = `Adapter ${adapter.name} failed to deploy ${art.filePath}: ${result.error}`;
            break;
          }
        } catch (err: any) {
          deployFailed = true;
          deploymentError = `Adapter ${adapter.name} encountered an exception deploying ${art.filePath}: ${err.message}`;
          deployedTargets.push({
            adapter: adapter.name,
            destination: "",
            success: false,
            error: err.message
          });
          break;
        }
      }
      if (deployFailed) {
        break; // Stop immediately on failure (No auto rollback, hold error state)
      }
    }

    if (deployFailed) {
      this.emit({
        type: "RELEASE_FAILED",
        releaseId: request.releaseId,
        version: request.version,
        timestamp: Date.now(),
        error: deploymentError
      });
      return {
        status: "FAILED",
        releaseId: request.releaseId,
        version: request.version,
        deployedTargets,
        verified: false,
        error: deploymentError
      };
    }

    // 7. Production Verification (Read back & compare hash)
    let verificationSuccess = true;
    let verificationError: string | undefined;

    const pathMap = new Map<string, string>();
    for (const art of request.artifacts) {
      pathMap.set(path.basename(art.filePath), art.filePath);
    }

    for (const target of deployedTargets) {
      const filename = path.basename(target.destination);
      const sourcePath = pathMap.get(filename);

      if (!sourcePath) {
        verificationSuccess = false;
        verificationError = `Failed to map destination "${target.destination}" back to a source artifact.`;
        break;
      }

      const verifyResult = ProductionVerifier.verify(sourcePath, target.destination);
      if (!verifyResult.verified) {
        verificationSuccess = false;
        verificationError = `Production verification failed for adapter ${target.adapter}: ${verifyResult.error}`;
        break;
      }
    }

    if (!verificationSuccess) {
      this.emit({
        type: "RELEASE_FAILED",
        releaseId: request.releaseId,
        version: request.version,
        timestamp: Date.now(),
        error: verificationError
      });
      return {
        status: "FAILED",
        releaseId: request.releaseId,
        version: request.version,
        deployedTargets,
        verified: false,
        error: verificationError
      };
    }

    // 8. Mark Version as Released (Lock version for replay protection)
    this.releasedVersions.add(request.version);

    this.emit({
      type: "RELEASE_COMPLETED",
      releaseId: request.releaseId,
      version: request.version,
      timestamp: Date.now()
    });

    return {
      status: "SUCCESS",
      releaseId: request.releaseId,
      version: request.version,
      deployedTargets,
      verified: true
    };
  }

  /**
   * Resets internal version lock cache.
   */
  public clear(): void {
    this.releasedVersions.clear();
  }
}
