import { AdapterType } from './AdapterResolutionRegistry';
import { ToolCategory } from './ToolRegistry';
import { ToolAdapterStatus } from './ToolAdapter';
import { MultiAdapterValidator } from './MultiAdapterValidator';

/**
 * MultiAdapterRegistry.ts
 * 
 * すべての ToolAdapter の登録・検索・分類・Discovery を一元管理する不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum AdapterHealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNAVAILABLE = 'UNAVAILABLE',
  UNKNOWN = 'UNKNOWN'
}

export enum AdapterPriorityPolicy {
  FIXED = 'FIXED',
  DYNAMIC = 'DYNAMIC',
  FALLBACK = 'FALLBACK'
}

export interface AdapterCapabilityMatrix {
  readonly capabilityId: string;
  readonly adapterIds: readonly string[];
}

export interface AdapterRecord {
  readonly adapterRecordId: string;
  readonly adapterId: string;
  readonly adapterType: AdapterType;
  readonly adapterCategory: ToolCategory;
  readonly priority: number;
  readonly priorityPolicy: AdapterPriorityPolicy;
  readonly healthStatus: AdapterHealthStatus;
  readonly status: ToolAdapterStatus;
  readonly supportedCapabilityIds: readonly string[];
  readonly supportedPipelineIds: readonly string[];
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class MultiAdapterRegistry {
  private static registry: Map<string, AdapterRecord> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-multi-adapter-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * AdapterRecord を登録する
   */
  static register(record: AdapterRecord): void {
    if (!record) {
      throw new Error('[MultiAdapterRegistry] Record cannot be empty');
    }
    if (!record.adapterRecordId) {
      throw new Error('[MultiAdapterRegistry] adapterRecordId is required');
    }

    // ID重複チェック
    if (this.registry.has(record.adapterRecordId)) {
      throw new Error(`[MultiAdapterRegistry] AdapterRecord ID already registered: ${record.adapterRecordId}`);
    }

    // 同一 adapterId + adapterType の重複チェック
    for (const item of this.registry.values()) {
      if (item.adapterId === record.adapterId && item.adapterType === record.adapterType) {
        throw new Error(`[MultiAdapterRegistry] Adapter already registered: Type=${record.adapterType}, ID=${record.adapterId}`);
      }
    }

    // バリデーション
    MultiAdapterValidator.validate(record);

    this.registry.set(record.adapterRecordId, Object.freeze({
      ...record,
      supportedCapabilityIds: Object.freeze([...record.supportedCapabilityIds]),
      supportedPipelineIds: Object.freeze([...record.supportedPipelineIds])
    }));
  }

  /**
   * IDから AdapterRecord を取得する
   */
  static get(adapterRecordId: string): AdapterRecord | undefined {
    return this.registry.get(adapterRecordId);
  }

  /**
   * 具象 ID とタイプから AdapterRecord を取得する
   */
  static getByConcreteId(adapterId: string, adapterType: AdapterType): AdapterRecord | undefined {
    for (const item of this.registry.values()) {
      if (item.adapterId === adapterId && item.adapterType === adapterType) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Discovery: Capability ID から対応する全 AdapterRecord を探索・取得する
   */
  static findByCapability(capabilityId: string): AdapterRecord[] {
    const list: AdapterRecord[] = [];
    for (const item of this.registry.values()) {
      if (item.supportedCapabilityIds.includes(capabilityId)) {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * Discovery: Pipeline ID から対応する全 AdapterRecord を探索・取得する
   */
  static findByPipeline(pipelineId: string): AdapterRecord[] {
    const list: AdapterRecord[] = [];
    for (const item of this.registry.values()) {
      if (item.supportedPipelineIds.includes(pipelineId)) {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * Discovery: ToolCategory から対応する全 AdapterRecord を探索・取得する
   */
  static findByCategory(category: ToolCategory): AdapterRecord[] {
    const list: AdapterRecord[] = [];
    for (const item of this.registry.values()) {
      if (item.adapterCategory === category) {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * Discovery: AdapterType から対応する全 AdapterRecord を探索・取得する
   */
  static findByAdapterType(type: AdapterType): AdapterRecord[] {
    const list: AdapterRecord[] = [];
    for (const item of this.registry.values()) {
      if (item.adapterType === type) {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * 全登録レコードを取得
   */
  static findAll(): AdapterRecord[] {
    return Array.from(this.registry.values());
  }

  /**
   * Capability と Adapter ID 接続マトリクスを取得する
   */
  static getCapabilityMatrix(): AdapterCapabilityMatrix[] {
    const matrixMap: Map<string, string[]> = new Map();
    for (const item of this.registry.values()) {
      for (const capId of item.supportedCapabilityIds) {
        if (!matrixMap.has(capId)) {
          matrixMap.set(capId, []);
        }
        matrixMap.get(capId)!.push(item.adapterId);
      }
    }

    const matrix: AdapterCapabilityMatrix[] = [];
    for (const [capabilityId, adapterIds] of matrixMap.entries()) {
      matrix.push(Object.freeze({
        capabilityId,
        adapterIds: Object.freeze([...adapterIds])
      }));
    }

    return matrix;
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
