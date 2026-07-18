import { DashboardDataContract, CURRENT_SCHEMA_VERSION } from "../contract/DashboardDataContract";
import { DistrictModel, MunicipalityModel, TurnoutComparisonModel, BranchStatusModel, AssetStatusModel } from "../models/InternalModels";

export class DashboardDataBuilder {
  /**
   * Combines internal models and generates the final Dashboard JSON Contract representation.
   */
  public static build(params: {
    district: DistrictModel;
    municipalities: MunicipalityModel[];
    turnoutComparison: TurnoutComparisonModel[];
    branchStatus: BranchStatusModel;
    assetStatus: AssetStatusModel;
    sourceHash: string;
    executionId: string;
    generatedAt: string;
  }): DashboardDataContract {
    return {
      metadata: {
        generatedAt: params.generatedAt,
        runtimeVersion: "1.0.0",
        sourceHash: params.sourceHash,
        executionId: params.executionId,
        schemaVersion: CURRENT_SCHEMA_VERSION
      },
      districts: [
        {
          id: params.district.id,
          name: params.district.name,
          status: params.district.status
        }
      ],
      municipalities: params.municipalities.map((m) => ({
        districtId: m.districtId,
        name: m.name,
        historyCount: m.historyCount
      })),
      turnoutComparison: params.turnoutComparison.map((tc) => ({
        districtId: tc.districtId,
        municipalityName: tc.municipalityName,
        type: tc.type,
        year: tc.year,
        turnout: tc.turnout
      })),
      branchStatus: [
        {
          districtId: params.branchStatus.districtId,
          districtName: params.branchStatus.districtName,
          provisioningStatus: params.branchStatus.provisioningStatus,
          activationStatus: params.branchStatus.activationStatus,
          activatedAt: params.branchStatus.activatedAt,
          lineCheck: params.branchStatus.lineCheck,
          gasCheck: params.branchStatus.gasCheck
        }
      ],
      assetStatus: [
        {
          districtId: params.assetStatus.districtId,
          spreadsheetId: params.assetStatus.spreadsheetId,
          storageFolderId: params.assetStatus.storageFolderId,
          scriptId: params.assetStatus.scriptId,
          webAppUrl: params.assetStatus.webAppUrl,
          inRegistry: params.assetStatus.inRegistry
        }
      ]
    };
  }
}
