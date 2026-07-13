import { GovernancePolicyType } from "./GovernancePolicyType";
import { GovernancePolicyStatus } from "./GovernancePolicyStatus";
import { GovernancePolicyMetadata } from "./GovernancePolicyMetadata";

export interface GovernancePolicyDefinition {
  id: string;
  name: string;
  version: string;
  type: GovernancePolicyType;
  status: GovernancePolicyStatus;
  metadata: GovernancePolicyMetadata;
}
