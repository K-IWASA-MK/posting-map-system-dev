import { ExecutionGraph, RuntimeExecutionGraphState } from './RuntimeExecutionGraphRegistry';
import { RuntimeExecutionPlanRegistry } from './RuntimeExecutionPlanRegistry';

/**
 * RuntimeExecutionGraphValidator.ts
 * 
 * ExecutionGraph 定義の妥当性および Runtime Execution Plan 参照整合性を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeExecutionGraphValidator {
  /**
   * ExecutionGraph の定義が正当であるか検証する
   * 不正な場合は例外をスローする
   */
  static validate(graph: ExecutionGraph): void {
    if (!graph) {
      throw new Error('[RuntimeExecutionGraphValidator] ExecutionGraph is empty');
    }

    // 1. Graph ID 検証
    if (!graph.graphId || !/^graph-\d+$/.test(graph.graphId)) {
      throw new Error(`[RuntimeExecutionGraphValidator] Invalid graphId format: ${graph.graphId}`);
    }

    // 2. Name 検証
    if (!graph.graphName || typeof graph.graphName !== 'string' || graph.graphName.trim() === '') {
      throw new Error('[RuntimeExecutionGraphValidator] graphName is required and must be a non-empty string');
    }

    // 3. State 検証
    if (!graph.graphState || !Object.values(RuntimeExecutionGraphState).includes(graph.graphState)) {
      throw new Error(`[RuntimeExecutionGraphValidator] Invalid graphState: ${graph.graphState}`);
    }

    // 4. Version 検証
    if (!graph.version || typeof graph.version !== 'string' || graph.version.trim() === '') {
      throw new Error('[RuntimeExecutionGraphValidator] version is required and must be a non-empty string');
    }

    // 5. planIds 件数・存在検証
    if (!graph.planIds) {
      throw new Error('[RuntimeExecutionGraphValidator] planIds is required');
    }
    if (graph.planIds.length === 0) {
      throw new Error('[RuntimeExecutionGraphValidator] planIds cannot be empty: minimum 1 plan is required');
    }

    // 5.1 Plan ID 重複検証 (DUPLICATE_PLAN_REFERENCE)
    const seenPlans = new Set<string>();
    for (const planId of graph.planIds) {
      if (seenPlans.has(planId)) {
        throw new Error(`[RuntimeExecutionGraphValidator] Duplicate plan reference found in planIds list: ${planId}`);
      }
      seenPlans.add(planId);
    }

    // 5.2 Plan ID 順序検証 (INVALID_PLAN_ORDER)
    const sortedPlanIds = [...graph.planIds].sort();
    for (let i = 0; i < graph.planIds.length; i++) {
      if (graph.planIds[i] !== sortedPlanIds[i]) {
        throw new Error(`[RuntimeExecutionGraphValidator] Invalid plan order: planIds must be sorted: ${graph.planIds.join(', ')}`);
      }
    }

    // 5.3 Referential Integrity: Plan 存在検証 (INVALID_PLAN_REFERENCE) (SSOT)
    for (const planId of graph.planIds) {
      const plan = RuntimeExecutionPlanRegistry.get(planId);
      if (!plan) {
        throw new Error(`[RuntimeExecutionGraphValidator] Execution Plan dependency not registered in RuntimeExecutionPlanRegistry: ${planId}`);
      }
    }

    // 6. ISO8601 時刻形式検証
    const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!graph.createdAt || !iso8601Pattern.test(graph.createdAt)) {
      throw new Error(`[RuntimeExecutionGraphValidator] Invalid createdAt ISO8601 format: ${graph.createdAt}`);
    }
    if (!graph.updatedAt || !iso8601Pattern.test(graph.updatedAt)) {
      throw new Error(`[RuntimeExecutionGraphValidator] Invalid updatedAt ISO8601 format: ${graph.updatedAt}`);
    }

    // 7. createdAt <= updatedAt 検証 (INVALID_GRAPH_DATE)
    const createdTime = new Date(graph.createdAt).getTime();
    const updatedTime = new Date(graph.updatedAt).getTime();
    if (isNaN(createdTime) || isNaN(updatedTime) || createdTime > updatedTime) {
      throw new Error(`[RuntimeExecutionGraphValidator] Invalid graph date sequence: createdAt (${graph.createdAt}) must be less than or equal to updatedAt (${graph.updatedAt})`);
    }
  }
}
