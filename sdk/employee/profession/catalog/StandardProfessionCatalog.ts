/**
 * StandardProfessionCatalog.ts
 * 
 * Standard AIOS Profession Catalog featuring Two-Layer Classification:
 * 1. System Professions (AIOS Core Engineering, QA, Deployment, Security, etc.)
 * 2. Project Professions (Field Operations Specialist, Spatial Verification, Weather Intelligence, etc.)
 */

import { ProfessionId } from '../types/ProfessionId';
import { ProfessionCategory } from '../types/ProfessionCategory';
import { EmployeeProfession } from '../types/EmployeeProfession';
import { MissionId } from '../mission/types/MissionId';
import { EmployeeMission } from '../mission/types/EmployeeMission';
import { DomainId } from '../domain/types/DomainId';
import { EmployeeDomain } from '../domain/types/EmployeeDomain';
import { SkillLevel } from '../skill/types/SkillLevel';
import { SkillProfile } from '../skill/types/SkillProfile';
import { ProfessionTemplate } from '../assignment/types/ProfessionTemplate';
import { EmployeeCapability } from '../../capability/types/EmployeeCapability';
import { EmployeePermission } from '../../permission/types/EmployeePermission';

export class StandardProfessionCatalog {
  // --- 1. SYSTEM PROFESSIONS (AIOS Core) ---
  public static readonly ARCHITECTURE_ENGINEER: EmployeeProfession = {
    professionId: ProfessionId.of('ARCH_ENG'),
    title: 'Architecture Engineer',
    category: ProfessionCategory.ENGINEERING,
    description: 'System architectural design and component modeling'
  };

  public static readonly RESEARCH_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('RESEARCH_SPEC'),
    title: 'Research Specialist',
    category: ProfessionCategory.RESEARCH,
    description: 'Requirement analysis and technical investigation'
  };

  public static readonly VALIDATION_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('VAL_SPEC'),
    title: 'Validation Specialist',
    category: ProfessionCategory.QUALITY_ASSURANCE,
    description: 'Evidence verification and governance compliance'
  };

  public static readonly IMPLEMENTATION_ENGINEER: EmployeeProfession = {
    professionId: ProfessionId.of('IMPL_ENG'),
    title: 'Implementation Engineer',
    category: ProfessionCategory.ENGINEERING,
    description: 'Code implementation, refactoring, and feature execution'
  };

  public static readonly QA_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('QA_SPEC'),
    title: 'QA Specialist',
    category: ProfessionCategory.QUALITY_ASSURANCE,
    description: 'Test suite execution, regression verification, and quality audit'
  };

  public static readonly SECURITY_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('SEC_SPEC'),
    title: 'Security Specialist',
    category: ProfessionCategory.SECURITY,
    description: 'Permission enforcement and security audit'
  };

  public static readonly DEPLOYMENT_ENGINEER: EmployeeProfession = {
    professionId: ProfessionId.of('DEPLOY_ENG'),
    title: 'Deployment Engineer',
    category: ProfessionCategory.OPERATIONS,
    description: 'Packaging, deployment, and bridge configuration'
  };

  public static readonly DOCUMENTATION_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('DOC_SPEC'),
    title: 'Documentation Specialist',
    category: ProfessionCategory.DOCUMENTATION,
    description: 'Specification writing and architectural documentation'
  };

  public static readonly MEDIA_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('MEDIA_SPEC'),
    title: 'Media Specialist',
    category: ProfessionCategory.MEDIA,
    description: 'Visual asset generation and video documentation'
  };

  public static readonly PLANNING_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('PLAN_SPEC'),
    title: 'Planning Specialist',
    category: ProfessionCategory.PLANNING,
    description: 'Task planning and milestone tracking'
  };

  public static readonly AUDIT_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('AUDIT_SPEC'),
    title: 'Audit Specialist',
    category: ProfessionCategory.GOVERNANCE,
    description: 'Autonomous E2E reality audit and compliance verification'
  };

  // --- 2. PROJECT PROFESSIONS (Domain-Specific Project Professions) ---
  public static readonly FIELD_OPERATIONS_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('FIELD_OPS_SPEC'),
    title: 'Field Operations Specialist',
    category: ProfessionCategory.OPERATIONS,
    description: 'Field operations and territory boundary setup',
    isCustomProjectProfession: true
  };

  public static readonly SPATIAL_VERIFICATION_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('SPATIAL_VERIF_SPEC'),
    title: 'Spatial Verification Specialist',
    category: ProfessionCategory.QUALITY_ASSURANCE,
    description: 'GIS and spatial location verification',
    isCustomProjectProfession: true
  };

  public static readonly GAS_DEPLOYMENT_SPECIALIST: EmployeeProfession = {
    professionId: ProfessionId.of('GAS_DEPLOY_SPEC'),
    title: 'GAS Deployment Specialist',
    category: ProfessionCategory.OPERATIONS,
    description: 'Google Apps Script deployment and V2 API sync',
    isCustomProjectProfession: true
  };

  // --- Standard Profession Templates ---
  public static readonly TEMPLATES: Record<string, ProfessionTemplate> = {
    ARCH_ENG: {
      templateId: 'tpl-arch-eng',
      templateName: 'Architecture Engineer Template',
      profession: StandardProfessionCatalog.ARCHITECTURE_ENGINEER,
      defaultMissions: [
        {
          missionId: MissionId.of(MissionId.MISSION_BUILD_RUNTIME),
          title: 'Build System Architecture',
          purpose: 'Design system boundaries and component blueprints',
          expectedDeliverable: 'Architecture specification & module contracts',
          definitionOfDone: ['Zero architectural circular dependencies', 'Pure interfaces defined'],
          qualityCriteria: ['Maintainability score >= 90%']
        }
      ],
      defaultDomains: [{ domainId: DomainId.of(DomainId.AIOS), domainName: 'AIOS System Core', category: 'CORE', description: 'AIOS Core Infrastructure' }],
      defaultSkills: [{ skillId: 'SKILL_TS', skillName: 'TypeScript', category: 'LANG', level: SkillLevel.MASTER }],
      defaultCapabilities: [EmployeeCapability.READ_CODE, EmployeeCapability.ANALYZE, EmployeeCapability.REVIEW],
      defaultPermissions: [EmployeePermission.CAN_CREATE_TASK, EmployeePermission.CAN_APPROVE]
    },
    IMPL_ENG: {
      templateId: 'tpl-impl-eng',
      templateName: 'Implementation Engineer Template',
      profession: StandardProfessionCatalog.IMPLEMENTATION_ENGINEER,
      defaultMissions: [
        {
          missionId: MissionId.of(MissionId.MISSION_BUILD_RUNTIME),
          title: 'Code Implementation',
          purpose: 'Implement modules cleanly according to specs',
          expectedDeliverable: 'Tested TypeScript code',
          definitionOfDone: ['100% test pass', 'Zero linter warnings'],
          qualityCriteria: ['Clean code adherence']
        }
      ],
      defaultDomains: [{ domainId: DomainId.of(DomainId.AIOS), domainName: 'AIOS Core', category: 'CORE', description: 'AIOS Engine' }],
      defaultSkills: [{ skillId: 'SKILL_TS', skillName: 'TypeScript', category: 'LANG', level: SkillLevel.EXPERT }],
      defaultCapabilities: [EmployeeCapability.WRITE_CODE, EmployeeCapability.READ_CODE, EmployeeCapability.TEST],
      defaultPermissions: [EmployeePermission.CAN_EXECUTE]
    },
    VAL_SPEC: {
      templateId: 'tpl-val-spec',
      templateName: 'Validation Specialist Template',
      profession: StandardProfessionCatalog.VALIDATION_SPECIALIST,
      defaultMissions: [
        {
          missionId: MissionId.of(MissionId.MISSION_VALIDATE_OUTPUT),
          title: 'Evidence Verification',
          purpose: 'Verify task execution evidence and SHA-256 integrity',
          expectedDeliverable: 'Governance ALLOW decision',
          definitionOfDone: ['Evidence SHA-256 matches', 'Gate check ALLOW'],
          qualityCriteria: ['Zero false positives']
        }
      ],
      defaultDomains: [{ domainId: DomainId.of(DomainId.AIOS), domainName: 'AIOS Governance', category: 'CORE', description: 'Governance Gate' }],
      defaultSkills: [{ skillId: 'SKILL_TEST', skillName: 'Testing & Evidence Verification', category: 'QA', level: SkillLevel.EXPERT }],
      defaultCapabilities: [EmployeeCapability.VERIFY, EmployeeCapability.REVIEW],
      defaultPermissions: [EmployeePermission.CAN_APPROVE]
    },
    DEPLOY_ENG: {
      templateId: 'tpl-deploy-eng',
      templateName: 'Deployment Engineer Template',
      profession: StandardProfessionCatalog.DEPLOYMENT_ENGINEER,
      defaultMissions: [
        {
          missionId: MissionId.of(MissionId.MISSION_DEPLOY_SYSTEM),
          title: 'System Deployment',
          purpose: 'Package and deploy production builds',
          expectedDeliverable: 'Deployed production release',
          definitionOfDone: ['Production build succeeds', 'Bridge status CONNECTED'],
          qualityCriteria: ['Zero downtime']
        }
      ],
      defaultDomains: [
        { domainId: DomainId.of(DomainId.FIELD_OPS), domainName: 'Field Operations Application', category: 'APP', description: 'Field Operations System' },
        { domainId: DomainId.of(DomainId.GAS), domainName: 'Google Apps Script', category: 'CLOUD', description: 'GAS Backend API' }
      ],
      defaultSkills: [{ skillId: 'SKILL_GIT', skillName: 'Git & Deployment Automation', category: 'OPS', level: SkillLevel.EXPERT }],
      defaultCapabilities: [EmployeeCapability.DEPLOY, EmployeeCapability.VERIFY],
      defaultPermissions: [EmployeePermission.CAN_DEPLOY]
    }
  };
}
