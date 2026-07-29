/**
 * LegacyDistributionRequest.ts
 * 
 * Immutable DTO representing a request to submit distribution data to the legacy POSTING MAP system.
 * Strictly decoupled from any other operation DTOs.
 */

export interface LegacyDistributionRequest {
  readonly legacySheetName: string;
  readonly rowId: number;
  readonly areaId: string;
  readonly staffName: string;
  readonly count: number;
  readonly isDone: boolean;
  readonly points: number;
}
