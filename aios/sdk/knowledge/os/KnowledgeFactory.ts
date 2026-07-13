import { IKnowledgeSourceResolver } from '../source/IKnowledgeSourceResolver';
import { IKnowledgePipeline, KnowledgePipeline } from '../pipeline';
import { IKnowledgeQueryService, KnowledgeQueryService } from '../query';
import { KnowledgeRegistry } from '../engine/KnowledgeRegistry';
import { SequenceKnowledgePlugin } from '../engine/plugins/sequence/SequenceKnowledgePlugin';
import { KnowledgeDiscovery } from '../engine/KnowledgeDiscovery';
import { KnowledgeEngine } from '../engine/KnowledgeEngine';
import { KnowledgeRuleRegistry } from '../governance/KnowledgeRuleRegistry';
import { MinimumNodesCountRule } from '../governance/rules/MinimumNodesCountRule';
import { KnowledgeGovernanceRegistry } from '../governance/KnowledgeGovernanceRegistry';
import { SequenceKnowledgeGovernancePolicy } from '../governance/policies/SequenceKnowledgeGovernancePolicy';
import { InMemoryKnowledgeRepository } from '../repository/InMemoryKnowledgeRepository';
import { InMemoryKnowledgeSerialAllocator } from '../governance/InMemoryKnowledgeSerialAllocator';
import { KnowledgeGovernanceOrchestrator } from '../governance/KnowledgeGovernanceOrchestrator';
import { IKnowledgePlugin } from '../engine/IKnowledgePlugin';
import { IGovernancePolicy } from '../governance/IGovernancePolicy';
import { IGovernanceRule } from '../governance/IGovernanceRule';

export interface KnowledgeOSComponents {
  pipeline: IKnowledgePipeline;
  queryService: IKnowledgeQueryService;
  pluginRegistry: KnowledgeRegistry;
  govRegistry: KnowledgeGovernanceRegistry;
  ruleRegistry: KnowledgeRuleRegistry;
  repository: InMemoryKnowledgeRepository;
}

export class KnowledgeOSBuilder {
  private readonly pluginRegistry = new KnowledgeRegistry();
  private readonly govRegistry = new KnowledgeGovernanceRegistry();
  private readonly ruleRegistry = new KnowledgeRuleRegistry();

  public registerPlugin(plugin: IKnowledgePlugin): this {
    this.pluginRegistry.register(plugin);
    return this;
  }

  public registerPolicy(policy: IGovernancePolicy): this {
    this.govRegistry.register(policy);
    return this;
  }

  public registerRule(rule: IGovernanceRule): this {
    this.ruleRegistry.register(rule);
    return this;
  }

  public build(resolver: IKnowledgeSourceResolver): KnowledgeOSComponents {
    const discovery = new KnowledgeDiscovery(this.pluginRegistry);
    const engine = new KnowledgeEngine(discovery);

    const repository = new InMemoryKnowledgeRepository();
    const allocator = new InMemoryKnowledgeSerialAllocator();

    const orchestrator = new KnowledgeGovernanceOrchestrator(
      this.govRegistry,
      repository,
      allocator
    );

    const queryService = new KnowledgeQueryService(repository);
    const pipeline = new KnowledgePipeline(resolver, engine, orchestrator);

    return {
      pipeline,
      queryService,
      pluginRegistry: this.pluginRegistry,
      govRegistry: this.govRegistry,
      ruleRegistry: this.ruleRegistry,
      repository
    };
  }
}

export class KnowledgeFactory {
  public static createComponents(resolver: IKnowledgeSourceResolver): KnowledgeOSComponents {
    const ruleRegistry = new KnowledgeRuleRegistry();
    ruleRegistry.register(new MinimumNodesCountRule());

    return new KnowledgeOSBuilder()
      .registerPlugin(new SequenceKnowledgePlugin())
      .registerRule(new MinimumNodesCountRule())
      .registerPolicy(new SequenceKnowledgeGovernancePolicy(ruleRegistry))
      .build(resolver);
  }
}
