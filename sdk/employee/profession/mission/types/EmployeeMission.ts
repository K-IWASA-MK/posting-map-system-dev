/**
 * EmployeeMission.ts
 * 
 * Employee Mission Model (Responsibilities, Deliverables, DoD, Quality Criteria)
 */

import { MissionId } from './MissionId';

export interface EmployeeMission {
  missionId: MissionId;
  title: string;
  purpose: string;
  expectedDeliverable: string;
  definitionOfDone: string[];
  qualityCriteria: string[];
}
