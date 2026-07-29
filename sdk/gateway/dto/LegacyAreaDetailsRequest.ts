/**
 * LegacyAreaDetailsRequest.ts
 * 
 * Immutable DTO representing a request to retrieve area details from the legacy POSTING MAP system.
 * Strictly decoupled from any other operation DTOs.
 */

export interface LegacyAreaDetailsRequest {
  readonly legacySheetName: string;
  readonly areaId: string;
}
