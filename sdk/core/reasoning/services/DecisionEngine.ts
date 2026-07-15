import { Hypothesis } from '../models/Hypothesis';
import { Decision } from '../models/Decision';
import { ReasoningContext } from '../ReasoningContext';
import { IReasoningProvider } from '../providers/IReasoningProvider';

export class DecisionEngine {
    constructor(private provider: IReasoningProvider) {}

    public async decide(hypotheses: Hypothesis[], context: ReasoningContext): Promise<Decision> {
        return this.provider.makeDecision(hypotheses, context);
    }
}
