import { ProjectRegistry } from '../../projects/registry/ProjectRegistry';
import { 
  IntentDecision, 
  DecisionReason, 
  ProjectCandidate, 
  IntentConfidence, 
  TaskRiskLevel 
} from './ExecutiveTypes';

export class IntentResolver {
  private readonly projectRegistry: ProjectRegistry;

  constructor(projectRegistry: ProjectRegistry) {
    this.projectRegistry = projectRegistry;
  }

  /**
   * Analyzes raw CEO natural language input and resolves it into a structured IntentDecision.
   */
  public resolve(rawInput: string): IntentDecision {
    const reasoning: DecisionReason[] = [];
    const candidatesMap = new Map<string, { score: number; capabilities: Set<string> }>();
    const descriptors = this.projectRegistry.list();

    const lowerInput = rawInput.toLowerCase();

    // Priority 1: Explicit Project Mention Check
    let explicitProjectId: string | undefined;
    descriptors.forEach(descriptor => {
      const pId = descriptor.manifest.projectId.toLowerCase();
      const pName = descriptor.manifest.projectName.toLowerCase();
      if (lowerInput.includes(pId) || lowerInput.includes(pName) || (pId === 'posting-map' && (lowerInput.includes('ポスティング') || lowerInput.includes('posting')))) {
        explicitProjectId = descriptor.manifest.projectId;
        reasoning.push({
          factor: "EXPLICIT_MENTION",
          value: descriptor.manifest.projectId,
          reason: `Explicit mention of project name or ID detected in input: "${descriptor.manifest.projectName}"`,
          score: 1.0
        });
      }
    });

    // Priority 3: Capability Match Deduction
    const inferredCapabilities: string[] = [];
    if (lowerInput.includes("line") || lowerInput.includes("liff")) {
      inferredCapabilities.push("LIFF");
    }
    if (lowerInput.includes("gas") || lowerInput.includes("script")) {
      inferredCapabilities.push("GAS");
    }
    if (lowerInput.includes("gis") || lowerInput.includes("マップ") || lowerInput.includes("地図") || lowerInput.includes("境界")) {
      inferredCapabilities.push("GIS");
    }
    if (lowerInput.includes("曲") || lowerInput.includes("音楽") || lowerInput.includes("disco")) {
      inferredCapabilities.push("MEDIA_CURATION");
    }

    inferredCapabilities.forEach(cap => {
      const matchedDescriptors = this.projectRegistry.findByCapability(cap);
      matchedDescriptors.forEach(desc => {
        const pId = desc.manifest.projectId;
        const current = candidatesMap.get(pId) || { score: 0, capabilities: new Set() };
        current.score += 0.3;
        current.capabilities.add(cap);
        candidatesMap.set(pId, current);

        reasoning.push({
          factor: "CAPABILITY_MATCH",
          value: `${desc.manifest.projectId}:${cap}`,
          reason: `${cap} capability detected and matched to project ${desc.manifest.projectId}`,
          score: 0.8
        });
      });
    });

    // Determine Candidates
    const candidates: ProjectCandidate[] = Array.from(candidatesMap.entries()).map(([projectId, data]) => ({
      projectId,
      matchedCapabilities: Array.from(data.capabilities),
      score: Math.min(data.score, 1.0)
    }));

    // Selected Project Determination & Confidence Scoring
    let selectedProjectId: string | undefined = explicitProjectId;
    let semanticConfidence = lowerInput.length > 5 ? 0.9 : 0.4;
    let projectMatchConfidence = 0.0;
    let capabilityMatchConfidence = inferredCapabilities.length > 0 ? 0.85 : 0.3;
    let historicalConfidence = 0.7; // Baseline default

    if (explicitProjectId) {
      projectMatchConfidence = 1.0;
    } else if (candidates.length === 1) {
      selectedProjectId = candidates[0].projectId;
      projectMatchConfidence = candidates[0].score;
    } else if (candidates.length > 1) {
      candidates.sort((a, b) => b.score - a.score);
      if (candidates[0].score > candidates[1].score + 0.2) {
        selectedProjectId = candidates[0].projectId;
        projectMatchConfidence = candidates[0].score;
      } else {
        projectMatchConfidence = 0.4; // Ambiguous
      }
    }

    const overallConfidence = (semanticConfidence + projectMatchConfidence + capabilityMatchConfidence + historicalConfidence) / 4;

    const confidence: IntentConfidence = {
      semanticConfidence,
      projectMatchConfidence,
      capabilityMatchConfidence,
      historicalConfidence,
      overallConfidence
    };

    // Risk Assessment
    let riskLevel: TaskRiskLevel = "LOW";
    if (lowerInput.includes("本番") || lowerInput.includes("db") || lowerInput.includes("削除") || lowerInput.includes("deploy")) {
      riskLevel = "HIGH";
    } else if (lowerInput.includes("変更") || lowerInput.includes("更新") || lowerInput.includes("patch")) {
      riskLevel = "MEDIUM";
    }

    // Resolution Status
    let resolutionStatus: "RESOLVED" | "AMBIGUOUS" | "NEED_CLARIFICATION" = "RESOLVED";

    if (!selectedProjectId || projectMatchConfidence < 0.6) {
      resolutionStatus = candidates.length > 1 ? "AMBIGUOUS" : "NEED_CLARIFICATION";
    } else if (overallConfidence < 0.7 || riskLevel === "HIGH") {
      resolutionStatus = "NEED_CLARIFICATION";
    }

    return {
      rawInput,
      projectCandidates: candidates,
      selectedProjectId,
      requiredCapabilities: inferredCapabilities,
      confidence,
      reasoning,
      riskLevel,
      resolutionStatus
    };
  }
}
