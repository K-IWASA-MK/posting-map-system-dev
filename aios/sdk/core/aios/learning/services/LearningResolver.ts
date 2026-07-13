import { LearningContext } from '../LearningContext';
import { LearningSource } from '../models/LearningSource';

export class LearningResolver {
    public resolveSources(data: any): LearningSource[] {
        // Mock logic to determine sources based on data payload
        return [LearningSource.REASONING_RUNTIME, LearningSource.WORKFLOW_RUNTIME];
    }
}
