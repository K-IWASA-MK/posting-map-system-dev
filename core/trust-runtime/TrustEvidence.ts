import { ITrustMonitoringView } from './ITrustMonitoringView';

/**
 * TrustEvidence aggregates current telemetry checkpoints and signatures before launching.
 */
export interface TrustEvidence {
  readonly monitoringView: ITrustMonitoringView;
  readonly signatureValid: boolean;
  readonly pluginId: string;
  readonly projectId: string;
}
