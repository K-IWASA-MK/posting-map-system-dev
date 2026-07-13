import { ToolAdapterValidator } from './ToolAdapterValidator';

/**
 * ToolAdapter.ts
 * 
 * Development OS が使用する Tool アダプターの抽象インターフェースおよびレジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ToolAdapterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL'
}

export interface ToolAdapter {
  readonly adapterId: string;
  readonly adapterName: string;
  readonly description: string;
  readonly supportedPipelineIds: readonly string[];
  readonly supportedToolIds: readonly string[];
  readonly status: ToolAdapterStatus;
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

export class ToolAdapterRegistry {
  private static registry: Map<string, ToolAdapter> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-adapter-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * ToolAdapter を登録する
   */
  static register(adapter: ToolAdapter): void {
    if (!adapter) {
      throw new Error('[ToolAdapterRegistry] Adapter cannot be empty');
    }
    if (!adapter.adapterId) {
      throw new Error('[ToolAdapterRegistry] adapterId is required');
    }
    if (!adapter.adapterName) {
      throw new Error('[ToolAdapterRegistry] adapterName is required');
    }

    if (this.registry.has(adapter.adapterId)) {
      throw new Error(`[ToolAdapterRegistry] Adapter ID already registered: ${adapter.adapterId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.adapterName === adapter.adapterName) {
        throw new Error(`[ToolAdapterRegistry] Adapter Name already registered: ${adapter.adapterName}`);
      }
    }

    // 登録前の検証
    ToolAdapterValidator.validate(adapter);

    this.registry.set(adapter.adapterId, Object.freeze({ ...adapter }));
  }

  /**
   * IDから ToolAdapter を取得する
   */
  static get(adapterId: string): ToolAdapter | undefined {
    return this.registry.get(adapterId);
  }

  /**
   * 一致する Name を持つものを取得する
   */
  static getByName(name: string): ToolAdapter | undefined {
    for (const item of this.registry.values()) {
      if (item.adapterName === name) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Pipeline IDをサポートしている全 Adapter を取得する
   */
  static getByPipeline(pipelineId: string): ToolAdapter[] {
    const list: ToolAdapter[] = [];
    for (const item of this.registry.values()) {
      if (item.supportedPipelineIds.includes(pipelineId)) {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * 全 ToolAdapter を取得する
   */
  static getAll(): ToolAdapter[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
