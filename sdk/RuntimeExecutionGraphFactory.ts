import { ExecutionGraph, RuntimeExecutionGraphState } from './RuntimeExecutionGraphRegistry';

/**
 * RuntimeExecutionGraphFactory.ts
 * 
 * 不変な ExecutionGraph レコードを決定論的かつ安全に生成するファクトリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class RuntimeExecutionGraphFactory {
  private static counter = 0;

  /**
   * 決定論的な ID（graph-1, graph-2...）を持つ不変な ExecutionGraph を生成する
   */
  static create(
    name: string,
    planIds: readonly string[],
    graphState: RuntimeExecutionGraphState,
    description: string = '',
    version: string = '1.0.0'
  ): ExecutionGraph {
    if (!name) {
      throw new Error('[RuntimeExecutionGraphFactory] graphName is required');
    }
    if (!planIds) {
      throw new Error('[RuntimeExecutionGraphFactory] planIds list is required');
    }
    if (!graphState) {
      throw new Error('[RuntimeExecutionGraphFactory] graphState is required');
    }

    this.counter++;
    const id = `graph-${this.counter}`;
    const now = new Date().toISOString();

    const graph: ExecutionGraph = {
      graphId: id,
      graphName: name,
      planIds: Object.freeze([...planIds]),
      graphState: graphState,
      description: description || '',
      createdAt: now,
      updatedAt: now,
      version: version
    };

    return Object.freeze(graph);
  }

  /**
   * カウンターをリセットする (テスト用)
   */
  static resetCounter(): void {
    this.counter = 0;
  }
}
