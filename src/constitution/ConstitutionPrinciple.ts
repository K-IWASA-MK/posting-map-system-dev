/**
 * ConstitutionPrinciple.ts
 * 
 * Defines the core structure and types for AIOS Constitution Principles.
 * Principles are immutable governance declarations of the AIOS platform.
 */

export type PrincipleCategory = 
  | 'DISPATCH'
  | 'OWNERSHIP'
  | 'KNOWLEDGE_BOUNDARY'
  | 'RETENTION'
  | 'SANITIZATION'
  | 'AUTONOMY'
  | 'EXTENDED';

export interface ConstitutionPrinciple {
  readonly id: string;
  readonly code: string; // e.g. 'PRINCIPLE_001'
  readonly title: string;
  readonly category: PrincipleCategory;
  readonly statement: string;
  readonly rationale: string;
}

export const STANDARD_PRINCIPLE_IDS = {
  DISPATCH_PRINCIPLE: 'PRIN_001',
  PROJECT_OWNERSHIP_PRINCIPLE: 'PRIN_002',
  KNOWLEDGE_BOUNDARY_PRINCIPLE: 'PRIN_003',
  NO_ARTIFACT_RETENTION_PRINCIPLE: 'PRIN_004',
  KNOWLEDGE_SANITIZATION_PRINCIPLE: 'PRIN_005',
  PROJECT_AUTONOMY_PRINCIPLE: 'PRIN_006'
} as const;

export const STANDARD_PRINCIPLES: readonly ConstitutionPrinciple[] = Object.freeze([
  Object.freeze({
    id: STANDARD_PRINCIPLE_IDS.DISPATCH_PRINCIPLE,
    code: 'PRINCIPLE_001',
    title: 'AI Workforce Dispatch Principle',
    category: 'DISPATCH',
    statement: 'AIOS dispatches AI Employees to requesting projects. Upon task completion, AI Employees must return all produced artifacts and state directly to the project.',
    rationale: 'AIOS acts strictly as an AI Employee dispatch platform rather than an external execution lock.'
  }),
  Object.freeze({
    id: STANDARD_PRINCIPLE_IDS.PROJECT_OWNERSHIP_PRINCIPLE,
    code: 'PRINCIPLE_002',
    title: 'Project Ownership Principle',
    category: 'OWNERSHIP',
    statement: 'Source code, documents, data, settings, produced artifacts, and execution state belong strictly to the project. AIOS shall not claim ownership.',
    rationale: 'Project autonomy requires complete ownership of all project assets and data.'
  }),
  Object.freeze({
    id: STANDARD_PRINCIPLE_IDS.KNOWLEDGE_BOUNDARY_PRINCIPLE,
    code: 'PRINCIPLE_003',
    title: 'Knowledge Boundary Principle',
    category: 'KNOWLEDGE_BOUNDARY',
    statement: 'AIOS may retain only reusable skills, generalized knowledge, experiences, best practices, metrics, and quality improvement information. Retention of project-specific data is strictly forbidden.',
    rationale: 'Prevents intellectual property leakage and preserves multi-tenant isolation.'
  }),
  Object.freeze({
    id: STANDARD_PRINCIPLE_IDS.NO_ARTIFACT_RETENTION_PRINCIPLE,
    code: 'PRINCIPLE_004',
    title: 'No Artifact Retention Principle',
    category: 'RETENTION',
    statement: 'AI Employees must not retain or bring back project files, project documents, project databases, project secrets, or runtime state back to AIOS platform storage.',
    rationale: 'Guarantees stateless dispatch and project privacy.'
  }),
  Object.freeze({
    id: STANDARD_PRINCIPLE_IDS.KNOWLEDGE_SANITIZATION_PRINCIPLE,
    code: 'PRINCIPLE_005',
    title: 'Knowledge Sanitization Principle',
    category: 'SANITIZATION',
    statement: 'All knowledge registered into AIOS must be stripped of project-specific identifiers and confidential data prior to registration.',
    rationale: 'Ensures platform-level knowledge remains universally applicable and sanitized.'
  }),
  Object.freeze({
    id: STANDARD_PRINCIPLE_IDS.PROJECT_AUTONOMY_PRINCIPLE,
    code: 'PRINCIPLE_006',
    title: 'Project Autonomy Principle',
    category: 'AUTONOMY',
    statement: 'AI Employees shall respect project responsibilities, boundaries, and rules. AIOS does not own, manage, or alter the business logic of the requesting project.',
    rationale: 'Ensures projects retain full authority and governance over their own domains.'
  })
]);
