import { DistrictView, MunicipalityView, TurnoutView, BranchStatusView, AssetStatusView } from "../../dashboard-data-runtime/contract/DashboardDataContract";

export const PUBLIC_SCHEMA_VERSION = "v1";

export interface PublicDashboardDataContract {
  readonly metadata: {
    readonly generatedAt: string;
    readonly schemaVersion: string; // Mandatory for frontend contract matching
    readonly executionId: string;
    readonly presentationHash: string;
    readonly deploymentUrl?: string; // Optional field populated after deploy
  };
  readonly lineage: {
    readonly sourceHash: string;
    readonly outputHash: string;
  };
  readonly districts: readonly DistrictView[];
  readonly municipalities: readonly MunicipalityView[];
  readonly turnoutComparison: readonly TurnoutView[];
  readonly branchStatus: readonly BranchStatusView[];
  readonly assetStatus: readonly AssetStatusView[];
}
