/**
 * DevelopmentRules.ts
 * 
 * Development OS で適用される各開発ルールの定義体。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

import { CapabilityRegistry } from './CapabilityRegistry';
import { SkillRegistry, Skill } from './SkillRegistry';
import { SkillPipelineRegistry, SkillPipeline } from './SkillPipelineRegistry';
import { ExecutionLedgerRegistry, ExecutionRecord } from './ExecutionLedgerRegistry';
import { QualityGateRegistry, QualityGateRecord } from './QualityGateRegistry';
import { ToolAdapterRegistry, ToolAdapter } from './ToolAdapter';
import { AntigravityAdapterRegistry, AntigravityAdapter } from './AntigravityAdapter';
import { ClaudeAdapterRegistry, ClaudeAdapter } from './ClaudeAdapter';
import { ClaudeModelRegistry, ClaudeModel } from './ClaudeModelRegistry';
import { GeminiAdapterRegistry, GeminiAdapter } from './GeminiAdapter';
import { GeminiModelRegistry, GeminiModel } from './GeminiModelRegistry';
import { OpenAIAdapterRegistry, OpenAIAdapter } from './OpenAIAdapter';
import { OpenAIModelRegistry, OpenAIModel } from './OpenAIModelRegistry';
import { AdapterResolver } from './AdapterResolver';
import { MultiAdapterRegistry } from './MultiAdapterRegistry';
import { AdapterType } from './AdapterResolutionRegistry';
import { RuntimeRegistry, RuntimeRecord } from './RuntimeRegistry';

export interface DevelopmentRule {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly capability: string;
  readonly priority: number;
}

export class DevelopmentRules {
  /**
   * 不変な開発ルールオブジェクトを生成する
   */
  static createRule(id: string, name: string, capability: string, priority: number): DevelopmentRule {
    if (!id) {
      throw new Error('[DevelopmentRules] ruleId is required');
    }
    if (!name) {
      throw new Error('[DevelopmentRules] ruleName is required');
    }
    if (!capability) {
      throw new Error('[DevelopmentRules] capability is required');
    }

    // Capability がレジストリに存在するか検証 (Name または ID)
    const verified = CapabilityRegistry.get(capability) || CapabilityRegistry.getByName(capability);
    if (!verified) {
      throw new Error(`[DevelopmentRules] Capability is not registered: ${capability}`);
    }

    const rule: DevelopmentRule = {
      ruleId: id,
      ruleName: name,
      capability: capability,
      priority: priority
    };

    return Object.freeze(rule);
  }

  /**
   * ルールに関連付けられた Capability を満たすための全 Skill を SkillRegistry から取得する
   */
  static getRequiredSkills(rule: DevelopmentRule): Skill[] {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return [];
    }
    return SkillRegistry.getByCapability(verified.capabilityId);
  }

  /**
   * ルールに関連付けられた Capability を実行するための SkillPipeline を SkillPipelineRegistry から取得する
   */
  static getRequiredPipeline(rule: DevelopmentRule): SkillPipeline | undefined {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return undefined;
    }
    return SkillPipelineRegistry.getByCapability(verified.capabilityId);
  }

  /**
   * ルールに関連付けられた Capability に対応する ExecutionRecord 履歴を ExecutionLedgerRegistry から取得する
   */
  static getExecutionLedger(rule: DevelopmentRule): ExecutionRecord[] {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return [];
    }
    return ExecutionLedgerRegistry.getByCapability(verified.capabilityId);
  }

  /**
   * ルールに関連付けられた Capability の最新の QualityGateRecord を取得する
   */
  static getQualityGate(rule: DevelopmentRule): QualityGateRecord | undefined {
    const ledgers = this.getExecutionLedger(rule);
    if (ledgers.length === 0) {
      return undefined;
    }
    // 最新の Ledger に対応する QualityGateRecord を取得
    const latestLedger = ledgers[ledgers.length - 1];
    return QualityGateRegistry.getByLedger(latestLedger.executionId);
  }

  /**
   * ルールに関連付けられた Capability をサポートする全 ToolAdapter を取得する
   */
  static getToolAdapters(rule: DevelopmentRule): ToolAdapter[] {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return [];
    }
    return ToolAdapterRegistry.getByPipeline(pipeline.pipelineId);
  }

  /**
   * ルールに関連付けられた Capability をサポートする AntigravityAdapter を取得する
   */
  static getAntigravityAdapter(rule: DevelopmentRule): AntigravityAdapter | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const list = AntigravityAdapterRegistry.getByPipeline(pipeline.pipelineId);
    return list.length > 0 ? list[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability をサポートする ClaudeAdapter を取得する
   */
  static getClaudeAdapter(rule: DevelopmentRule): ClaudeAdapter | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const list = ClaudeAdapterRegistry.getByPipeline(pipeline.pipelineId);
    return list.length > 0 ? list[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability をサポートする全 ClaudeModel を取得する (4層解決)
   */
  static getClaudeModels(rule: DevelopmentRule): ClaudeModel[] {
    const adapter = this.getClaudeAdapter(rule);
    if (!adapter) {
      return [];
    }
    const models: ClaudeModel[] = [];
    for (const modelId of adapter.supportedModelIds) {
      const m = ClaudeModelRegistry.get(modelId);
      if (m) {
        models.push(m);
      }
    }
    return models;
  }

  /**
   * ルールに関連付けられた Capability をサポートする GeminiAdapter を取得する
   */
  static getGeminiAdapter(rule: DevelopmentRule): GeminiAdapter | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const list = GeminiAdapterRegistry.getByPipeline(pipeline.pipelineId);
    return list.length > 0 ? list[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability をサポートする全 GeminiModel を取得する (4層解決)
   */
  static getGeminiModels(rule: DevelopmentRule): GeminiModel[] {
    const adapter = this.getGeminiAdapter(rule);
    if (!adapter) {
      return [];
    }
    const models: GeminiModel[] = [];
    for (const modelId of adapter.supportedModelIds) {
      const m = GeminiModelRegistry.get(modelId);
      if (m) {
        models.push(m);
      }
    }
    return models;
  }

  /**
   * ルールに関連付けられた Capability をサポートする OpenAIAdapter を取得する
   */
  static getOpenAIAdapter(rule: DevelopmentRule): OpenAIAdapter | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const list = OpenAIAdapterRegistry.getByPipeline(pipeline.pipelineId);
    return list.length > 0 ? list[0] : undefined;
  }

  /**
   * ルールに関連付けられた Capability をサポートする全 OpenAIModel を取得する (4層解決)
   */
  static getOpenAIModels(rule: DevelopmentRule): OpenAIModel[] {
    const adapter = this.getOpenAIAdapter(rule);
    if (!adapter) {
      return [];
    }
    const models: OpenAIModel[] = [];
    for (const modelId of adapter.supportedModelIds) {
      const m = OpenAIModelRegistry.get(modelId);
      if (m) {
        models.push(m);
      }
    }
    return models;
  }

  /**
   * ルールに関連付けられた Capability に対する最適な ToolAdapter を AdapterResolver を介して自動解決・取得する
   */
  static getResolvedAdapter(rule: DevelopmentRule): ToolAdapter | undefined {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return undefined;
    }
    return AdapterResolver.resolve(verified.capabilityId);
  }

  /**
   * ルールに関連付けられた Capability に対するすべての利用可能アダプター一覧を取得する
   */
  static getAvailableAdapters(rule: DevelopmentRule): readonly ToolAdapter[] {
    const verified = CapabilityRegistry.get(rule.capability) || CapabilityRegistry.getByName(rule.capability);
    if (!verified) {
      return [];
    }
    
    // MultiAdapterRegistry から該当 Capability をサポートするレコードを取得
    const records = MultiAdapterRegistry.findByCapability(verified.capabilityId);
    const list: ToolAdapter[] = [];
    
    for (const rec of records) {
      let adapter: ToolAdapter | undefined;
      switch (rec.adapterType) {
        case AdapterType.ANTIGRAVITY:
          adapter = AntigravityAdapterRegistry.get(rec.adapterId);
          break;
        case AdapterType.CLAUDE:
          adapter = ClaudeAdapterRegistry.get(rec.adapterId);
          break;
        case AdapterType.GEMINI:
          adapter = GeminiAdapterRegistry.get(rec.adapterId);
          break;
        case AdapterType.OPENAI:
          adapter = OpenAIAdapterRegistry.get(rec.adapterId);
          break;
      }
      if (adapter) {
        list.push(adapter);
      }
    }
    
    return Object.freeze(list);
  }

  /**
   * ルールに関連付けられた Capability から Pipeline を経由して RuntimeRecord を静的に解決・取得する
   */
  static getRuntime(rule: DevelopmentRule): RuntimeRecord | undefined {
    const pipeline = this.getRequiredPipeline(rule);
    if (!pipeline) {
      return undefined;
    }
    const match = pipeline.pipelineId.match(/\d+/);
    if (!match) {
      return undefined;
    }
    return RuntimeRegistry.get(`runtime-${match[0]}`);
  }
}
