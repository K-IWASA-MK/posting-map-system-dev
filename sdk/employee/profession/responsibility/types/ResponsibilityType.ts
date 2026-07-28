/**
 * ResponsibilityType.ts
 * 
 * RACI Responsibility Matrix Types
 */

export enum ResponsibilityType {
  RESPONSIBLE = 'RESPONSIBLE', // Executes the process/activity
  ACCOUNTABLE = 'ACCOUNTABLE', // Final approving/holding authority
  CONSULTED = 'CONSULTED',   // Provides input/feedback
  INFORMED = 'INFORMED'      // Kept updated on progress
}
