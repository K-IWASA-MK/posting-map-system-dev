/**
 * AIOS Employee Workflow Orchestration Foundation
 * Abstraction Interfaces for Workflow Registry, Dependency Resolver, State Engine, and Orchestration Engine
 */

import {
  WorkflowAuditRecord,
  WorkflowRecord,
  WorkflowStatus,
  WorkflowTask,
} from '../models/EmployeeWorkflowModels';
import { EnforcementRecord } from '../../enforcement/models/EmployeeEnforcementModels';

export interface IWorkflowRegistry {
  registerWorkflow(workflow: WorkflowRecord): WorkflowRecord;
  createNewVersion(workflowId: string, updatedTasks: WorkflowTask[]): WorkflowRecord;
  getWorkflow(workflowId: string): WorkflowRecord;
  listWorkflows(): WorkflowRecord[];
}

export interface IDependencyResolver {
  validateDependencies(workflow: WorkflowRecord): { valid: boolean; reason?: string };
  getReadyTasks(workflow: WorkflowRecord): WorkflowTask[];
}

export interface IWorkflowStateEngine {
  transitionState(
    currentStatus: WorkflowStatus,
    targetStatus: WorkflowStatus
  ): WorkflowStatus;
}

export interface IEmployeeWorkflowOrchestrationEngine {
  registerWorkflow(workflow: WorkflowRecord): WorkflowRecord;
  startWorkflow(workflowId: string): WorkflowRecord;
  processNextStep(
    workflowId: string,
    taskId: string,
    enforcementRecord: Readonly<EnforcementRecord>
  ): WorkflowRecord;
  getWorkflow(workflowId: string): WorkflowRecord;
  getAuditLogs(workflowId?: string): WorkflowAuditRecord[];
}
