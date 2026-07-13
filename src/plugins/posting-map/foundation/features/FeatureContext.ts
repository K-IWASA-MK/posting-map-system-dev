import { Feature } from './Feature';
import { FeatureAvailability } from './FeatureAvailability';

export interface FeatureMetadata {
  readonly policyVersion?: string;
  readonly resolver?: string;
  readonly evaluationTime?: number;
  readonly [key: string]: any;
}

export class FeatureContext {
  public readonly feature: Feature;
  public readonly availability: FeatureAvailability;
  public readonly enabled: boolean;
  public readonly metadata: FeatureMetadata;

  constructor(params: {
    feature: Feature;
    availability: FeatureAvailability;
    enabled: boolean;
    metadata?: FeatureMetadata;
  }) {
    this.feature = params.feature;
    this.availability = params.availability;
    this.enabled = params.enabled;
    this.metadata = params.metadata || {};
  }
}
