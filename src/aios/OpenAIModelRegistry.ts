/**
 * OpenAIModelRegistry.ts
 * 
 * OpenAI 固有モデル定義の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum OpenAIProvider {
  OPENAI = 'OPENAI',
  AZURE_OPENAI = 'AZURE_OPENAI'
}

export enum OpenAIModelStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL'
}

export interface OpenAIModel {
  readonly modelId: string;
  readonly modelName: string;
  readonly provider: OpenAIProvider;
  readonly modelVersion: string;
  readonly description: string;
  readonly status: OpenAIModelStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegistryMetadata {
  readonly registryId: string;
  readonly registryVersion: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export class OpenAIModelRegistry {
  private static registry: Map<string, OpenAIModel> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-openai-model-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * Model を登録する
   */
  static register(model: OpenAIModel): void {
    if (!model) {
      throw new Error('[OpenAIModelRegistry] Model cannot be empty');
    }
    if (!model.modelId) {
      throw new Error('[OpenAIModelRegistry] modelId is required');
    }
    if (!model.modelName) {
      throw new Error('[OpenAIModelRegistry] modelName is required');
    }

    // ID重複チェック
    if (this.registry.has(model.modelId)) {
      throw new Error(`[OpenAIModelRegistry] Model ID already registered: ${model.modelId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.modelName === model.modelName) {
        throw new Error(`[OpenAIModelRegistry] Model Name already registered: ${model.modelName}`);
      }
    }

    // バリデーション
    this.validate(model);

    this.registry.set(model.modelId, Object.freeze({ ...model }));
  }

  /**
   * IDから Model を取得する
   */
  static get(modelId: string): OpenAIModel | undefined {
    return this.registry.get(modelId);
  }

  /**
   * 一致する Name を持つものを取得する
   */
  static getByName(name: string): OpenAIModel | undefined {
    for (const item of this.registry.values()) {
      if (item.modelName === name) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * 全 Model を取得する
   */
  static getAll(): OpenAIModel[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }

  /**
   * 不変な OpenAIModel オブジェクトを直接生成（簡易ファクトリ）
   */
  static createModel(
    id: string,
    name: string,
    provider: OpenAIProvider,
    modelVersion: string,
    description: string,
    status: OpenAIModelStatus,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): OpenAIModel {
    const model: OpenAIModel = {
      modelId: id,
      modelName: name,
      provider: provider,
      modelVersion: modelVersion,
      description: description,
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt
    };
    this.validate(model);
    return Object.freeze(model);
  }

  /**
   * モデル定義の妥当性検証
   */
  private static validate(model: OpenAIModel): void {
    if (!model.modelId || !/^openai-model-\d+$/.test(model.modelId)) {
      throw new Error(`[OpenAIModelRegistry] Invalid modelId: ${model.modelId}`);
    }
    if (!model.modelName || typeof model.modelName !== 'string') {
      throw new Error('[OpenAIModelRegistry] Invalid modelName');
    }
    if (!model.provider || !Object.values(OpenAIProvider).includes(model.provider)) {
      throw new Error(`[OpenAIModelRegistry] Invalid provider: ${model.provider}`);
    }
    if (!model.status || !Object.values(OpenAIModelStatus).includes(model.status)) {
      throw new Error(`[OpenAIModelRegistry] Invalid status: ${model.status}`);
    }
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!model.modelVersion || !semverRegex.test(model.modelVersion)) {
      throw new Error(`[OpenAIModelRegistry] Invalid modelVersion: ${model.modelVersion}`);
    }

    const createdTime = new Date(model.createdAt).getTime();
    const updatedTime = new Date(model.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[OpenAIModelRegistry] Date sequence violation: createdAt (${model.createdAt}) is after updatedAt (${model.updatedAt})`);
    }
  }
}
