import { PlatformExecutionContext } from './PlatformExecutionContext';
import { PlatformStage } from './PlatformStage';
import { MonitoringPipeline } from '@foundation/monitoring/MonitoringPipeline';

export class PlatformLifecycleObserver {
  private static readonly pipeline = MonitoringPipeline.getInstance();

  public static onPlatformStarted(context: PlatformExecutionContext): void {
    PlatformLifecycleObserver.pipeline.resetSequence();
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_STARTED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { startedAt: context.startedAt }
    );
  }

  public static onStageStarted(context: PlatformExecutionContext, stage: PlatformStage): void {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'STAGE_STARTED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { stage }
    );
  }

  public static onStageCompleted(context: PlatformExecutionContext, stage: PlatformStage, durationMs: number): void {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'STAGE_COMPLETED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { stage, durationMs }
    );
  }

  public static onPlatformCompleted(context: PlatformExecutionContext, durationMs: number): void {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_COMPLETED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      { durationMs, status: context.status }
    );
  }

  public static onPlatformFailed(context: PlatformExecutionContext, error: Error, failedStage: PlatformStage): void {
    PlatformLifecycleObserver.pipeline.createAndDispatch(
      'PLATFORM_FAILED',
      'LIFECYCLE',
      context.requestId,
      'PLATFORM_INTEGRATION_PIPELINE',
      {
        failedStage,
        errorMessage: error.message || String(error)
      }
    );
  }
}
