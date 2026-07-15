import { PatternRegistry, PatternDiscovery } from '../discovery';
import { SequencePatternPlugin } from '../plugins/sequence/SequencePatternPlugin';
import { RuleRegistry, GovernanceRegistry, SequenceGovernancePolicy, MinimumOccurrenceRule, GovernanceOrchestrator } from '../governance';
import { InMemoryPatternRepository } from '../repository';
import { PatternQueryService } from '../query';
import { LearningEngine, LearningPipelineFactory, ILearningPipeline } from '../pipeline';
import { ILearningSourceResolver } from '../source';
import { IPatternQueryService } from '../query/IPatternQueryService';

export interface LearningOSComponents {
  pipeline: ILearningPipeline;
  queryService: IPatternQueryService;
  loadedPluginsCount: number;
  loadedPoliciesCount: number;
}

export class LearningFactory {
  public static createComponents(resolver: ILearningSourceResolver): LearningOSComponents {
    // 1. Engine Layer
    const patternRegistry = new PatternRegistry();
    patternRegistry.register(SequencePatternPlugin);
    
    const patternDiscovery = new PatternDiscovery(patternRegistry);
    const learningEngine = new LearningEngine(patternDiscovery);

    // 2. Governance Layer
    const ruleRegistry = new RuleRegistry();
    ruleRegistry.register(new MinimumOccurrenceRule(2));

    const governanceRegistry = new GovernanceRegistry();
    governanceRegistry.register(new SequenceGovernancePolicy(ruleRegistry));

    // 3. Storage Layer
    const repository = new InMemoryPatternRepository();

    // 4. Orchestrator Layer
    const orchestrator = new GovernanceOrchestrator(governanceRegistry, repository);

    // 5. Read Layer
    const queryService = new PatternQueryService(repository);

    // 6. Pipeline Layer
    const pipeline = LearningPipelineFactory.create({
      resolver,
      engine: learningEngine,
      orchestrator
    });

    return {
      pipeline,
      queryService,
      loadedPluginsCount: 1, // sequence
      loadedPoliciesCount: 1 // sequence
    };
  }
}
