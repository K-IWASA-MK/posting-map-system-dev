/**
 * AIOS Employee Observability Foundation
 * Unit Test Suite
 */

import { describe, expect, it } from 'vitest';
import { EventCollector } from '../../../src/platform/employee-runtime/observability/EventCollector';
import { ObservabilityAlertEngine } from '../../../src/platform/employee-runtime/observability/ObservabilityAlertEngine';
import { EmployeeObservabilityEngine } from '../../../src/platform/employee-runtime/observability/EmployeeObservabilityEngine';
import { RuntimeEvent } from '../../../src/platform/employee-runtime/observability/models/EmployeeObservabilityModels';

describe('AIOS Employee Observability Foundation', () => {
  const sampleEvent: RuntimeEvent = {
    eventId: 'EVT-EXEC-001',
    eventType: 'EXECUTION_EVENT',
    sourceComponent: 'ExecutionRuntimeEngine',
    payload: {
      employeeId: 'EMP-MIE03-01',
      taskId: 'TASK-MIE03-01',
      executionId: 'EXEC-TASK-MIE03-01',
      status: 'COMPLETED',
      durationMs: 450,
    },
    timestamp: '2026-07-26T04:28:00Z',
  };

  const failureEvent: RuntimeEvent = {
    eventId: 'EVT-EXEC-FAIL-01',
    eventType: 'EXECUTION_EVENT',
    sourceComponent: 'ExecutionRuntimeEngine',
    payload: {
      employeeId: 'EMP-MIE03-01',
      taskId: 'TASK-MIE03-01',
      executionId: 'EXEC-TASK-MIE03-FAIL',
      status: 'FAILED',
      durationMs: 120,
    },
    timestamp: '2026-07-26T04:28:05Z',
  };

  // Scenario 1: Runtime Event Collection & Payload Immutability
  it('should collect runtime events and reject payload alteration', () => {
    const collector = new EventCollector();
    const obs = collector.collectEvent(sampleEvent);

    expect(obs.observationId).toContain('OBS-EVT-EXEC-001');
    expect(obs.employeeId).toBe('EMP-MIE03-01');

    const collectedEvents = collector.getEvents();
    expect(collectedEvents.length).toBe(1);

    // Payload alteration attempt must fail (Frozen object)
    expect(() => {
      (collectedEvents[0].payload as any).employeeId = 'EMP-MUTATED';
    }).toThrow();
  });

  // Scenario 2: Employee State Snapshot Generation
  it('should generate accurate point-in-time Employee StateSnapshot', () => {
    const engine = new EmployeeObservabilityEngine();
    engine.recordEvent(sampleEvent);

    const snapshot = engine.createSnapshot('EMP-MIE03-01');
    expect(snapshot.employeeId).toBe('EMP-MIE03-01');
    expect(snapshot.currentTaskId).toBe('TASK-MIE03-01');
    expect(snapshot.executionStatus).toBe('COMPLETED');
    expect(snapshot.snapshotId).toContain('SNP-EMP-MIE03-01');
  });

  // Scenario 3: Observability Metric Calculation
  it('should calculate accurate metrics for success rate and average duration', () => {
    const engine = new EmployeeObservabilityEngine();
    engine.recordEvent(sampleEvent);
    engine.recordEvent(failureEvent);

    const metrics = engine.getMetrics();
    expect(metrics.length).toBe(3);

    const successRateMetric = metrics.find((m) => m.metricName === 'EXECUTION_SUCCESS_RATE');
    expect(successRateMetric).toBeDefined();
    expect(successRateMetric?.value).toBe(50.0); // 1 success, 1 failure = 50%

    const durationMetric = metrics.find((m) => m.metricName === 'AVERAGE_EXECUTION_TIME');
    expect(durationMetric).toBeDefined();
    expect(durationMetric?.value).toBe(285.0); // (450 + 120) / 2 = 285ms
  });

  // Scenario 4: Anomaly Detection & DETECTED Alert Generation
  it('should detect anomaly spike and generate DETECTED AlertRecord', () => {
    const engine = new EmployeeObservabilityEngine();
    engine.recordEvent(failureEvent);
    engine.recordEvent({ ...failureEvent, eventId: 'EVT-EXEC-FAIL-02' });

    const alerts = engine.getAlerts();
    expect(alerts.length).toBeGreaterThan(0);

    const failAlert = alerts.find((a) => a.alertType === 'EXECUTION_FAILURE_SPIKE');
    expect(failAlert).toBeDefined();
    expect(failAlert?.status).toBe('DETECTED');
    expect(failAlert?.severity).toBe('CRITICAL');
  });

  // Scenario 5: Rejection of Automated Alert RESOLVED Transition without Human Authorization
  it('should block automated status transition of Alert to RESOLVED without human authorization', () => {
    const alertEngine = new ObservabilityAlertEngine();
    alertEngine.detectAnomalies([failureEvent, { ...failureEvent, eventId: 'EVT-EXEC-FAIL-02' }]);

    const alerts = alertEngine.getAlerts();
    const alertId = alerts[0].alertId;

    // Automated resolution attempt (authorizedByHuman: false) -> MUST FAIL
    expect(() =>
      alertEngine.updateAlertStatus(alertId, 'RESOLVED', false)
    ).toThrow(/Automated transition of Alert .* to 'RESOLVED' is forbidden/);

    // Human authorized resolution -> SUCCESS
    const resolvedAlert = alertEngine.updateAlertStatus(alertId, 'RESOLVED', true);
    expect(resolvedAlert.status).toBe('RESOLVED');
  });

  // Scenario 6: Rejection of Runtime Modification Requests from Observability Layer (Observe-Only Rule)
  it('should enforce Observe-Only rule and reject any execution/task modification from Observability', () => {
    const engine = new EmployeeObservabilityEngine();
    engine.recordEvent(sampleEvent);

    // Dashboard Overview Data is strictly read-only
    const overview = engine.getDashboardOverview();
    expect(overview.totalEmployees).toBe(1);
    expect(overview.totalTasks).toBe(1);

    expect(() => {
      (overview as any).totalEmployees = 999;
    }).toThrow();
  });

  // Scenario 7: Observability Audit Logging Verification
  it('should maintain immutable audit log of all observations', () => {
    const engine = new EmployeeObservabilityEngine();
    const obs = engine.recordEvent(sampleEvent);

    const auditLogs = engine.getAuditLogs(obs.observationId);
    expect(auditLogs.length).toBe(1);
    expect(auditLogs[0].eventType).toBe('EXECUTION_EVENT');
    expect(auditLogs[0].employeeId).toBe('EMP-MIE03-01');
  });
});
