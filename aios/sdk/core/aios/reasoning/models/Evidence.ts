import { EvidenceSource } from './EvidenceSource';

export interface Evidence {
    evidenceId: string;
    source: EvidenceSource;
    content: string;
    weight: number;      // 0.0 to 1.0
    reliability: number; // 0.0 to 1.0
    priority: number;    // 0 to 10
    collectedAt: string;
}
