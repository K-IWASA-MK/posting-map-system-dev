import { IGovernanceProvider } from './IGovernanceProvider';
import { GovernanceRequest } from '../models/GovernanceRequest';
import { ImpactAnalysis } from '../models/ImpactAnalysis';
import { ComplianceReport } from '../models/ComplianceReport';
import { GovernanceDecision } from '../models/GovernanceDecision';
import crypto from 'crypto';

export class MockGovernanceProvider implements IGovernanceProvider {
    
    public async evaluatePolicy(request: GovernanceRequest): Promise<boolean> {
        // Return false if priority is low, simulating policy failure
        if (request.priority === 'LOW') {
            return false;
        }
        return true;
    }

    public async resolvePolicyConflict(request: GovernanceRequest): Promise<void> {
        // Simulation of resolving policy conflict
        return Promise.resolve();
    }

    public async analyzeImpact(request: GovernanceRequest): Promise<ImpactAnalysis> {
        // High risk implies breaking change
        const isBreaking = request.riskScore > 80;
        return {
            analysisId: crypto.randomUUID(),
            requestId: request.requestId,
            affectedRuntimes: [request.targetRuntime],
            affectedModules: ['core-module'],
            affectedContracts: ['ContractV1'],
            affectedAPIs: ['api/v1/resource'],
            breakingChange: isBreaking,
            migrationRequired: isBreaking,
            compatibilityScore: isBreaking ? 40 : 95,
            analyzedAt: new Date().toISOString()
        };
    }

    public async validateCompliance(request: GovernanceRequest): Promise<ComplianceReport> {
        // Mock compliance failure if dependencies contain 'malicious-lib'
        const hasMalicious = request.dependencies.includes('malicious-lib');
        return {
            reportId: crypto.randomUUID(),
            requestId: request.requestId,
            complianceScore: hasMalicious ? 0 : 100,
            failedRules: hasMalicious ? ['SEC-001: No malicious libraries'] : [],
            passedRules: ['SEC-002', 'GOV-001'],
            policyEvidence: 'Scan completed',
            evidenceHash: 'hash-abc',
            severity: hasMalicious ? 'CRITICAL' : 'LOW',
            recommendation: hasMalicious ? 'Reject due to security risk' : 'Proceed',
            validatedAt: new Date().toISOString()
        };
    }

    public async makeDecision(request: GovernanceRequest, impact: ImpactAnalysis, compliance: ComplianceReport): Promise<GovernanceDecision> {
        let status: 'APPROVED' | 'APPROVED_WITH_CONDITIONS' | 'DEFERRED' | 'REJECTED' = 'APPROVED';
        let reason = 'All checks passed';

        if (compliance.complianceScore < 50) {
            status = 'REJECTED';
            reason = 'Compliance failure';
        } else if (impact.breakingChange) {
            status = 'DEFERRED';
            reason = 'Deferred due to breaking change requiring manual review';
        }

        return {
            decisionId: crypto.randomUUID(),
            requestId: request.requestId,
            status: status,
            decisionReason: reason,
            decisionScore: 90,
            decisionConfidence: 0.95,
            requiredConditions: (status as string) === 'APPROVED_WITH_CONDITIONS' ? ['Run in isolated sandbox'] : [],
            isolationLevel: 'STANDARD',
            expiry: new Date(Date.now() + 86400000).toISOString(),
            decisionTimestamp: new Date().toISOString()
        };
    }

    public async enforceIsolation(decision: GovernanceDecision): Promise<void> {
        // Simulate applying isolation rules
        return Promise.resolve();
    }
}
