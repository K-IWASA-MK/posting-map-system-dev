import { PromotionCandidate } from '../models/PromotionCandidate';
import { MergePlanner } from './MergePlanner';
import { ConflictDetector } from './ConflictDetector';
import { MergeSimulator } from './MergeSimulator';
import { VersionGenerator } from './VersionGenerator';
import { LineageUpdater } from './LineageUpdater';
import { PromotionWriter } from './PromotionWriter';
import { ConflictPolicy } from '../policy/ConflictPolicy';

export class KnowledgeMergeEngine {
  constructor(
    private planner: MergePlanner,
    private conflictDetector: ConflictDetector,
    private simulator: MergeSimulator,
    private versionGenerator: VersionGenerator,
    private lineageUpdater: LineageUpdater,
    private promotionWriter: PromotionWriter
  ) {}

  public async executeMerge(candidate: PromotionCandidate): Promise<any> {
    const plan = this.planner.planMerge(candidate);
    
    const conflictResult = this.conflictDetector.detectConflicts(candidate, plan);
    if (conflictResult.hasConflict) {
      throw new Error(`Conflict detected: ${conflictResult.type} - ${conflictResult.message}`);
    }

    const simulation = this.simulator.simulate(candidate, plan);
    const version = this.versionGenerator.generateVersion(candidate);
    const lineage = this.lineageUpdater.updateLineage(candidate, version);
    
    this.promotionWriter.commitPromotion(candidate, version, simulation);

    return {
      version,
      lineage,
      simulation
    };
  }
}
