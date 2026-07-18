import { AutonomousExecutionBudget as BudgetConfig } from "../contracts/AutonomousSprintContract";

export class AutonomousExecutionBudget {
  private readonly config: BudgetConfig;
  private currentSprintCount = 0;
  private currentCommitCount = 0;
  private currentReleaseCount = 0;
  private lastExecutionTime = 0;

  constructor(config?: BudgetConfig) {
    this.config = config || {
      maxExecutionMinutes: 30,
      maxSprintCount: 1,
      maxCommitCount: 1,
      maxReleaseCount: 1,
      cooldownMinutes: 60
    };
  }

  /**
   * Evaluates if starting a new sprint or performing a runtime operation fits within budget.
   */
  public evaluate(params: {
    newSprint: boolean;
    elapsedMinutes: number;
    additionalCommits?: number;
    additionalReleases?: number;
  }): { allowed: boolean; reason?: string } {
    const now = Date.now();

    // 1. Cooldown check (only for new sprints)
    if (params.newSprint && this.lastExecutionTime > 0) {
      const elapsedCooldownMin = (now - this.lastExecutionTime) / (60 * 1000);
      if (elapsedCooldownMin < this.config.cooldownMinutes) {
        const waitMin = Math.ceil(this.config.cooldownMinutes - elapsedCooldownMin);
        return {
          allowed: false,
          reason: `Budget Block: Cooldown active. Must wait ${waitMin} more minutes before starting next sprint.`
        };
      }
    }

    // 2. Execution time check
    if (params.elapsedMinutes > this.config.maxExecutionMinutes) {
      return {
        allowed: false,
        reason: `Budget Block: Max execution time exceeded (${params.elapsedMinutes} mins > ${this.config.maxExecutionMinutes} mins).`
      };
    }

    // 3. Sprint count check
    if (params.newSprint && this.currentSprintCount >= this.config.maxSprintCount) {
      return {
        allowed: false,
        reason: `Budget Block: Max sprint count reached (${this.currentSprintCount} >= ${this.config.maxSprintCount}).`
      };
    }

    // 4. Commit count check
    const projectedCommits = this.currentCommitCount + (params.additionalCommits || 0);
    if (projectedCommits > this.config.maxCommitCount) {
      return {
        allowed: false,
        reason: `Budget Block: Projected commits exceed max limit (${projectedCommits} > ${this.config.maxCommitCount}).`
      };
    }

    // 5. Release count check
    const projectedReleases = this.currentReleaseCount + (params.additionalReleases || 0);
    if (projectedReleases > this.config.maxReleaseCount) {
      return {
        allowed: false,
        reason: `Budget Block: Projected releases exceed max limit (${projectedReleases} > ${this.config.maxReleaseCount}).`
      };
    }

    return { allowed: true };
  }

  /**
   * Consumes budget allocations upon successful actions.
   */
  public consume(newSprint: boolean, commits = 0, releases = 0): void {
    if (newSprint) {
      this.currentSprintCount++;
      this.lastExecutionTime = Date.now();
    }
    this.currentCommitCount += commits;
    this.currentReleaseCount += releases;
  }

  public reset(): void {
    this.currentSprintCount = 0;
    this.currentCommitCount = 0;
    this.currentReleaseCount = 0;
    this.lastExecutionTime = 0;
  }

  // Getters for testing
  public getBudgetStatus() {
    return {
      sprints: this.currentSprintCount,
      commits: this.currentCommitCount,
      releases: this.currentReleaseCount,
      lastExecution: this.lastExecutionTime
    };
  }
}
