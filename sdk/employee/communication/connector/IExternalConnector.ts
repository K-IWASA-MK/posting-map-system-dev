import { AIMessage } from '../types/AIMessage';

export interface IExternalConnector {
  connectorId: string;
  connectorName: string;
  sendExternalNotification(message: AIMessage): Promise<boolean>;
}

export class SlackExternalConnector implements IExternalConnector {
  connectorId = 'slack-webhook-v1';
  connectorName = 'Slack External Connector';
  public async sendExternalNotification(message: AIMessage): Promise<boolean> {
    console.log(`[External Connector - Slack] Dispatching message '${message.identity.messageId}' to Slack...`);
    return true;
  }
}
