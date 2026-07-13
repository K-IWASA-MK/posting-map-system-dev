import { Hypothesis } from '../models/Hypothesis';
import { Evidence } from '../models/Evidence';
import { Decision } from '../models/Decision';
import { ReasoningContext } from '../ReasoningContext';

export interface IReasoningProvider {
    evaluate(hypotheses: Hypothesis[], context: ReasoningContext): Promise<Hypothesis[]>;
    makeDecision(hypotheses: Hypothesis[], context: ReasoningContext): Promise<Decision>;
    explain(decision: Decision, context: ReasoningContext): Promise<string>;
}
