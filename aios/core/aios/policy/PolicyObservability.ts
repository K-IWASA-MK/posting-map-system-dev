export interface ActivePolicyProfileObserver {
  getActiveProfile(): string;
}

export interface RuleEvaluationTimelineObserver {
  getTimeline(): any[];
}

export interface PolicyVersionHistoryObserver {
  getHistory(): any[];
}

export interface PolicyConflictObserver {
  getConflicts(): any[];
}

export interface PolicyObservability {
  readonly activeProfile: ActivePolicyProfileObserver;
  readonly ruleTimeline: RuleEvaluationTimelineObserver;
  readonly versionHistory: PolicyVersionHistoryObserver;
  readonly conflicts: PolicyConflictObserver;
}
