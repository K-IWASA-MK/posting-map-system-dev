/**
 * ExecutionCoordinator.ts
 * 
 * AIOS Execution Coordinator Interface & Default Implementation
 * 
 * AIEmployeeTaskOrchestrator と Execution Runtime の間の実行委譲抽象インターフェース。
 * オーケストレーターを特定Runtime実装から分離し、将来のQueue化・分散化・別Runtime追加に対する拡張性を担保する。
 */

import { VerificationCapability } from '../../verification';
import { AIEmployeeExecutionRuntime, ExecutionRuntimeResult } from '../AIEmployeeExecutionRuntime';

export interface ExecutionCoordinator {
  execute(
    taskId: string,
    employeeId: string,
    planId: string,
    capabilities?: readonly VerificationCapability[]
  ): Promise<ExecutionRuntimeResult>;
}

export class DefaultExecutionCoordinator implements ExecutionCoordinator {
  async execute(
    taskId: string,
    employeeId: string,
    planId: string,
    capabilities: readonly VerificationCapability[] = []
  ): Promise<ExecutionRuntimeResult> {
    return AIEmployeeExecutionRuntime.executeTaskPlan(taskId, planId, capabilities);
  }
}
