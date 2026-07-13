import { ReasoningContext } from '../ReasoningContext';
import { Hypothesis } from '../models/Hypothesis';
import { IReasoningProvider } from '../providers/IReasoningProvider';

export class ReasoningEngine {
    constructor(private provider: IReasoningProvider) {}

    public async evaluate(hypotheses: Hypothesis[], context: ReasoningContext): Promise<Hypothesis[]> {
        return this.provider.evaluate(hypotheses, context);
    }
}
