import { DashboardDataContract } from "../../dashboard-data-runtime/contract/DashboardDataContract";
import { PublicDashboardDataContract, PUBLIC_SCHEMA_VERSION } from "../contract/PresentationContract";

export class PresentationBuilder {
  /**
   * Projects DashboardDataContract to PublicDashboardDataContract.
   * Sets lineage hashes and copies view lists, initializing presentationHash to an empty string.
   */
  public static build(input: DashboardDataContract): PublicDashboardDataContract {
    return {
      metadata: {
        generatedAt: input.metadata.generatedAt,
        schemaVersion: PUBLIC_SCHEMA_VERSION,
        executionId: input.metadata.executionId,
        presentationHash: "" // Populated by hash generator afterwards
      },
      lineage: {
        sourceHash: input.metadata.sourceHash,
        outputHash: input.lineage?.outputHash || ""
      },
      districts: [...input.districts],
      municipalities: [...input.municipalities],
      turnoutComparison: [...input.turnoutComparison],
      branchStatus: [...input.branchStatus],
      assetStatus: [...input.assetStatus]
    };
  }
}
