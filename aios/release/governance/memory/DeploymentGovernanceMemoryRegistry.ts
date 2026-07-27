/**
 * DeploymentGovernanceMemoryRegistry.ts
 * 
 * Deployment Target Verification Gate - Memory Registry (Sprint DTVG-13)
 * AI Employee の過去のデプロイガバナンス判断および最終結果を長期記憶として管理する。
 */

import { GovernanceMemoryRecord, MemoryQuery } from './DeploymentGovernanceMemoryTypes';

export class DeploymentGovernanceMemoryRegistry {
  private static memories: Map<string, GovernanceMemoryRecord> = new Map();

  /**
   * ガバナンス長期記憶の保存
   */
  public static saveMemory(record: GovernanceMemoryRecord): void {
    this.memories.set(record.memoryId, Object.freeze({ ...record }));
  }

  /**
   * ID で記憶レコードを取得
   */
  public static getMemory(memoryId: string): GovernanceMemoryRecord | undefined {
    return this.memories.get(memoryId);
  }

  /**
   * 条件クエリによる記憶検索
   */
  public static queryMemories(query: MemoryQuery): GovernanceMemoryRecord[] {
    let result = Array.from(this.memories.values());

    if (query.employeeId) {
      result = result.filter(m => m.employeeId === query.employeeId);
    }
    if (query.decision) {
      result = result.filter(m => m.decision === query.decision);
    }
    if (query.finalOutcome) {
      result = result.filter(m => m.finalOutcome === query.finalOutcome);
    }
    if (query.limit && query.limit > 0) {
      result = result.slice(0, query.limit);
    }

    return result;
  }

  /**
   * 全記憶レコードの取得
   */
  public static getAllMemories(): GovernanceMemoryRecord[] {
    return Array.from(this.memories.values());
  }

  /**
   * レジストリのクリア (テスト用)
   */
  public static clear(): void {
    this.memories.clear();
  }
}
