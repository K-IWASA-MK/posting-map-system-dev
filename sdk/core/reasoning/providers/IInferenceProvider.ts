import { Hypothesis } from '../models/Hypothesis';
import { Evidence } from '../models/Evidence';
import { ReasoningContext } from '../ReasoningContext';

export interface IInferenceProvider {
    infer(evidence: Evidence[], context: ReasoningContext): Promise<Hypothesis[]>;
}
