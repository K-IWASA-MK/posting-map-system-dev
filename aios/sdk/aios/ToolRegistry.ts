/**
 * ToolRegistry.ts
 * 
 * Development OS 全体で使用する Tool（開発ツール）の不変レジストリ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export enum ToolCategory {
  IDE = 'IDE',
  LLM = 'LLM',
  VersionControl = 'VersionControl',
  Shell = 'Shell',
  Browser = 'Browser',
  FileSystem = 'FileSystem',
  MCP = 'MCP',
  Other = 'Other'
}

export enum ToolStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  EXPERIMENTAL = 'EXPERIMENTAL'
}

export interface Tool {
  readonly toolId: string;
  readonly toolName: string;
  readonly category: ToolCategory;
  readonly description: string;
  readonly status: ToolStatus;
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

export class ToolRegistry {
  private static registry: Map<string, Tool> = new Map<string, Tool>([
    ['tool-antigravity', Object.freeze({
      toolId: 'tool-antigravity',
      toolName: 'Antigravity IDE',
      category: ToolCategory.IDE,
      description: 'Antigravity development environment integration tool',
      status: ToolStatus.ACTIVE,
      version: '1.0.0',
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
    })],
    ['tool-claude', Object.freeze({
      toolId: 'tool-claude',
      toolName: 'Claude LLM',
      category: ToolCategory.LLM,
      description: 'Claude Large Language Model integration tool',
      status: ToolStatus.ACTIVE,
      version: '1.0.0',
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
    })],
    ['tool-gemini', Object.freeze({
      toolId: 'tool-gemini',
      toolName: 'Gemini LLM',
      category: ToolCategory.LLM,
      description: 'Gemini Large Language Model integration tool',
      status: ToolStatus.ACTIVE,
      version: '1.0.0',
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
    })],
    ['tool-openai', Object.freeze({
      toolId: 'tool-openai',
      toolName: 'OpenAI LLM',
      category: ToolCategory.LLM,
      description: 'OpenAI Large Language Model integration tool',
      status: ToolStatus.ACTIVE,
      version: '1.0.0',
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
    })]
  ]);

  // レジストリメタデータの定義
  public static readonly metadata: RegistryMetadata = Object.freeze({
    registryId: 'reg-tool-01',
    registryVersion: '1.0.0',
    createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
    updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
  });

  /**
   * Tool を登録する
   */
  static register(tool: Tool): void {
    if (!tool) {
      throw new Error('[ToolRegistry] Tool cannot be empty');
    }
    if (!tool.toolId) {
      throw new Error('[ToolRegistry] toolId is required');
    }
    if (!tool.toolName) {
      throw new Error('[ToolRegistry] toolName is required');
    }

    if (this.registry.has(tool.toolId)) {
      throw new Error(`[ToolRegistry] Tool ID already registered: ${tool.toolId}`);
    }

    // 名前重複チェック
    for (const item of this.registry.values()) {
      if (item.toolName === tool.toolName) {
        throw new Error(`[ToolRegistry] Tool Name already registered: ${tool.toolName}`);
      }
    }

    this.registry.set(tool.toolId, Object.freeze({ ...tool }));
  }

  /**
   * IDから Tool を取得する
   */
  static get(toolId: string): Tool | undefined {
    return this.registry.get(toolId);
  }

  /**
   * 一致する ToolName を持つものを取得する
   */
  static getByName(name: string): Tool | undefined {
    for (const item of this.registry.values()) {
      if (item.toolName === name) {
        return item;
      }
    }
    return undefined;
  }

  /**
   * 全 Tool を取得する
   */
  static getAll(): Tool[] {
    return Array.from(this.registry.values());
  }

  /**
   * レジストリをクリアする（テスト用）
   */
  static clear(): void {
    this.registry.clear();
    this.registry.set('tool-antigravity', Object.freeze({
      toolId: 'tool-antigravity',
      toolName: 'Antigravity IDE',
      category: ToolCategory.IDE,
      description: 'Antigravity development environment integration tool',
      status: ToolStatus.ACTIVE,
      version: '1.0.0',
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
    }));
    this.registry.set('tool-claude', Object.freeze({
      toolId: 'tool-claude',
      toolName: 'Claude LLM',
      category: ToolCategory.LLM,
      description: 'Claude Large Language Model integration tool',
      status: ToolStatus.ACTIVE,
      version: '1.0.0',
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
    }));
    this.registry.set('tool-gemini', Object.freeze({
      toolId: 'tool-gemini',
      toolName: 'Gemini LLM',
      category: ToolCategory.LLM,
      description: 'Gemini Large Language Model integration tool',
      status: ToolStatus.ACTIVE,
      version: '1.0.0',
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
    }));
    this.registry.set('tool-openai', Object.freeze({
      toolId: 'tool-openai',
      toolName: 'OpenAI LLM',
      category: ToolCategory.LLM,
      description: 'OpenAI Large Language Model integration tool',
      status: ToolStatus.ACTIVE,
      version: '1.0.0',
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-09T09:30:00Z').toISOString()
    }));
  }
}
