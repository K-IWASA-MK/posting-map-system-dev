/**
 * AntigravityCommandRegistry.ts
 * 
 * Antigravity 固有コマンド定義の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum AntigravityCommandCategory {
  Architecture = 'Architecture',
  Frontend = 'Frontend',
  Backend = 'Backend',
  Debugging = 'Debugging',
  Testing = 'Testing',
  Documentation = 'Documentation',
  Release = 'Release',
  Utility = 'Utility'
}

export enum AntigravityCommandStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL'
}

export interface AntigravityCommand {
  readonly commandId: string;
  readonly commandName: string;
  readonly category: AntigravityCommandCategory;
  readonly description: string;
  readonly status: AntigravityCommandStatus;
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

export class AntigravityCommandRegistry {
  private static registry: Map<string, AntigravityCommand> = new Map();

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-ag-command-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * Command を登録する
   */
  static register(command: AntigravityCommand): void {
    if (!command) {
      throw new Error('[AntigravityCommandRegistry] Command cannot be empty');
    }
    if (!command.commandId) {
      throw new Error('[AntigravityCommandRegistry] commandId is required');
    }
    if (!command.commandName) {
      throw new Error('[AntigravityCommandRegistry] commandName is required');
    }

    // ID重複チェック
    if (this.registry.has(command.commandId)) {
      throw new Error(`[AntigravityCommandRegistry] Command ID already registered: ${command.commandId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.commandName === command.commandName) {
        throw new Error(`[AntigravityCommandRegistry] Command Name already registered: ${command.commandName}`);
      }
    }

    // バリデーション
    this.validate(command);

    this.registry.set(command.commandId, Object.freeze({ ...command }));
  }

  /**
   * IDから Command を取得する
   */
  static get(commandId: string): AntigravityCommand | undefined {
    return this.registry.get(commandId);
  }

  /**
   * 一致する Name を持つものを取得する
   */
  static getByName(name: string): AntigravityCommand | undefined {
    for (const item of this.registry.values()) {
      if (item.commandName === name) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * 全 Command を取得する
   */
  static getAll(): AntigravityCommand[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
  }

  /**
   * 不変な Command オブジェクトを直接生成（簡易ファクトリ）
   */
  static createCommand(
    id: string,
    name: string,
    category: AntigravityCommandCategory,
    description: string,
    status: AntigravityCommandStatus,
    version: string,
    createdAt: string = new Date().toISOString(),
    updatedAt: string = new Date().toISOString()
  ): AntigravityCommand {
    const command: AntigravityCommand = {
      commandId: id,
      commandName: name,
      category: category,
      description: description,
      status: status,
      version: version,
      createdAt: createdAt,
      updatedAt: updatedAt
    };
    this.validate(command);
    return Object.freeze(command);
  }

  /**
   * コマンド定義の妥当性検証
   */
  private static validate(command: AntigravityCommand): void {
    if (!command.commandId || !/^ag-command-\d+$/.test(command.commandId)) {
      throw new Error(`[AntigravityCommandRegistry] Invalid commandId: ${command.commandId}`);
    }
    if (!command.commandName || typeof command.commandName !== 'string') {
      throw new Error('[AntigravityCommandRegistry] Invalid commandName');
    }
    if (!command.category || !Object.values(AntigravityCommandCategory).includes(command.category)) {
      throw new Error(`[AntigravityCommandRegistry] Invalid category: ${command.category}`);
    }
    if (!command.status || !Object.values(AntigravityCommandStatus).includes(command.status)) {
      throw new Error(`[AntigravityCommandRegistry] Invalid status: ${command.status}`);
    }
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!command.version || !semverRegex.test(command.version)) {
      throw new Error(`[AntigravityCommandRegistry] Invalid version: ${command.version}`);
    }

    const createdTime = new Date(command.createdAt).getTime();
    const updatedTime = new Date(command.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[AntigravityCommandRegistry] Date sequence violation: createdAt (${command.createdAt}) is after updatedAt (${command.updatedAt})`);
    }
  }
}
