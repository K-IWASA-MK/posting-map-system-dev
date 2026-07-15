import { IKnowledgeSourceResolver } from '../source/IKnowledgeSourceResolver';
import { KnowledgeFactory, KnowledgeOSComponents } from './KnowledgeFactory';
import { KnowledgeRuntime } from './KnowledgeRuntime';
import { KnowledgeVersion } from './KnowledgeVersion';
import { KnowledgeOSState } from './KnowledgeOSState';
import { InMemoryKnowledgeRepository } from '../repository/InMemoryKnowledgeRepository';
import { KnowledgeRegistry } from '../engine/KnowledgeRegistry';
import { KnowledgeGovernanceRegistry } from '../governance/KnowledgeGovernanceRegistry';
import { KnowledgeRuleRegistry } from '../governance/KnowledgeRuleRegistry';

export class KnowledgeBootstrap {
  /**
   * Future Roadmap: AIOSBootstrap integration point.
   * AIOSBootstrap will serve as the single consolidated entry point to orchestrate LearningOS,
   * KnowledgeOS, and ObservabilityOS components together under an active lifecycle (BOOTING -> READY -> RUNNING).
   */
  public static async boot(
    resolver: IKnowledgeSourceResolver
  ): Promise<{ runtime: KnowledgeRuntime; components: KnowledgeOSComponents; version: KnowledgeVersion }> {
    
    const version: KnowledgeVersion = {
      coreVersion: '5.10.0', // Sprint 10 Knowledge OS core version
      schemaVersion: '1.0.0',
      sprint: '10',
      build: 'S10-8'
    };

    // Construct transient components safely without require()
    const tempRepo = new InMemoryKnowledgeRepository();
    const tempPlugin = new KnowledgeRegistry();
    const tempGov = new KnowledgeGovernanceRegistry();
    const tempRule = new KnowledgeRuleRegistry();
    
    const runtime = new KnowledgeRuntime(tempRepo, tempPlugin, tempGov, tempRule, version);

    try {
      const components = KnowledgeFactory.createComponents(resolver);
      
      const readyRuntime = new KnowledgeRuntime(
        components.repository,
        components.pluginRegistry,
        components.govRegistry,
        components.ruleRegistry,
        version
      );

      readyRuntime.transitionTo(KnowledgeOSState.READY);

      return {
        runtime: readyRuntime,
        components,
        version
      };

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown initialization error";
      runtime.transitionTo(KnowledgeOSState.ERROR, message);
      throw err;
    }
  }
}
