/**
 * ProfessionTemplate.ts
 * 
 * Reusable Template for instantiating AI Employees with preset Profession, Missions, Domains, Skills, Capabilities, and Permissions.
 */

import { EmployeeProfession } from '../../types/EmployeeProfession';
import { EmployeeMission } from '../../mission/types/EmployeeMission';
import { EmployeeDomain } from '../../domain/types/EmployeeDomain';
import { SkillProfile } from '../../skill/types/SkillProfile';
import { ResponsibilityMatrix } from '../../responsibility/ResponsibilityMatrix';
import { EmployeeCapability } from '../../../capability/types/EmployeeCapability';
import { EmployeePermission } from '../../../permission/types/EmployeePermission';
import { ProfessionAssignment } from './ProfessionAssignment';

export interface ProfessionTemplate {
  templateId: string;
  templateName: string;
  profession: EmployeeProfession;
  defaultMissions: EmployeeMission[];
  defaultDomains: EmployeeDomain[];
  defaultSkills: SkillProfile[];
  responsibilityMatrix?: ResponsibilityMatrix;
  defaultCapabilities: EmployeeCapability[];
  defaultPermissions?: EmployeePermission[];
}

export class ProfessionTemplateFactory {
  public static createAssignmentFromTemplate(
    template: ProfessionTemplate,
    employeeId: string,
    additionalMissions: EmployeeMission[] = [],
    additionalDomains: EmployeeDomain[] = [],
    additionalSkills: SkillProfile[] = []
  ): ProfessionAssignment {
    return {
      employeeId,
      profession: template.profession,
      missions: [...template.defaultMissions, ...additionalMissions],
      domains: [...template.defaultDomains, ...additionalDomains],
      skills: [...template.defaultSkills, ...additionalSkills],
      responsibilityMatrix: template.responsibilityMatrix,
      assignedAt: new Date().toISOString()
    };
  }
}
