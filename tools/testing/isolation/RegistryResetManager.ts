import { CapabilityRegistry } from '../../../sdk/CapabilityRegistry';
import { ToolRegistry } from '../../../sdk/ToolRegistry';
import { SkillRegistry } from '../../../sdk/SkillRegistry';
import { SkillPipelineRegistry } from '../../../sdk/SkillPipelineRegistry';
import { QualityGateRegistry } from '../../../sdk/QualityGateRegistry';
import { RuntimeRegistry } from '../../../sdk/RuntimeRegistry';
import { RuntimeContextRegistry } from '../../../sdk/RuntimeContextRegistry';
import { RuntimeQueueRegistry } from '../../../sdk/RuntimeQueueRegistry';
import { RuntimeTaskRegistry } from '../../../sdk/RuntimeTaskRegistry';
import { RuntimeSessionRegistry } from '../../../sdk/RuntimeSessionRegistry';
import { RuntimeExecutionPlanRegistry } from '../../../sdk/RuntimeExecutionPlanRegistry';
import { RuntimeExecutionGraphRegistry } from '../../../sdk/RuntimeExecutionGraphRegistry';
import { OpenAIModelRegistry } from '../../../sdk/OpenAIModelRegistry';
import { GeminiModelRegistry } from '../../../sdk/GeminiModelRegistry';
import { ClaudeModelRegistry } from '../../../sdk/ClaudeModelRegistry';
import { OpenAIAdapterRegistry } from '../../../sdk/OpenAIAdapter';
import { GeminiAdapterRegistry } from '../../../sdk/GeminiAdapter';
import { ClaudeAdapterRegistry } from '../../../sdk/ClaudeAdapter';
import { AntigravityAdapterRegistry } from '../../../sdk/AntigravityAdapter';
import { MultiAdapterRegistry } from '../../../sdk/MultiAdapterRegistry';
import { AdapterResolutionRegistry } from '../../../sdk/AdapterResolutionRegistry';
import { AntigravityCommandRegistry } from '../../../sdk/AntigravityCommandRegistry';
import { ToolAdapterRegistry } from '../../../sdk/ToolAdapter';
import { ExecutionLedgerRegistry } from '../../../sdk/ExecutionLedgerRegistry';
import { AuditRegistry } from '../../../sdk/observability/AuditRegistry';
import { GovernancePolicyRegistry } from '../../../sdk/governance/GovernancePolicyRegistry';
import { PatternRepositoryFactory } from '../../../sdk/learning/repository/PatternRepositoryFactory';

/**
 * RegistryResetManager encapsulates static registry cleanups to enforce memory-level test isolation.
 */
export class RegistryResetManager {
  private static readonly registries: any[] = [
    CapabilityRegistry,
    ToolRegistry,
    SkillRegistry,
    SkillPipelineRegistry,
    QualityGateRegistry,
    RuntimeRegistry,
    RuntimeContextRegistry,
    RuntimeQueueRegistry,
    RuntimeTaskRegistry,
    RuntimeSessionRegistry,
    RuntimeExecutionPlanRegistry,
    RuntimeExecutionGraphRegistry,
    OpenAIModelRegistry,
    GeminiModelRegistry,
    ClaudeModelRegistry,
    OpenAIAdapterRegistry,
    GeminiAdapterRegistry,
    ClaudeAdapterRegistry,
    AntigravityAdapterRegistry,
    MultiAdapterRegistry,
    AdapterResolutionRegistry,
    AntigravityCommandRegistry,
    ToolAdapterRegistry,
    ExecutionLedgerRegistry,
    AuditRegistry,
    GovernancePolicyRegistry
  ];

  /**
   * Clears all registered items across all platform static registries.
   * @returns The count of registries successfully cleared.
   */
  public static resetAll(): number {
    let count = 0;
    for (const reg of this.registries) {
      try {
        if (typeof reg.clear === 'function') {
          reg.clear();
          count++;
        }
      } catch (err) {
        console.error(`[RegistryResetManager] Failed to clear registry:`, err);
      }
    }

    try {
      PatternRepositoryFactory.reset();
      count++;
    } catch (err) {
      console.error(`[RegistryResetManager] Failed to reset PatternRepositoryFactory:`, err);
    }

    return count;
  }
}
