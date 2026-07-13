import { Evidence } from '../models/Evidence';
import { ReasoningContext } from '../ReasoningContext';
import { EvidenceSource } from '../models/EvidenceSource';
import crypto from 'crypto';

export class EvidenceService {
    private evidenceStore: Map<string, Evidence[]> = new Map(); // By sessionId

    public collectEvidence(context: ReasoningContext, sources: EvidenceSource[]): Evidence[] {
        const evidence: Evidence[] = [];
        // Mock collection
        sources.forEach(source => {
            evidence.push({
                evidenceId: crypto.randomUUID(),
                source,
                content: `Evidence from ${source}`,
                weight: 1.0,
                reliability: 0.9,
                priority: 5,
                collectedAt: new Date().toISOString()
            });
        });
        
        this.evidenceStore.set(context.session.sessionId, evidence);
        return evidence;
    }

    public getEvidence(sessionId: string): Evidence[] {
        return this.evidenceStore.get(sessionId) || [];
    }
}
