import { ToolAdapter, ToolAdapterStatus } from './ToolAdapter';
import { AntigravityAdapterRegistry } from './AntigravityAdapter';
import { ClaudeAdapterRegistry } from './ClaudeAdapter';
import { GeminiAdapterRegistry } from './GeminiAdapter';
import { OpenAIAdapterRegistry } from './OpenAIAdapter';
import { SkillPipelineRegistry } from './SkillPipelineRegistry';
import { MultiAdapterRegistry, AdapterPriorityPolicy } from './MultiAdapterRegistry';
import { AdapterType } from './AdapterResolutionRegistry';

/**
 * AdapterResolver.ts
 * 
 * Capability に最適な ToolAdapter を決定論的に解決する Resolver。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export class AdapterResolver {
  private static readonly policyPriorityMap = {
    [AdapterPriorityPolicy.FIXED]: 3,
    [AdapterPriorityPolicy.DYNAMIC]: 2,
    [AdapterPriorityPolicy.FALLBACK]: 1
  };

  /**
   * Capability ID に対する最適な ToolAdapter を解決・取得する
   */
  static resolve(capabilityId: string): ToolAdapter | undefined {
    if (!capabilityId) {
      throw new Error('[AdapterResolver] capabilityId is required');
    }

    // 1. Capability に対する Pipeline を取得
    const pipeline = SkillPipelineRegistry.getByCapability(capabilityId);
    if (!pipeline) {
      return undefined;
    }

    // 2. MultiAdapterRegistry から Pipeline に対応する全 AdapterRecord を取得
    const records = MultiAdapterRegistry.findByPipeline(pipeline.pipelineId);

    // 3. ACTIVE な設定レコードに絞り込む
    const candidates = records.filter(r => r.status === ToolAdapterStatus.ACTIVE);

    if (candidates.length === 0) {
      return undefined;
    }

    // 4. 解決ルールに従ってソート (安定ソートを利用)
    //    優先度1: AdapterPriorityPolicy (FIXED > DYNAMIC > FALLBACK)
    //    優先度2: priority 数値 (降順)
    candidates.sort((a, b) => {
      const policyDiff = this.policyPriorityMap[b.priorityPolicy] - this.policyPriorityMap[a.priorityPolicy];
      if (policyDiff !== 0) {
        return policyDiff;
      }
      return b.priority - a.priority;
    });

    const chosen = candidates[0];

    // 5. 指定された AdapterType に応じて各具象レジストリから Adapter を解決取得
    switch (chosen.adapterType) {
      case AdapterType.ANTIGRAVITY:
        return AntigravityAdapterRegistry.get(chosen.adapterId);
      case AdapterType.CLAUDE:
        return ClaudeAdapterRegistry.get(chosen.adapterId);
      case AdapterType.GEMINI:
        return GeminiAdapterRegistry.get(chosen.adapterId);
      case AdapterType.OPENAI:
        return OpenAIAdapterRegistry.get(chosen.adapterId);
      default:
        return undefined;
    }
  }
}

