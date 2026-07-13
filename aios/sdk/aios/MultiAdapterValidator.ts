import { AdapterRecord, AdapterHealthStatus, AdapterPriorityPolicy } from './MultiAdapterRegistry';
import { AdapterType } from './AdapterResolutionRegistry';
import { ToolCategory } from './ToolRegistry';
import { ToolAdapterStatus } from './ToolAdapter';
import { CapabilityRegistry } from './CapabilityRegistry';
import { SkillPipelineRegistry } from './SkillPipelineRegistry';
import { AntigravityAdapterRegistry } from './AntigravityAdapter';
import { ClaudeAdapterRegistry } from './ClaudeAdapter';
import { GeminiAdapterRegistry } from './GeminiAdapter';
import { OpenAIAdapterRegistry } from './OpenAIAdapter';

/**
 * MultiAdapterValidator.ts
 * 
 * AdapterRecord インスタンスの整合性および依存関係を検証するバリデータ。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class MultiAdapterValidator {
  private static readonly iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

  /**
   * AdapterRecord を検証する
   */
  static validate(record: AdapterRecord): void {
    if (!record) {
      throw new Error('[MultiAdapterValidator] Record is required');
    }

    if (!record.adapterRecordId || !/^multi-adapter-\d+$/.test(record.adapterRecordId)) {
      throw new Error(`[MultiAdapterValidator] Invalid adapterRecordId: ${record.adapterRecordId}`);
    }

    // Enum検証
    if (!record.adapterType || !Object.values(AdapterType).includes(record.adapterType)) {
      throw new Error(`[MultiAdapterValidator] Invalid adapterType: ${record.adapterType}`);
    }
    if (!record.adapterCategory || !Object.values(ToolCategory).includes(record.adapterCategory)) {
      throw new Error(`[MultiAdapterValidator] Invalid adapterCategory: ${record.adapterCategory}`);
    }
    if (!record.priorityPolicy || !Object.values(AdapterPriorityPolicy).includes(record.priorityPolicy)) {
      throw new Error(`[MultiAdapterValidator] Invalid priorityPolicy: ${record.priorityPolicy}`);
    }
    if (!record.healthStatus || !Object.values(AdapterHealthStatus).includes(record.healthStatus)) {
      throw new Error(`[MultiAdapterValidator] Invalid healthStatus: ${record.healthStatus}`);
    }
    if (!record.status || !Object.values(ToolAdapterStatus).includes(record.status)) {
      throw new Error(`[MultiAdapterValidator] Invalid status: ${record.status}`);
    }

    // Priority数値検証
    if (typeof record.priority !== 'number' || isNaN(record.priority)) {
      throw new Error('[MultiAdapterValidator] priority must be a number');
    }

    // Version検証
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!record.version || !semverRegex.test(record.version)) {
      throw new Error(`[MultiAdapterValidator] Invalid version: ${record.version}`);
    }

    // ISO8601検証
    if (!record.createdAt || !this.iso8601Regex.test(record.createdAt)) {
      throw new Error(`[MultiAdapterValidator] Invalid createdAt format: ${record.createdAt}`);
    }
    if (!record.updatedAt || !this.iso8601Regex.test(record.updatedAt)) {
      throw new Error(`[MultiAdapterValidator] Invalid updatedAt format: ${record.updatedAt}`);
    }

    // 日付順序検証
    const createdTime = new Date(record.createdAt).getTime();
    const updatedTime = new Date(record.updatedAt).getTime();
    if (createdTime > updatedTime) {
      throw new Error(`[MultiAdapterValidator] Date sequence violation: createdAt (${record.createdAt}) is after updatedAt (${record.updatedAt})`);
    }

    // Capability 存在検証 (SSOT)
    if (!record.supportedCapabilityIds || !Array.isArray(record.supportedCapabilityIds)) {
      throw new Error('[MultiAdapterValidator] supportedCapabilityIds must be an array');
    }
    for (const capId of record.supportedCapabilityIds) {
      const capability = CapabilityRegistry.get(capId);
      if (!capability) {
        throw new Error(`[MultiAdapterValidator] Capability dependency not registered: ${capId}`);
      }
    }

    // Pipeline 存在検証 (SSOT)
    if (!record.supportedPipelineIds || !Array.isArray(record.supportedPipelineIds)) {
      throw new Error('[MultiAdapterValidator] supportedPipelineIds must be an array');
    }
    for (const pipelineId of record.supportedPipelineIds) {
      const pipeline = SkillPipelineRegistry.get(pipelineId);
      if (!pipeline) {
        throw new Error(`[MultiAdapterValidator] Pipeline dependency not registered: ${pipelineId}`);
      }
    }

    // 具象 Adapter 存在検証 (SSOT)
    switch (record.adapterType) {
      case AdapterType.ANTIGRAVITY: {
        const adapter = AntigravityAdapterRegistry.get(record.adapterId);
        if (!adapter) {
          throw new Error(`[MultiAdapterValidator] AntigravityAdapter dependency not registered: ${record.adapterId}`);
        }
        break;
      }
      case AdapterType.CLAUDE: {
        const adapter = ClaudeAdapterRegistry.get(record.adapterId);
        if (!adapter) {
          throw new Error(`[MultiAdapterValidator] ClaudeAdapter dependency not registered: ${record.adapterId}`);
        }
        break;
      }
      case AdapterType.GEMINI: {
        const adapter = GeminiAdapterRegistry.get(record.adapterId);
        if (!adapter) {
          throw new Error(`[MultiAdapterValidator] GeminiAdapter dependency not registered: ${record.adapterId}`);
        }
        break;
      }
      case AdapterType.OPENAI: {
        const adapter = OpenAIAdapterRegistry.get(record.adapterId);
        if (!adapter) {
          throw new Error(`[MultiAdapterValidator] OpenAIAdapter dependency not registered: ${record.adapterId}`);
        }
        break;
      }
      default:
        throw new Error(`[MultiAdapterValidator] Unsupported adapterType: ${record.adapterType}`);
    }
  }
}
