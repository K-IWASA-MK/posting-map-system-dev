import { PublicDashboardDataViewModel } from "./PublicDashboardViewModels";
import { PublicDashboardState } from "./DashboardStateModel";
import { DashboardDataMapper } from "./DashboardDataMapper";

// Development/Offline fallback data model representation
export const DEVELOPMENT_FALLBACK_DATA: any = {
  metadata: {
    generatedAt: new Date().toISOString(),
    schemaVersion: "v1",
    executionId: "exec-mock-123",
    presentationHash: "mock-presentation-hash-value-12345"
  },
  lineage: {
    sourceHash: "mock-source-hash-123",
    outputHash: "mock-output-hash-456"
  },
  districts: [
    { id: "TOKYO-01", name: "東京第1区", status: "ACTIVE" },
    { id: "MIE-03", name: "三重第3区", status: "ACTIVE" }
  ],
  municipalities: [
    { districtId: "MIE-03", name: "四日市市", historyCount: 3 },
    { districtId: "MIE-03", name: "鈴鹿市", historyCount: 3 }
  ],
  turnoutComparison: [
    { districtId: "MIE-03", municipalityName: "四日市市", type: "HOUSE_OF_REPRESENTATIVES", year: 2024, turnout: 56.4 },
    { districtId: "MIE-03", municipalityName: "鈴鹿市", type: "HOUSE_OF_REPRESENTATIVES", year: 2024, turnout: 54.8 }
  ],
  branchStatus: [
    { districtId: "MIE-03", districtName: "三重第3区", provisioningStatus: "READY", activationStatus: "ACTIVE", activatedAt: Date.now() - 86400000, lineCheck: "PASS", gasCheck: "PASS" }
  ],
  assetStatus: [
    { districtId: "MIE-03", hasSpreadsheet: true, hasStorageFolder: true, hasGasScript: true }
  ]
};

export class PublicDashboardDataAdapter {
  /**
   * Resolves the current source configuration dynamically from process.env or window config.
   */
  public static getDataSource(): "MOCK" | "LIVE" {
    const envSource = typeof process !== "undefined" && process.env ? process.env.POSTING_MAP_DATA_SOURCE : null;
    const windowConfig = typeof window !== "undefined" && (window as any).POSTING_MAP_CONFIG ? (window as any).POSTING_MAP_CONFIG.DATA_SOURCE : null;
    return (envSource || windowConfig || "MOCK") as "MOCK" | "LIVE";
  }

  /**
   * Asserts structural integrity and compatibility of incoming public presentation models.
   */
  public static validateSchema(data: any): boolean {
    if (!data) return false;
    if (!data.metadata || data.metadata.schemaVersion !== "v1" || !data.metadata.presentationHash) return false;
    if (!data.lineage || !data.lineage.sourceHash || !data.lineage.outputHash) return false;
    if (!Array.isArray(data.districts)) return false;
    if (!Array.isArray(data.municipalities)) return false;
    if (!Array.isArray(data.turnoutComparison)) return false;
    if (!Array.isArray(data.branchStatus)) return false;
    if (!Array.isArray(data.assetStatus)) return false;
    return true;
  }

  /**
   * Fetches public presentation views and maps them to view models safely.
   */
  public static async fetchPublicDashboard(url?: string): Promise<PublicDashboardState> {
    const source = this.getDataSource();

    if (source === "MOCK") {
      // Simulate network latency for correct loading micro-animations
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        data: DashboardDataMapper.mapPublicDashboardData(DEVELOPMENT_FALLBACK_DATA),
        status: "ONLINE",
        warning: null
      };
    }

    if (!url) {
      return {
        data: DashboardDataMapper.mapPublicDashboardData(DEVELOPMENT_FALLBACK_DATA),
        status: "WARNING",
        warning: "Public presentation URL is not configured. Falling back to development dataset."
      };
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return {
          data: DashboardDataMapper.mapPublicDashboardData(DEVELOPMENT_FALLBACK_DATA),
          status: "OFFLINE",
          warning: `Failed to fetch public dashboard: ${response.status} ${response.statusText}`
        };
      }

      const rawData = await response.json();

      if (!this.validateSchema(rawData)) {
        return {
          data: DashboardDataMapper.mapPublicDashboardData(DEVELOPMENT_FALLBACK_DATA),
          status: "WARNING",
          warning: "Schema validation failed on fetched presentation data. Falling back to development dataset."
        };
      }

      return {
        data: DashboardDataMapper.mapPublicDashboardData(rawData),
        status: "ONLINE",
        warning: null
      };
    } catch (err: any) {
      return {
        data: DashboardDataMapper.mapPublicDashboardData(DEVELOPMENT_FALLBACK_DATA),
        status: "OFFLINE",
        warning: `Network exception encountered: ${err.message || String(err)}`
      };
    }
  }
}
