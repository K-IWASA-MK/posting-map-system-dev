/**
 * AIOS Employee Observability Foundation
 * Integrated Observability Engine Implementation
 */

import { EventCollector } from './EventCollector';
import { ObservabilityAlertEngine } from './ObservabilityAlertEngine';
import { ObservabilityMetricEngine } from './ObservabilityMetricEngine';
import {
  IDashboardDataProvider,
  IEmployeeObservabilityEngine,
} from './contract/IEmployeeObservability';
import {
  AlertRecord,
  DashboardOverviewData,
  MetricRecord,
  ObservationRecord,
  RuntimeEvent,
  StateSnapshot,
} from './models/EmployeeObservabilityModels';

export class EmployeeObservabilityEngine
  implements IEmployeeObservabilityEngine, IDashboardDataProvider
{
  private collector = new EventCollector();
  private metricEngine = new ObservabilityMetricEngine();
  private alertEngine = new ObservabilityAlertEngine();
  private snapshots: Map<string, StateSnapshot> = new Map();

  public recordEvent(event: RuntimeEvent): ObservationRecord {
    const observation = this.collector.collectEvent(event);

    // Trigger anomaly detection on event stream
    const events = this.collector.getEvents();
    this.alertEngine.detectAnomalies(events);

    return observation;
  }

  public createSnapshot(employeeId: string): StateSnapshot {
    const events = this.collector.getEvents();
    const empEvents = events.filter((e) => e.payload && e.payload.employeeId === employeeId);

    const lastTask = empEvents.reverse().find((e) => e.payload.taskId)?.payload.taskId || null;
    const lastExec = empEvents.find((e) => e.payload.status)?.payload.status || null;
    const lastResult = empEvents.find((e) => e.payload.resultId)?.payload.resultId || null;
    const kCount = events.filter(
      (e) => e.eventType === 'KNOWLEDGE_ACCESS_EVENT' && e.payload.employeeId === employeeId
    ).length;

    const snapshotId = `SNP-${employeeId}-${Date.now()}`;
    const snapshot: StateSnapshot = Object.freeze({
      snapshotId: snapshotId,
      employeeId: employeeId,
      employeeStatus: 'ACTIVE',
      currentTaskId: lastTask,
      executionStatus: lastExec,
      lastResultStatus: lastResult,
      knowledgeAccessCount: kCount,
      timestamp: new Date().toISOString(),
    });

    this.snapshots.set(employeeId, snapshot);
    return snapshot;
  }

  public getMetrics(): MetricRecord[] {
    const events = this.collector.getEvents();
    return [
      this.metricEngine.calculateSuccessRate(events),
      this.metricEngine.calculateAverageExecutionTime(events),
      this.metricEngine.calculateVerificationRate(events),
    ];
  }

  public getAlerts(): AlertRecord[] {
    return this.alertEngine.getAlerts();
  }

  public getDashboardOverview(): DashboardOverviewData {
    return this.getOverviewData();
  }

  public getOverviewData(): DashboardOverviewData {
    const events = this.collector.getEvents();

    const employees = new Set(events.map((e) => e.payload.employeeId).filter(Boolean));
    const tasks = new Set(events.map((e) => e.payload.taskId).filter(Boolean));
    const execs = events.filter((e) => e.eventType === 'EXECUTION_EVENT');
    const results = events.filter((e) => e.eventType === 'RESULT_EVENT' && e.payload.status === 'VERIFIED');
    const knowledges = events.filter((e) => e.eventType === 'KNOWLEDGE_ACCESS_EVENT');

    return Object.freeze({
      totalEmployees: employees.size,
      totalTasks: tasks.size,
      activeExecutions: execs.length,
      verifiedResults: results.length,
      totalKnowledgeReferences: knowledges.length,
      generatedAt: new Date().toISOString(),
    });
  }

  public getEmployeeSnapshot(employeeId: string): StateSnapshot {
    const snp = this.snapshots.get(employeeId);
    if (!snp) {
      return this.createSnapshot(employeeId);
    }
    return snp;
  }

  public getAuditLogs(observationId?: string): ObservationRecord[] {
    const obs = this.collector.getObservations();
    if (observationId) {
      return obs.filter((o) => o.observationId === observationId);
    }
    return obs;
  }
}
