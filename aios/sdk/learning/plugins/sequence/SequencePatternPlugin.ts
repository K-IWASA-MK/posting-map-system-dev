import { LearningPlugin } from '../../discovery';
import { SequencePatternExtractor } from './SequencePatternExtractor';

export const SequencePatternPlugin: LearningPlugin = Object.freeze({
  schemaVersion: '1.0.0',
  pluginId: 'aios.learning.plugin.sequence',
  version: '1.0.0',
  name: 'Sequence Pattern Discovery',
  description: 'Extracts deterministic 2-gram sequential patterns (A -> B) from datasets.',
  priority: 100,
  targetPatternType: 'SEQUENCE',
  extractor: new SequencePatternExtractor()
});
