import { QueueSnapshot } from "./QueueSnapshot";

export interface QueueDepthObserver {
  getSnapshot(): QueueSnapshot;
}

export interface DependencyGraphObserver {
  getGraph(): any;
}

export interface ThroughputObserver {
  getThroughput(): number;
}

export interface SchedulingObservability {
  readonly queue: QueueDepthObserver;
  readonly dependencies: DependencyGraphObserver;
  readonly throughput: ThroughputObserver;
}
