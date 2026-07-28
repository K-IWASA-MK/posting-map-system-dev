/**
 * WorkflowSelector.ts
 * 
 * AIOS Task Gateway Workflow Profile Selector
 * Deterministic mapping from TaskIntent to AIOS Standard Workflow Profile & Stage Pipeline.
 */

import { TaskIntent } from '../models/TaskGatewayModels';
import { WorkflowProfileDefinition, WorkflowProfileType, WorkflowStage } from '../models/WorkflowProfileModels';

export class WorkflowSelector {
  private static readonly PROFILES: Record<WorkflowProfileType, WorkflowProfileDefinition> = {
    STANDARD_DEVELOPMENT: Object.freeze({
      profileName: 'STANDARD_DEVELOPMENT',
      description: 'Standard AIOS Development Lifecycle (Plan -> Architecture -> Implement -> Verify -> Review -> Commit)',
      workflowStages: Object.freeze<ReadonlyArray<WorkflowStage>>([
        'PLAN',
        'REVIEW',
        'PROCEED',
        'IMPLEMENTATION',
        'VERIFICATION',
        'GIT_COMMIT',
        'GIT_PUSH',
        'WALKTHROUGH',
        'HANDOVER',
        'CLOSE'
      ]),
      requiredCapabilities: Object.freeze(['GIT_ACCESS', 'TEST_RUNNER', 'FILE_SYSTEM']),
      defaultPriority: 'NORMAL'
    }),
    RESEARCH: Object.freeze({
      profileName: 'RESEARCH',
      description: 'AIOS Technical & Data Research Workflow (Plan -> Investigate -> Verify -> Report)',
      workflowStages: Object.freeze<ReadonlyArray<WorkflowStage>>([
        'PLAN',
        'INVESTIGATION',
        'VERIFICATION',
        'WALKTHROUGH',
        'CLOSED'
      ]),
      requiredCapabilities: Object.freeze(['BROWSER_AUTOMATION', 'FILE_SYSTEM']),
      defaultPriority: 'NORMAL'
    }),
    REVIEW: Object.freeze({
      profileName: 'REVIEW',
      description: 'AIOS Code & Architecture Review Workflow (Plan -> Inspect & Review -> Walkthrough)',
      workflowStages: Object.freeze<ReadonlyArray<WorkflowStage>>([
        'PLAN',
        'REVIEW',
        'WALKTHROUGH',
        'CLOSED'
      ]),
      requiredCapabilities: Object.freeze(['FILE_SYSTEM', 'STATIC_ANALYSIS']),
      defaultPriority: 'NORMAL'
    }),
    AUDIT: Object.freeze({
      profileName: 'AUDIT',
      description: 'AIOS System & Security Governance Audit Workflow (Plan -> Audit Check -> Verify -> Walkthrough)',
      workflowStages: Object.freeze<ReadonlyArray<WorkflowStage>>([
        'PLAN',
        'AUDIT_CHECK',
        'VERIFICATION',
        'WALKTHROUGH',
        'CLOSED'
      ]),
      requiredCapabilities: Object.freeze(['FILE_SYSTEM', 'AUDIT_LOG_READER']),
      defaultPriority: 'HIGH'
    }),
    HOTFIX: Object.freeze({
      profileName: 'HOTFIX',
      description: 'AIOS Hotfix & Emergency Patch Workflow (Plan -> Implement -> Verify -> Review -> Closed)',
      workflowStages: Object.freeze<ReadonlyArray<WorkflowStage>>([
        'PLAN',
        'IMPLEMENTATION',
        'VERIFICATION',
        'REVIEW',
        'CLOSED'
      ]),
      requiredCapabilities: Object.freeze(['GIT_ACCESS', 'TEST_RUNNER', 'FILE_SYSTEM']),
      defaultPriority: 'CRITICAL'
    }),
    PLANNING: Object.freeze({
      profileName: 'PLANNING',
      description: 'AIOS Architecture & Feature Planning Workflow (Plan -> Review -> CEO Approval)',
      workflowStages: Object.freeze<ReadonlyArray<WorkflowStage>>([
        'PLAN',
        'REVIEW',
        'CEO_APPROVAL',
        'CLOSED'
      ]),
      requiredCapabilities: Object.freeze(['FILE_SYSTEM']),
      defaultPriority: 'HIGH'
    }),
    QUESTION: Object.freeze({
      profileName: 'QUESTION',
      description: 'AIOS Inquiry & Investigation Workflow',
      workflowStages: Object.freeze<ReadonlyArray<WorkflowStage>>([
        'INVESTIGATION',
        'CLOSED'
      ]),
      requiredCapabilities: Object.freeze(['FILE_SYSTEM']),
      defaultPriority: 'LOW'
    }),
    DOCUMENTATION: Object.freeze({
      profileName: 'DOCUMENTATION',
      description: 'AIOS Documentation & Specification Workflow',
      workflowStages: Object.freeze<ReadonlyArray<WorkflowStage>>([
        'PLAN',
        'REVIEW',
        'WALKTHROUGH',
        'CLOSED'
      ]),
      requiredCapabilities: Object.freeze(['FILE_SYSTEM', 'DOCUMENTATION']),
      defaultPriority: 'NORMAL'
    })
  };

  /**
   * Deterministically selects the WorkflowProfileDefinition for a given TaskIntent.
   * Stateless & Side-Effect Free.
   */
  public static selectWorkflow(intent: TaskIntent): WorkflowProfileDefinition {
    switch (intent) {
      case 'IMPLEMENTATION':
      case 'DESIGN':
        return WorkflowSelector.PROFILES.STANDARD_DEVELOPMENT;
      case 'RESEARCH':
        return WorkflowSelector.PROFILES.RESEARCH;
      case 'REVIEW':
        return WorkflowSelector.PROFILES.REVIEW;
      case 'AUDIT':
        return WorkflowSelector.PROFILES.AUDIT;
      case 'HOTFIX':
        return WorkflowSelector.PROFILES.HOTFIX;
      case 'PLANNING':
        return WorkflowSelector.PROFILES.PLANNING;
      case 'QUESTION':
        return WorkflowSelector.PROFILES.QUESTION;
      default:
        return WorkflowSelector.PROFILES.STANDARD_DEVELOPMENT;
    }
  }

  /**
   * Retrieves all defined workflow profiles.
   */
  public static getAllProfiles(): ReadonlyArray<WorkflowProfileDefinition> {
    return Object.freeze(Object.values(WorkflowSelector.PROFILES));
  }
}
