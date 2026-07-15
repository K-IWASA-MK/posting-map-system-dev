import { IKnowledgePlugin } from '../../IKnowledgePlugin';
import { KnowledgeDataset, ILogicalRule } from '../../../contracts';
import { KnowledgePluginResult } from '../../KnowledgePluginResult';
import { SemanticGraphBuilder } from '../../SemanticGraphBuilder';
import { LogicalRuleBuilder } from '../../LogicalRuleBuilder';
import { SequencePatternData } from '../../../../learning/plugins/sequence/SequencePatternData';

export class SequenceKnowledgePlugin implements IKnowledgePlugin {
  public readonly pluginId = 'aios.knowledge.plugin.sequence';
  public readonly targetPatternType = 'SEQUENCE';
  public readonly version = '1.0.0';
  public readonly priority = 100;

  public supports(dataset: KnowledgeDataset): boolean {
    return dataset.patterns.some(p => p.patternType === this.targetPatternType);
  }

  public synthesize(dataset: KnowledgeDataset): ReadonlyArray<KnowledgePluginResult> {
    const startTime = Date.now();
    const sequencePatterns = dataset.patterns.filter(p => p.patternType === this.targetPatternType);
    if (sequencePatterns.length === 0) return [];

    const graphBuilder = SemanticGraphBuilder.create();
    const logicalRules: ILogicalRule[] = [];
    const patternIds: string[] = [];

    for (const pattern of sequencePatterns) {
      patternIds.push(pattern.patternId);
      
      // Type-safe cast (any excluded)
      const data = pattern.patternData as SequencePatternData;

      if (!data.events || data.events.length < 2) continue;

      const eventA = data.events[0];
      const eventB = data.events[1];

      // Add nodes (merged automatically by builder if duplicate nodeId exists)
      graphBuilder.addNode({
        nodeId: `N-${eventA}`,
        label: `Event State ${eventA}`,
        type: 'STATE',
        properties: { eventType: eventA }
      });

      graphBuilder.addNode({
        nodeId: `N-${eventB}`,
        label: `Event State ${eventB}`,
        type: 'STATE',
        properties: { eventType: eventB }
      });

      // Add edge
      graphBuilder.addEdge({
        edgeId: `E-${eventA}->${eventB}`,
        sourceNodeId: `N-${eventA}`,
        targetNodeId: `N-${eventB}`,
        type: 'TRANSITION_TO',
        properties: { patternId: pattern.patternId }
      });

      // Build rule
      logicalRules.push(
        LogicalRuleBuilder.create(`RULE-${pattern.patternId}`, 'TRANSITION_GUARD', this.pluginId)
          .parameter('triggerEvent', eventA)
          .parameter('nextEvent', eventB)
          .build()
      );
    }

    const semantic = graphBuilder.build();
    const durationMs = Date.now() - startTime;

    const result: KnowledgePluginResult = {
      pluginId: this.pluginId,
      semantic,
      logicalRules: Object.freeze(logicalRules),
      sourcePatternIds: Object.freeze(patternIds),
      durationMs,
      warnings: []
    };

    return Object.freeze([Object.freeze(result)]);
  }
}
