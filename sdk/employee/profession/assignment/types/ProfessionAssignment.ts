/**
 * ProfessionAssignment.ts
 * 
 * Binding between Employee and Profession, Missions, Domains, Skills, ResponsibilityMatrix
 */

import { EmployeeProfession } from '../../types/EmployeeProfession';
import { EmployeeMission } from '../../mission/types/EmployeeMission';
import { EmployeeDomain } from '../../domain/types/EmployeeDomain';
import { SkillProfile } from '../../skill/types/SkillProfile';
import { ResponsibilityMatrix } from '../../responsibility/ResponsibilityMatrix';

export interface ProfessionAssignment {
  employeeId: string;
  profession: EmployeeProfession;
  missions: EmployeeMission[];
  domains: EmployeeDomain[];
  skills: SkillProfile[];
  responsibilityMatrix?: ResponsibilityMatrix;
  assignedAt: string;
}
