/**
 * AIOS Employee Observability Foundation
 * Observability Metric Engine Implementation
 */

import { IMetricEngine } from './contract/IEmployeeObservability';
import { MetricRecord, RuntimeEvent } from './models/EmployeeObservabilityModels';

export class ObservabilityMetricEngine implements IMetricEngine {
  public calculateSuccessRate(events: RuntimeEvent[]): MetricRecord {
    const execEvents = events.filter((e) => e.eventType === 'EXECUTION_EVENT');
    if (execEvents.length === 0) {
      return Object.freeze({
        metricId: `MET-SR-${Date.now()}`,
        metricName: 'EXECUTION_SUCCESS_RATE',
        value: 100.0,
        unit: 'PERCENT',
        timestamp: new Date().toISOString(),
      });
    }

    const successes = execEvents.filter((e) => e.payload.status === 'COMPLETED' || e.payload.resultStatus === 'SUCCESS');
    const rate = (successes.length / execEvents.length) * 100.0;

    return Object.freeze({
      metricId: `MET-SR-${Date.now()}`,
      metricName: 'EXECUTION_SUCCESS_RATE',
      value: Math.round(rate * 100) / 100,
      unit: 'PERCENT',
      timestamp: new Date().toISOString(),
    });
  }

  public calculateAverageExecutionTime(events: RuntimeEvent[]): MetricRecord {
    const execEvents = events.filter(
      (e) => e.eventType === 'EXECUTION_EVENT' && typeof e.payload.durationMs === 'number'
    );
    if (execEvents.length === 0) {
      return Object.freeze({
        metricId: `MET-AET-${Date.now()}`,
        metricName: 'AVERAGE_EXECUTION_TIME',
        value: 0,
        unit: 'MILLISECONDS',
        timestamp: new Date().toISOString(),
      });
    }

    const totalDuration = execEvents.reduce((acc, e) => acc + (e.payload.durationMs || 0), 0);
    const avg = totalDuration / execEvents.length;

    return Object.freeze({
      metricId: `MET-AET-${Date.now()}`,
      metricName: 'AVERAGE_EXECUTION_TIME',
      value: Math.round(avg * 100) / 100,
      unit: 'MILLISECONDS',
      timestamp: new Date().toISOString(),
    });
  }

  public calculateVerificationRate(events: RuntimeEvent[]): MetricRecord {
    const resultEvents = events.filter((e) => e.eventType === 'RESULT_EVENT');
    if (resultEvents.length === 0) {
      return Object.freeze({
        metricId: `MET-VR-${Date.now()}`,
        metricName: 'RESULT_VERIFICATION_RATE',
        value: 100.0,
        unit: 'PERCENT',
        timestamp: new Date().toISOString(),
      });
    }

    const verified = resultEvents.filter((e) => e.payload.status === 'VERIFIED');
    const rate = (verified.length / resultEvents.length) * 100.0;

    return Object.freeze({
      metricId: `MET-VR-${Date.now()}`,
      metricName: 'RESULT_VERIFICATION_RATE',
      value: Math.round(rate * 100) / 100,
      unit: 'PERCENT',
      timestamp: new Date().toISOString(),
    });
  }
}
