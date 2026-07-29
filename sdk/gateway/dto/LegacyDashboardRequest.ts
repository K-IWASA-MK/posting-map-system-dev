/**
 * LegacyDashboardRequest.ts
 * 
 * Immutable DTO representing a request to retrieve dashboard data from the legacy POSTING MAP system.
 * Strictly decoupled from any other operation DTOs.
 */

export interface LegacyDashboardRequest {
  readonly legacySheetName: string;
  readonly dashboardType: string;
}
