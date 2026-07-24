import { HumanAuthRequest } from '../types/HumanAuthRequest';
import { AuthenticationProvider } from '../types/AuthenticationProvider';
import { ResumeStrategy } from '../types/ResumePolicy';
import { NotificationChannel, ConsoleNotificationChannel } from '../notification/NotificationChannel';

export class HumanAuthBoundaryManager {
  private activeRequests: Map<string, HumanAuthRequest> = new Map();
  private notificationChannel: NotificationChannel = new ConsoleNotificationChannel();

  public async createAuthRequest(
    agentId: string,
    taskId: string,
    reason: string,
    provider: AuthenticationProvider,
    requiredAction: string,
    resumeStrategy: ResumeStrategy = ResumeStrategy.RESUME_FROM_WAIT
  ): Promise<HumanAuthRequest> {
    const requestId = `auth-req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const request: HumanAuthRequest = {
      requestId,
      agentId,
      taskId,
      reason,
      provider,
      requiredAction,
      status: 'PENDING',
      createdAt: now,
      expiresAt: now + 86400000, // 24h
      resumeStrategy
    };

    this.activeRequests.set(requestId, request);
    await this.notificationChannel.sendAuthRequestNotification(request);

    return request;
  }

  public async completeAuthRequest(requestId: string): Promise<HumanAuthRequest | null> {
    const request = this.activeRequests.get(requestId);
    if (request && request.status === 'PENDING') {
      request.status = 'COMPLETED';
      request.completedAt = Date.now();
      await this.notificationChannel.sendAuthCompletedNotification(request);
      return request;
    }
    return null;
  }

  public getPendingRequests(): HumanAuthRequest[] {
    return Array.from(this.activeRequests.values()).filter(r => r.status === 'PENDING');
  }

  public getRequest(requestId: string): HumanAuthRequest | undefined {
    return this.activeRequests.get(requestId);
  }
}
