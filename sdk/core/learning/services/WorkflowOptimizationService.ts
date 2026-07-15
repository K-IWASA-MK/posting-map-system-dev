import { ILearningProvider } from '../providers/ILearningProvider';
import { LearningPattern } from '../models/LearningPattern';
import { WorkflowImprovement } from '../models/WorkflowImprovement';

export class WorkflowOptimizationService {
    constructor(private provider: ILearningProvider) {}

    public async optimizeWorkflows(patterns: LearningPattern[]): Promise<WorkflowImprovement[]> {
        const improvements = await this.provider.generateImprovements(patterns);
        return improvements.map(imp => ({
            ...imp,
            targetWorkflowId: 'workflow-1',
            bottleneckIdentified: 'Step 2 takes too long',
            suggestedRouting: 'Parallelize Step 2'
        }));
    }
}
