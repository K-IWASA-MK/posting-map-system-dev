import { PolicyDiff } from "./PolicyDiff";
import { PolicyVersion } from "./PolicyVersion";
import { PolicyScope } from "./PolicyScope";
import { AffectedRuntime } from "./AffectedRuntime";

export interface PolicyUpdateRecord {
  readonly id: string;
  readonly traceId: string;
  readonly version: PolicyVersion;
  readonly diff: PolicyDiff;
  readonly scope: PolicyScope;
  readonly affectedRuntimes: AffectedRuntime[];
  readonly executedAt: number;
}
