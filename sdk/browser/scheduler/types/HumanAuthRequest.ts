import { AuthenticationProvider } from './AuthenticationProvider';
import { ResumeStrategy } from './ResumePolicy';

export type HumanAuthStatus = 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export interface HumanAuthRequest {
  requestId: string;
  agentId: string;
  taskId: string;
  reason: string;
  provider: AuthenticationProvider;
  requiredAction: string; // e.g. "LINE QR Code Login required for CEO"
  status: HumanAuthStatus;
  createdAt: number;
  expiresAt: number;
  completedAt?: number;
  resumeStrategy: ResumeStrategy;
}
