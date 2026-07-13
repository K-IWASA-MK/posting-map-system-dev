import { Decision } from '../models/Decision';
import { ReasoningContext } from '../ReasoningContext';
import { IReasoningProvider } from '../providers/IReasoningProvider';

export class ExplanationService {
    constructor(private provider: IReasoningProvider) {}

    public async explain(decision: Decision, context: ReasoningContext): Promise<string> {
        return this.provider.explain(decision, context);
    }
}
