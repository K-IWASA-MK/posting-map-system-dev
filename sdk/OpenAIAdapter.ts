import { ToolAdapter, ToolAdapterStatus } from './ToolAdapter';
import { OpenAIAdapterValidator } from './OpenAIAdapterValidator';

/**
 * OpenAIAdapter.ts
 * 
 * OpenAI アダプター定義（implements ToolAdapter）およびレジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class OpenAIAdapter implements ToolAdapter {
  readonly adapterId: string;
  readonly adapterName: string;
  readonly description: string;
  readonly supportedPipelineIds: readonly string[];
  readonly supportedToolIds: readonly string[];
  readonly supportedModelIds: readonly string[]; // OpenAI 固有のモデルIDへの接続用ID
  readonly status: ToolAdapterStatus;
  readonly version: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(data: {
    readonly adapterId: string;
    readonly adapterName: string;
    readonly description: string;
    readonly supportedPipelineIds: readonly string[];
    readonly supportedToolIds: readonly string[];
    readonly supportedModelIds: readonly string[];
    readonly status: ToolAdapterStatus;
    readonly version: string;
    readonly createdAt: string;
    readonly updatedAt: string;
  }) {
    this.adapterId = data.adapterId;
    this.adapterName = data.adapterName;
    this.description = data.description;
    this.supportedPipelineIds = Object.freeze([...data.supportedPipelineIds]);
    this.supportedToolIds = Object.freeze([...data.supportedToolIds]);
    this.supportedModelIds = Object.freeze([...data.supportedModelIds]);
    this.status = data.status;
    this.version = data.version;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class OpenAIAdapterRegistry {
  private static registry: Map<string, OpenAIAdapter> = new Map();

  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-openai-adapter-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * OpenAIAdapter を登録する
   */
  static register(adapter: OpenAIAdapter): void {
    if (!adapter) {
      throw new Error('[OpenAIAdapterRegistry] Adapter is required');
    }
    if (!adapter.adapterId) {
      throw new Error('[OpenAIAdapterRegistry] adapterId is required');
    }

    if (this.registry.has(adapter.adapterId)) {
      throw new Error(`[OpenAIAdapterRegistry] Adapter ID already registered: ${adapter.adapterId}`);
    }

    // 重複名チェック
    for (const item of this.registry.values()) {
      if (item.adapterName === adapter.adapterName) {
        throw new Error(`[OpenAIAdapterRegistry] Adapter Name already registered: ${adapter.adapterName}`);
      }
    }

    // 検証
    OpenAIAdapterValidator.validate(adapter);

    this.registry.set(adapter.adapterId, Object.freeze(adapter));
  }

  /**
   * IDから OpenAIAdapter を取得する
   */
  static get(adapterId: string): OpenAIAdapter | undefined {
    return this.registry.get(adapterId);
  }

  /**
   * 一致する Name を持つものを取得する
   */
  static getByName(name: string): OpenAIAdapter | undefined {
    for (const item of this.registry.values()) {
      if (item.adapterName === name) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * Pipeline IDをサポートする全 Adapter を取得する
   */
  static getByPipeline(pipelineId: string): OpenAIAdapter[] {
    const list: OpenAIAdapter[] = [];
    for (const item of this.registry.values()) {
      if (item.supportedPipelineIds.includes(pipelineId)) {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * 全登録アダプターを取得
   */
  static getAll(): OpenAIAdapter[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }
}
