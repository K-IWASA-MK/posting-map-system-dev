import { ReleaseRuntime } from "../../../../aios/release/runtime/ReleaseRuntime";
import { ReleaseRequest, ReleaseResult } from "../../../../aios/release/contracts/ReleaseContract";
import { ElectionDashboardStorageSchema } from "../contracts/ElectionDashboardStorageContract";

export class ElectionDashboardDeliveryAdapter {
  /**
   * Adapter connecting the Election Dashboard Storage layer with the standard AIOS Release Runtime.
   * Maps storage files and validation signatures to a standard ReleaseRequest.
   * This completely isolates the storage runtime from direct git or deployment operations.
   */
  public async deliver(
    filePath: string,
    storage: ElectionDashboardStorageSchema,
    releaseRuntime: ReleaseRuntime
  ): Promise<ReleaseResult> {
    const request: ReleaseRequest = {
      releaseId: storage.storageId,
      sprintId: storage.electionId,
      version: storage.version,
      targetEnvironment: "production",
      artifacts: [
        {
          filePath,
          expectedHash: storage.metadata.contentHash
        }
      ],
      schemaVersion: "v1"
    };

    return await releaseRuntime.processRelease(request);
  }
}
