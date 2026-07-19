import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { ElectionTurnoutViewModel } from "../../consumer/contracts/ElectionDashboardConsumerContract";
import { ElectionDashboardStorage } from "../models/ElectionDashboardStorage";
import { StorageMetadata } from "../contracts/ElectionDashboardStorageContract";

export class ElectionDashboardStorageWriter {
  /**
   * Safely writes the ElectionTurnoutViewModel as an immutable, hashed JSON file.
   * Utilizes Atomic Write (temp file -> fsync/write -> rename) to ensure delivery file integrity.
   */
  public write(
    storageId: string,
    version: string,
    viewModel: ElectionTurnoutViewModel,
    destinationPath: string
  ): ElectionDashboardStorage {
    // 1. Calculate sourceLineageHash (from the ViewModel's lineage hash)
    const sourceLineageHash = viewModel.lineageHash || "";

    // 2. Compute contentHash over the actual ViewModel data
    const dataString = JSON.stringify(viewModel);
    const contentHash = crypto
      .createHash("sha256")
      .update(dataString)
      .digest("hex");

    const generatedAt = new Date().toISOString();

    const metadata: StorageMetadata = {
      sourceLineageHash,
      contentHash,
      generatedAt
    };

    // 3. Instantiate frozen Storage model
    const storageModel = new ElectionDashboardStorage(
      storageId,
      version,
      viewModel.electionId,
      metadata,
      viewModel
    );

    // 4. Perform Atomic Write to destinationPath
    const dir = path.dirname(destinationPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const tempPath = `${destinationPath}.tmp`;
    const serializedJson = storageModel.toJSON();

    // Write to temporary file synchronously
    fs.writeFileSync(tempPath, serializedJson, "utf8");

    // Atomic rename operation
    fs.renameSync(tempPath, destinationPath);

    return storageModel;
  }
}
