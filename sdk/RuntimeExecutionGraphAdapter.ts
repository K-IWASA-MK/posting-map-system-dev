import { ExecutionGraph } from './RuntimeExecutionGraphRegistry';

/**
 * RuntimeExecutionGraphAdapter.ts
 * 
 * ExecutionGraph レコードを UI 表示用の Immutable な ViewModel へ変換するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface ExecutionGraphViewModel {
  readonly id: string;
  readonly name: string;
  readonly planIds: readonly string[];
  readonly descriptionText: string;
  readonly stateLabel: string;
  readonly graphLabel: string;
  readonly displayName: string;
  readonly planCount: number;
  readonly createdTimestamp: string;
  readonly updatedTimestamp: string;
}

export class RuntimeExecutionGraphAdapter {
  /**
   * ExecutionGraph レコードを不変な ExecutionGraphViewModel へ変換する
   */
  static toViewModel(graph: ExecutionGraph): ExecutionGraphViewModel {
    if (!graph) {
      throw new Error('[RuntimeExecutionGraphAdapter] ExecutionGraph cannot be empty');
    }

    const viewModel: ExecutionGraphViewModel = {
      id: graph.graphId,
      name: graph.graphName,
      planIds: Object.freeze([...graph.planIds]),
      descriptionText: graph.description || '',
      stateLabel: String(graph.graphState),
      graphLabel: `Graph: ${graph.graphName}`,
      displayName: `Execution Graph: ${graph.graphName} [Plans: ${graph.planIds.length}] (${graph.graphId})`,
      planCount: graph.planIds.length,
      createdTimestamp: graph.createdAt,
      updatedTimestamp: graph.updatedAt
    };

    return Object.freeze(viewModel);
  }
}
