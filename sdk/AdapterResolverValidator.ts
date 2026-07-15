import { ResolutionRecord, AdapterType, ResolutionPolicy, ResolutionState } from './AdapterResolutionRegistry';
import { CapabilityRegistry } from './CapabilityRegistry';
import { SkillPipelineRegistry } from './SkillPipelineRegistry';
import { AntigravityAdapterRegistry } from './AntigravityAdapter';
import { ClaudeAdapterRegistry } from './ClaudeAdapter';
import { GeminiAdapterRegistry } from './GeminiAdapter';
import { OpenAIAdapterRegistry } from './OpenAIAdapter';

/**
 * AdapterResolverValidator.ts
 * 
 * ResolutionRecord インスタンスの整合性および依存関係を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class AdapterResolverValidator {
  private static readonly iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  /**
   * ResolutionRecord を検証する
   */
  static validate(record: ResolutionRecord): void {
    if (!record) {
      throw new Error('[AdapterResolverValidator] Record is required');
    }

    if (!record.resolutionId || !/^resolution-\d+$/.test(record.resolutionId)) {
      throw new Error(`[AdapterResolverValidator] Invalid resolutionId: ${record.resolutionId}`);
    }

    // Enum検証
    if (!record.adapterType || !Object.values(AdapterType).includes(record.adapterType)) {
      throw new Error(`[AdapterResolverValidator] Invalid adapterType: ${record.adapterType}`);
    }
    if (!record.resolutionPolicy || !Object.values(ResolutionPolicy).includes(record.resolutionPolicy)) {
      throw new Error(`[AdapterResolverValidator] Invalid resolutionPolicy: ${record.resolutionPolicy}`);
    }
    if (!record.resolutionState || !Object.values(ResolutionState).includes(record.resolutionState)) {
      throw new Error(`[AdapterResolverValidator] Invalid resolutionState: ${record.resolutionState}`);
    }

    // Priority数値検証
    if (typeof record.priority !== 'number' || isNaN(record.priority)) {
      throw new Error('[AdapterResolverValidator] priority must be a number');
    }

    // Version検証
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!record.version || !semverRegex.test(record.version)) {
      throw new Error(`[AdapterResolverValidator] Invalid version: ${record.version}`);
    }

    // ISO8601検証
    if (!record.createdAt || !this.iso8601Regex.test(record.createdAt)) {
      throw new Error(`[AdapterResolverValidator] Invalid createdAt format: ${record.createdAt}`);
    }
    if (!record.updatedAt || !this.iso8601Regex.test(record.updatedAt)) {
      throw new Error(`[AdapterResolverValidator] Invalid updatedAt format: ${record.updatedAt}`);
    }

    // 日付順序検証
    const createdTime = new Date(record.createdAt).getTime();
    const updatedTime = new Date(record.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[AdapterResolverValidator] Date sequence violation: createdAt (${record.createdAt}) is after updatedAt (${record.updatedAt})`);
    }

    // Capability 存在検証 (SSOT)
    const capability = CapabilityRegistry.get(record.capabilityId);
    if (!capability) {
      throw new Error(`[AdapterResolverValidator] Capability dependency not registered: ${record.capabilityId}`);
    }

    // Pipeline 存在検証 (SSOT)
    const pipeline = SkillPipelineRegistry.get(record.pipelineId);
    if (!pipeline) {
      throw new Error(`[AdapterResolverValidator] Pipeline dependency not registered: ${record.pipelineId}`);
    }

    // 具象 Adapter 存在検証 (SSOT)
    switch (record.adapterType) {
      case AdapterType.ANTIGRAVITY: {
        const adapter = AntigravityAdapterRegistry.get(record.adapterId);
        if (!adapter) {
          throw new Error(`[AdapterResolverValidator] AntigravityAdapter dependency not registered: ${record.adapterId}`);
        }
        break;
      }
      case AdapterType.CLAUDE: {
        const adapter = ClaudeAdapterRegistry.get(record.adapterId);
        if (!adapter) {
          throw new Error(`[AdapterResolverValidator] ClaudeAdapter dependency not registered: ${record.adapterId}`);
        }
        break;
      }
      case AdapterType.GEMINI: {
        const adapter = GeminiAdapterRegistry.get(record.adapterId);
        if (!adapter) {
          throw new Error(`[AdapterResolverValidator] GeminiAdapter dependency not registered: ${record.adapterId}`);
        }
        break;
      }
      case AdapterType.OPENAI: {
        const adapter = OpenAIAdapterRegistry.get(record.adapterId);
        if (!adapter) {
          throw new Error(`[AdapterResolverValidator] OpenAIAdapter dependency not registered: ${record.adapterId}`);
        }
        break;
      }
      default:
        throw new Error(`[AdapterResolverValidator] Unsupported adapterType: ${record.adapterType}`);
    }
  }
}
