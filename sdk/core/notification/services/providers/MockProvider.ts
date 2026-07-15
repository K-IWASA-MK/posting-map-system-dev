import { INotificationProvider } from './INotificationProvider';

export class MockProvider implements INotificationProvider {
    name = 'MockProvider';
    capabilities = ['CAN_SEND_MARKDOWN', 'CAN_SEND_TEXT'];

    public async send(destination: string, payload: any): Promise<boolean> {
        console.log(`[MockProvider] Sending to ${destination}:`, payload);
        return true;
    }
}
