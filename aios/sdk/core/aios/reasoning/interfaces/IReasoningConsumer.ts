import { Decision } from '../models/Decision';

export interface IReasoningConsumer {
    consumeDecision(decision: Decision): Promise<void>;
}
