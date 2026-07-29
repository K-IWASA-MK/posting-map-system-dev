export interface NotificationRequest {
  channel: string;       // e.g., 'LINE', 'EMAIL'
  eventType: string;     // e.g., 'TASK_COMPLETED_NOTIFICATION', 'TASK_FAILED_NOTIFICATION'
  recipient: string;     // e.g., userId or group ID
  payload: unknown;      // The actual content to send
}
