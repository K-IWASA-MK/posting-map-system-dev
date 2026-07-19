import { ScalingPolicy as ScalingPolicyModel, ScalingDecisionReason } from '../models/OrchestrationModels';
import { SystemMetrics } from './ResourceMonitor';

export interface ScalingEvaluationResult {
  action: 'SCALE_OUT' | 'SCALE_IN' | 'NO_OP';
  reason: ScalingDecisionReason;
  details: string;
}

export class ScalingPolicyEvaluator {
  public static evaluate(
    policy: ScalingPolicyModel,
    metrics: SystemMetrics,
    queueDepth: number
  ): ScalingEvaluationResult {
    // Check GPU threshold first if applicable
    if (metrics.gpuUsage > 85) {
      return {
        action: 'SCALE_OUT',
        reason: ScalingDecisionReason.GPU_THRESHOLD,
        details: `GPU usage (${metrics.gpuUsage}%) exceeded 85%`
      };
    }

    // Check queue threshold
    if (queueDepth > policy.queueThreshold) {
      return {
        action: 'SCALE_OUT',
        reason: ScalingDecisionReason.QUEUE_DEPTH,
        details: `Queue depth (${queueDepth}) exceeded limit of ${policy.queueThreshold}`
      };
    }

    // Check CPU threshold
    if (metrics.cpuUsage > policy.cpuThreshold) {
      return {
        action: 'SCALE_OUT',
        reason: ScalingDecisionReason.CPU_THRESHOLD,
        details: `CPU usage (${metrics.cpuUsage}%) exceeded threshold of ${policy.cpuThreshold}%`
      };
    }

    // Check Memory threshold
    if (metrics.memoryUsage > policy.memoryThreshold) {
      return {
        action: 'SCALE_OUT',
        reason: ScalingDecisionReason.MEMORY_THRESHOLD,
        details: `Memory usage (${metrics.memoryUsage}%) exceeded threshold of ${policy.memoryThreshold}%`
      };
    }

    // Check Scale-In conditions
    if (metrics.cpuUsage < policy.cpuThreshold / 2 && queueDepth === 0) {
      return {
        action: 'SCALE_IN',
        reason: ScalingDecisionReason.CPU_THRESHOLD,
        details: `CPU usage (${metrics.cpuUsage}%) is below half of threshold, and Queue is empty`
      };
    }

    return {
      action: 'NO_OP',
      reason: ScalingDecisionReason.MANUAL_REQUEST,
      details: 'Metrics within normal bounds'
    };
  }
}
