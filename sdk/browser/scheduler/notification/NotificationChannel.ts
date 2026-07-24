import { HumanAuthRequest } from '../types/HumanAuthRequest';

export interface NotificationChannel {
  sendAuthRequestNotification(request: HumanAuthRequest): Promise<boolean>;
  sendAuthCompletedNotification(request: HumanAuthRequest): Promise<boolean>;
}

export class ConsoleNotificationChannel implements NotificationChannel {
  public async sendAuthRequestNotification(request: HumanAuthRequest): Promise<boolean> {
    console.log(`[CEO Notification] Human Auth Required! Provider: ${request.provider}, Action: ${request.requiredAction}`);
    return true;
  }

  public async sendAuthCompletedNotification(request: HumanAuthRequest): Promise<boolean> {
    console.log(`[CEO Notification] Human Auth Completed for Request '${request.requestId}'. Resuming task...`);
    return true;
  }
}
