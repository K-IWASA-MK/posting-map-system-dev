import { BrowserTaskState } from './BrowserTaskState';
import { LockScope } from './LockScope';
import { RetryPolicy } from './RetryPolicy';

export interface BrowserTask {
  id: string;
  agentId: string;
  priority: 'HIGH' | 'NORMAL' | 'BACKGROUND';
  scope: LockScope;
  targetKey: string; // e.g. "page:/manager" or "global"
  action: (runtime: any) => Promise<any>;
  state: BrowserTaskState;
  enqueuedAt: number;
  agingScore: number;
  retryPolicy: RetryPolicy;
  attemptsCount: number;
  error?: string;
  result?: any;
}
