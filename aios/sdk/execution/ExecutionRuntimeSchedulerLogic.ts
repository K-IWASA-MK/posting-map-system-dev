import { DevelopmentRule, DevelopmentRules } from '../aios/DevelopmentRules';

/**
 * ExecutionRuntimeSchedulerLogic.ts
 * 
 * Execution Runtime Scheduler Logic Foundation (SSOT).
 * キュー結果 (RuntimeQueueResult) を受け取り、静的スケジュール情報を構築する。
 * 
 * 警告：本ファイル内への実際のスケジュール登録・ジョブ起動等の Active な Runtime 処理
 * （schedule, unschedule, start, stop 等）の実装は厳禁である。
 */

export enum SchedulerStatus {
  READY = 'READY',
  WAITING = 'WAITING',
  BLOCKED = 'BLOCKED',
  UNKNOWN = 'UNKNOWN'
}

export interface RuntimeSchedulerMetadata {
  readonly author: string;
  readonly version: string;
  readonly phase: string;
}

export interface RuntimeSchedulerResult {
  readonly runtimeManagerId: string;
  readonly runtimeSessionId: string;
  readonly runtimeContextId: string;
  readonly runtimeRegistryId: string;
  readonly runtimeResolverId: string;
  readonly hydratorId: string;
  readonly validatorId: string;
  readonly dispatcherId: string;
  readonly queueId: string;
  readonly schedulerId: string;
  readonly schedulerStatus: SchedulerStatus;
}

export interface RuntimeSchedulerLogic {
  scheduleRuntime(rule: DevelopmentRule): RuntimeSchedulerResult | undefined;
  getSchedulerMetadata(): RuntimeSchedulerMetadata;
}

// 1. メタデータの作成と凍結
const schedulerMetadata: RuntimeSchedulerMetadata = Object.freeze({
  author: 'AIOS Team',
  version: '1.0.0',
  phase: 'Phase 205-6'
});

// 2. 決定論的なスケジュール情報の事前作成と凍結
const staticSchedulerResult: RuntimeSchedulerResult = Object.freeze({
  runtimeManagerId: 'runtime-manager-01',
  runtimeSessionId: 'runtime-session-01',
  runtimeContextId: 'runtime-context-01',
  runtimeRegistryId: 'registry-runtime-01',
  runtimeResolverId: 'runtime-resolver-01',
  hydratorId: 'context-hydrator-01',
  validatorId: 'blueprint-validator-01',
  dispatcherId: 'runtime-dispatcher-01',
  queueId: 'queue-1',
  schedulerId: 'scheduler-1',
  schedulerStatus: SchedulerStatus.READY
});

// Scheduler Logic 本体の実装と凍結
export const EXECUTION_RUNTIME_SCHEDULER_LOGIC: RuntimeSchedulerLogic = Object.freeze({
  scheduleRuntime(rule: DevelopmentRule): RuntimeSchedulerResult | undefined {
    // 1. Queue Logic による解決を行う (依存関係: Queue -> Scheduler の一方向)
    const queueResult = DevelopmentRules.getExecutionRuntimeQueueLogic(rule);
    if (!queueResult) {
      return undefined;
    }
    // 2. 構造化されたスケジュール情報を返却する
    return staticSchedulerResult;
  },

  getSchedulerMetadata(): RuntimeSchedulerMetadata {
    return schedulerMetadata;
  }
});
