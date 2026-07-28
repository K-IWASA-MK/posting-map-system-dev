/**
 * ResponsibilityMatrix.ts
 * 
 * Process Responsibility Matrix Model
 */

import { ResponsibilityType } from './types/ResponsibilityType';

export interface ProcessResponsibility {
  processName: string;
  responsibilityType: ResponsibilityType;
  description?: string;
}

export interface ResponsibilityMatrix {
  professionId: string;
  responsibilities: ProcessResponsibility[];
}
