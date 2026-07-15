import { PolicyProfile } from "./PolicyProfile";

export interface PolicyDiff {
  readonly beforeProfile: PolicyProfile;
  readonly afterProfile: PolicyProfile;
  readonly reason: string;
  readonly trigger: string;
  readonly changedRules: string[];
  readonly impactSummary: string;
}
