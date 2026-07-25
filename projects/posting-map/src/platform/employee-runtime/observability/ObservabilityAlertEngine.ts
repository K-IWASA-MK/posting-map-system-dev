/**
 * AIOS Employee Observability Foundation
 * Observability Alert Engine Implementation
 */

import { IAlertEngine } from './contract/IEmployeeObservability';
import { AlertRecord, AlertStatus, RuntimeEvent } from './models/EmployeeObservabilityModels';

export class ObservabilityAlertEngine implements IAlertEngine {
  private alerts: Map<string, AlertRecord> = new Map();

  public detectAnomalies(events: RuntimeEvent[]): AlertRecord[] {
    const newAlerts: AlertRecord[] = [];

    // 1. Detect Execution Failures
    const execFailures = events.filter(
      (e) => e.eventType === 'EXECUTION_EVENT' && (e.payload.status === 'FAILED' || e.payload.status === 'TIMEOUT')
    );

    if (execFailures.length >= 2) {
      const alertId = `ALT-FAIL-${Date.now()}`;
      const alert: AlertRecord = {
        alertId: alertId,
        alertType: 'EXECUTION_FAILURE_SPIKE',
        message: `Detected ${execFailures.length} execution failures or timeouts. Human review required.`,
        severity: 'CRITICAL',
        status: 'DETECTED', // Always DETECTED initially
        detectedAt: new Date().toISOString(),
      };
      this.alerts.set(alertId, alert);
      newAlerts.push(alert);
    }

    // 2. Detect Result Verification Failures
    const verificationFailures = events.filter(
      (e) => e.eventType === 'RESULT_EVENT' && e.payload.status === 'REJECTED'
    );

    if (verificationFailures.length > 0) {
      const alertId = `ALT-VERIF-${Date.now()}`;
      const alert: AlertRecord = {
        alertId: alertId,
        alertType: 'RESULT_VERIFICATION_REJECTED',
        message: `Detected ${verificationFailures.length} rejected results during verification.`,
        severity: 'WARNING',
        status: 'DETECTED',
        detectedAt: new Date().toISOString(),
      };
      this.alerts.set(alertId, alert);
      newAlerts.push(alert);
    }

    return newAlerts;
  }

  public updateAlertStatus(
    alertId: string,
    newStatus: 'REVIEW_REQUIRED' | 'RESOLVED',
    authorizedByHuman: boolean
  ): AlertRecord {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`[Observability Alert Block] AlertId '${alertId}' not found.`);
    }

    // Prohibition of automated resolution
    if (newStatus === 'RESOLVED' && !authorizedByHuman) {
      throw new Error(
        `[Observability Alert Block] Automated transition of Alert '${alertId}' to 'RESOLVED' is forbidden. Human review authorization required.`
      );
    }

    alert.status = newStatus;
    return alert;
  }

  public getAlerts(): AlertRecord[] {
    return Array.from(this.alerts.values());
  }
}
