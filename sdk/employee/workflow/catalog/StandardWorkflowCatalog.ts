/**
 * StandardWorkflowCatalog.ts
 * 
 * Standard Workflow Blueprints Catalog for AIOS
 */

import { WorkflowBlueprint } from '../blueprint/types/WorkflowBlueprint';
import { WorkflowCategory } from '../types/WorkflowCategory';
import { StageId } from '../stage/types/StageId';
import { StageState } from '../stage/types/StageState';
import { ProfessionCategory } from '../../profession/types/ProfessionCategory';
import { MissionId } from '../../profession/mission/types/MissionId';

export class StandardWorkflowCatalog {
  public static readonly RESEARCH_WORKFLOW: WorkflowBlueprint = {
    blueprintId: 'bp-wf-research',
    workflowName: 'Research Workflow',
    category: WorkflowCategory.RESEARCH,
    description: 'Technical investigation and requirement analysis',
    stages: [
      {
        stageId: StageId.of('STG_RESEARCH'),
        stageName: 'Technical Research Stage',
        order: 1,
        requiredProfessionCategory: ProfessionCategory.RESEARCH,
        requiredMissionId: MissionId.MISSION_BUILD_RUNTIME,
        state: StageState.PENDING,
        inputs: ['Task Specification'],
        expectedOutputs: ['Research Notes & Architecture Specs'],
        producedArtifacts: ['research_notes.md']
      }
    ]
  };

  public static readonly IMPLEMENTATION_WORKFLOW: WorkflowBlueprint = {
    blueprintId: 'bp-wf-implementation',
    workflowName: 'Implementation Workflow',
    category: WorkflowCategory.ENGINEERING,
    description: 'Code implementation and feature construction',
    stages: [
      {
        stageId: StageId.of('STG_IMPLEMENTATION'),
        stageName: 'Code Implementation Stage',
        order: 1,
        requiredProfessionCategory: ProfessionCategory.ENGINEERING,
        requiredMissionId: MissionId.MISSION_BUILD_RUNTIME,
        state: StageState.PENDING,
        inputs: ['Architecture Spec'],
        expectedOutputs: ['Tested Code Modules'],
        producedArtifacts: ['source_code.ts']
      }
    ]
  };

  public static readonly VALIDATION_WORKFLOW: WorkflowBlueprint = {
    blueprintId: 'bp-wf-validation',
    workflowName: 'Validation Workflow',
    category: WorkflowCategory.QUALITY_ASSURANCE,
    description: 'Evidence verification and governance gate check',
    stages: [
      {
        stageId: StageId.of('STG_VALIDATION'),
        stageName: 'Evidence & Governance Validation Stage',
        order: 1,
        requiredProfessionCategory: ProfessionCategory.QUALITY_ASSURANCE,
        requiredMissionId: MissionId.MISSION_VALIDATE_OUTPUT,
        state: StageState.PENDING,
        inputs: ['Execution Evidence & Artifacts'],
        expectedOutputs: ['Governance ALLOW Gate Decision'],
        producedArtifacts: ['validation_report.json']
      }
    ]
  };

  public static readonly DEPLOYMENT_WORKFLOW: WorkflowBlueprint = {
    blueprintId: 'bp-wf-deployment',
    workflowName: 'Deployment Workflow',
    category: WorkflowCategory.DEPLOYMENT,
    description: 'System packaging and deployment execution',
    stages: [
      {
        stageId: StageId.of('STG_DEPLOYMENT'),
        stageName: 'System Deployment Stage',
        order: 1,
        requiredProfessionCategory: ProfessionCategory.OPERATIONS,
        requiredMissionId: MissionId.MISSION_DEPLOY_SYSTEM,
        state: StageState.PENDING,
        inputs: ['Verified Release Package'],
        expectedOutputs: ['Deployed Release Build'],
        producedArtifacts: ['deployment_manifest.json']
      }
    ]
  };

  public static readonly DOCUMENTATION_WORKFLOW: WorkflowBlueprint = {
    blueprintId: 'bp-wf-documentation',
    workflowName: 'Documentation Workflow',
    category: WorkflowCategory.ENGINEERING,
    description: 'Architecture documentation and handover update',
    stages: [
      {
        stageId: StageId.of('STG_DOCUMENTATION'),
        stageName: 'Documentation Stage',
        order: 1,
        requiredProfessionCategory: ProfessionCategory.DOCUMENTATION,
        state: StageState.PENDING,
        inputs: ['Completed Task Summary'],
        expectedOutputs: ['Updated HANDOVER.md and Spec docs'],
        producedArtifacts: ['HANDOVER.md']
      }
    ]
  };

  public static readonly AUDIT_WORKFLOW: WorkflowBlueprint = {
    blueprintId: 'bp-wf-audit',
    workflowName: 'Audit Workflow',
    category: WorkflowCategory.GOVERNANCE,
    description: 'Autonomous E2E reality audit and compliance verification',
    stages: [
      {
        stageId: StageId.of('STG_AUDIT'),
        stageName: 'E2E Reality Audit Stage',
        order: 1,
        requiredProfessionCategory: ProfessionCategory.GOVERNANCE,
        state: StageState.PENDING,
        inputs: ['System State Logs'],
        expectedOutputs: ['Audit Report & Compliance Result'],
        producedArtifacts: ['audit_report.json']
      }
    ]
  };

  public static readonly E2E_FULL_DELIVERY_WORKFLOW: WorkflowBlueprint = {
    blueprintId: 'bp-wf-e2e-delivery',
    workflowName: 'End-to-End Full Delivery Workflow',
    category: WorkflowCategory.ENGINEERING,
    description: 'Full delivery pipeline: Research ➔ Validation ➔ Implementation ➔ QA ➔ Deployment',
    stages: [
      {
        stageId: StageId.of('STG_1_RESEARCH'),
        stageName: '1. Research Stage',
        order: 1,
        requiredProfessionCategory: ProfessionCategory.RESEARCH,
        requiredMissionId: MissionId.MISSION_BUILD_RUNTIME,
        state: StageState.PENDING,
        inputs: ['Task Request'],
        expectedOutputs: ['Research Report'],
        producedArtifacts: ['research_notes.md']
      },
      {
        stageId: StageId.of('STG_2_VALIDATION'),
        stageName: '2. Validation Stage',
        order: 2,
        requiredProfessionCategory: ProfessionCategory.QUALITY_ASSURANCE,
        requiredMissionId: MissionId.MISSION_VALIDATE_OUTPUT,
        state: StageState.PENDING,
        prerequisiteStageIds: ['STG_1_RESEARCH'],
        inputs: ['Research Report'],
        expectedOutputs: ['Approved Spec'],
        producedArtifacts: ['approved_spec.md']
      },
      {
        stageId: StageId.of('STG_3_IMPLEMENTATION'),
        stageName: '3. Implementation Stage',
        order: 3,
        requiredProfessionCategory: ProfessionCategory.ENGINEERING,
        requiredMissionId: MissionId.MISSION_BUILD_RUNTIME,
        state: StageState.PENDING,
        prerequisiteStageIds: ['STG_2_VALIDATION'],
        inputs: ['Approved Spec'],
        expectedOutputs: ['Implemented Feature'],
        producedArtifacts: ['code_changes.ts']
      },
      {
        stageId: StageId.of('STG_4_QA'),
        stageName: '4. QA Stage',
        order: 4,
        requiredProfessionCategory: ProfessionCategory.QUALITY_ASSURANCE,
        state: StageState.PENDING,
        prerequisiteStageIds: ['STG_3_IMPLEMENTATION'],
        inputs: ['Implemented Feature'],
        expectedOutputs: ['Test Suite Pass Report'],
        producedArtifacts: ['test_report.json']
      },
      {
        stageId: StageId.of('STG_5_DEPLOYMENT'),
        stageName: '5. Deployment Stage',
        order: 5,
        requiredProfessionCategory: ProfessionCategory.OPERATIONS,
        requiredMissionId: MissionId.MISSION_DEPLOY_SYSTEM,
        state: StageState.PENDING,
        prerequisiteStageIds: ['STG_4_QA'],
        inputs: ['Test Suite Pass Report'],
        expectedOutputs: ['Production Release Deployed'],
        producedArtifacts: ['deployment_summary.json']
      }
    ]
  };

  public static getAllStandardBlueprints(): WorkflowBlueprint[] {
    return [
      StandardWorkflowCatalog.RESEARCH_WORKFLOW,
      StandardWorkflowCatalog.IMPLEMENTATION_WORKFLOW,
      StandardWorkflowCatalog.VALIDATION_WORKFLOW,
      StandardWorkflowCatalog.DEPLOYMENT_WORKFLOW,
      StandardWorkflowCatalog.DOCUMENTATION_WORKFLOW,
      StandardWorkflowCatalog.AUDIT_WORKFLOW,
      StandardWorkflowCatalog.E2E_FULL_DELIVERY_WORKFLOW
    ];
  }
}
