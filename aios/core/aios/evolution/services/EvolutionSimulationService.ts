import { EvolutionCandidate } from '../models/EvolutionCandidate';
import { EvolutionPlan } from '../models/EvolutionPlan';

export class ImpactEstimator {
  estimate(candidate: EvolutionCandidate, plan: EvolutionPlan) { return { impactScore: 80 }; }
}

export class RiskEstimator {
  estimate(candidate: EvolutionCandidate, plan: EvolutionPlan) { return { riskScore: 10 }; }
}

export class BenefitEstimator {
  estimate(candidate: EvolutionCandidate, plan: EvolutionPlan) { return { benefitScore: 90 }; }
}

export class CompatibilityEstimator {
  estimate(candidate: EvolutionCandidate, plan: EvolutionPlan) { return { isCompatible: true }; }
}

export class SimulationReporter {
  generateReport(impact: any, risk: any, benefit: any, compatibility: any) {
    return {
      reportId: `sim-rep-${Date.now()}`,
      passed: compatibility.isCompatible && risk.riskScore < 50 && benefit.benefitScore > 50,
      details: { impact, risk, benefit, compatibility }
    };
  }
}

export class EvolutionSimulationService {
  constructor(
    private impactEstimator: ImpactEstimator,
    private riskEstimator: RiskEstimator,
    private benefitEstimator: BenefitEstimator,
    private compatibilityEstimator: CompatibilityEstimator,
    private reporter: SimulationReporter
  ) {}

  async simulate(candidate: EvolutionCandidate, plan: EvolutionPlan): Promise<{ passed: boolean, reportId: string }> {
    const impact = this.impactEstimator.estimate(candidate, plan);
    const risk = this.riskEstimator.estimate(candidate, plan);
    const benefit = this.benefitEstimator.estimate(candidate, plan);
    const compatibility = this.compatibilityEstimator.estimate(candidate, plan);
    
    // Simulate candidate properties affecting the simulation
    if (candidate.estimatedRisk === 'HIGH_SIMULATION_FAIL_MOCK') {
      risk.riskScore = 90; // Force fail
    }

    const report = this.reporter.generateReport(impact, risk, benefit, compatibility);
    return { passed: report.passed, reportId: report.reportId };
  }
}
