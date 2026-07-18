import * as fs from "fs";
import * as path from "path";

export class AutonomousSafetyAuditor {
  private readonly controllerPath: string;

  constructor(controllerPath?: string) {
    this.controllerPath =
      controllerPath ||
      path.join(__dirname, "../../autonomous/runtime/AutonomousExecutionController.ts");
  }

  /**
   * Safe evaluation of safety guard mechanisms.
   */
  public audit(): { success: boolean; score: number; findings: string[] } {
    const findings: string[] = [];
    let violationCount = 0;

    if (!fs.existsSync(this.controllerPath)) {
      findings.push("Safety Violation: AutonomousExecutionController.ts is missing.");
      return { success: false, score: 0, findings };
    }

    const content = fs.readFileSync(this.controllerPath, "utf-8");

    // 1. Check Kill Switch
    const hasKillSwitch = content.includes("emergencyStop") && content.includes("triggerEmergencyStop");
    if (!hasKillSwitch) {
      findings.push("Safety Violation: Emergency stop kill switch logic is missing or disabled in Autonomous Controller.");
      violationCount++;
    }

    // 2. Check Budget Control
    const hasBudget = content.includes("AutonomousExecutionBudget") && content.includes("budget.evaluate");
    if (!hasBudget) {
      findings.push("Safety Violation: Autonomous execution duration/limit budget validation is missing.");
      violationCount++;
    }

    // 3. Check Loop Guard
    const hasLoopGuard = content.includes("AutonomousLoopGuard") && content.includes("loopGuard.evaluate");
    if (!hasLoopGuard) {
      findings.push("Safety Violation: Infinite loop/retry loop guard protection is missing.");
      violationCount++;
    }

    // 4. Check Approval Policy
    const hasApprovalPolicy = content.includes("AutonomousApprovalPolicy") && content.includes("approvalPolicy.evaluateApproval");
    if (!hasApprovalPolicy) {
      findings.push("Safety Violation: Human override approval policy routing check is missing.");
      violationCount++;
    }

    const score = Math.max(0, 100 - violationCount * 25);
    return {
      success: violationCount === 0,
      score,
      findings
    };
  }
}
