import { DecisionMetadata } from './DecisionMetadata';

export interface Decision {
    decisionId: string;
    conclusion: string;
    metadata: DecisionMetadata;
    selectedHypothesisId?: string;
}
