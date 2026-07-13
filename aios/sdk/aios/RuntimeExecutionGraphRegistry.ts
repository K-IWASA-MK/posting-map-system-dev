import { RuntimeExecutionGraphValidator } from './RuntimeExecutionGraphValidator';

/**
 * RuntimeExecutionGraphRegistry.ts
 * 
 * Development OS における実行グラフの状態および定義を一元管理する不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum RuntimeExecutionGraphState {
  CREATED = 'CREATED',
  READY = 'READY',
  VALIDATED = 'VALIDATED',
  PLANNED = 'PLANNED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED'
}

export interface ExecutionGraph {
  readonly graphId: string;
  readonly graphName: string;
  readonly planIds: readonly string[];
  readonly graphState: RuntimeExecutionGraphState;
  readonly description: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class RuntimeExecutionGraphRegistry {
  private static registry: Map<string, ExecutionGraph> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-runtime-execution-graph-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T10:45:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T10:45:00Z').toISOString()
  });

  /**
   * ExecutionGraph を登録する
   */
  static register(graph: ExecutionGraph): void {
    if (!graph) {
      throw new Error('[RuntimeExecutionGraphRegistry] ExecutionGraph cannot be empty');
    }
    if (!graph.graphId) {
      throw new Error('[RuntimeExecutionGraphRegistry] graphId is required');
    }
    if (!graph.graphName) {
      throw new Error('[RuntimeExecutionGraphRegistry] graphName is required');
    }

    // ID重複チェック
    if (this.registry.has(graph.graphId)) {
      throw new Error(`[RuntimeExecutionGraphRegistry] ExecutionGraph ID already registered: ${graph.graphId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.graphName === graph.graphName) {
        throw new Error(`[RuntimeExecutionGraphRegistry] ExecutionGraph Name already registered: ${graph.graphName}`);
      }
    }

    // バリデーションの実行
    RuntimeExecutionGraphValidator.validate(graph);

    // 完全な不変性を担保して格納
    this.registry.set(graph.graphId, Object.freeze({
      ...graph,
      planIds: Object.freeze([...graph.planIds])
    }));
  }

  /**
   * IDから ExecutionGraph を取得する
   */
  static get(id: string): ExecutionGraph | undefined {
    return this.registry.get(id);
  }

  /**
   * 名前から ExecutionGraph を検索・取得する
   */
  static findByName(name: string): ExecutionGraph | undefined {
    for (const graph of this.registry.values()) {
      if (graph.graphName === name) {
        return graph;
      }
    }
    return undefined;
  }

  /**
   * IDが存在するか判定する
   */
  static exists(id: string): boolean {
    return this.registry.has(id);
  }

  /**
   * 登録された ExecutionGraph の総件数を取得する
   */
  static count(): number {
    return this.registry.size;
  }

  /**
   * Plan ID から関連する ExecutionGraph のリストを検索する
   */
  static findByPlan(planId: string): ExecutionGraph[] {
    const results: ExecutionGraph[] = [];
    for (const graph of this.registry.values()) {
      if (graph.planIds.includes(planId)) {
        results.push(graph);
      }
    }
    return results;
  }

  /**
   * State から関連する ExecutionGraph のリストを検索する
   */
  static findByState(state: RuntimeExecutionGraphState): ExecutionGraph[] {
    const results: ExecutionGraph[] = [];
    for (const graph of this.registry.values()) {
      if (graph.graphState === state) {
        results.push(graph);
      }
    }
    return results;
  }

  /**
   * すべての ExecutionGraph を取得する
   */
  static findAll(): ExecutionGraph[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする (テスト用)
   */
  static clear(): void {
    this.registry.clear();
  }
}
