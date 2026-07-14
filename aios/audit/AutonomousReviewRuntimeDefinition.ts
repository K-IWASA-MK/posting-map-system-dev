import { AutonomousReviewRuntimeType } from "./AutonomousReviewRuntimeType";
import { AutonomousReviewRuntimeStatus } from "./AutonomousReviewRuntimeStatus";
import { AutonomousReviewRuntimeMetadata } from "./AutonomousReviewRuntimeMetadata";

export interface AutonomousReviewRuntimeDefinition {
  id: string;
  name: string;
  version: string;
  type: AutonomousReviewRuntimeType;
  status: AutonomousReviewRuntimeStatus;
  metadata: AutonomousReviewRuntimeMetadata;
}
