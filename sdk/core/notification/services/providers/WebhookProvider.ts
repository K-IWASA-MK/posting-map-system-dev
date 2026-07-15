import { INotificationProvider } from './INotificationProvider';

export class WebhookProvider implements INotificationProvider {
    name = 'WebhookProvider';
    capabilities = ['CAN_SEND_JSON'];

    public async send(destination: string, payload: any): Promise<boolean> {
        console.log(`[WebhookProvider] Sending POST request to ${destination}`);
        try {
            // Simulated HTTP POST
            // const response = await fetch(destination, { method: 'POST', body: JSON.stringify(payload) });
            // return response.ok;
            return true;
        } catch (error) {
            console.error(`[WebhookProvider] Error sending to ${destination}`, error);
            return false;
        }
    }
}
