export interface INotificationProvider {
    name: string;
    capabilities: string[]; // e.g. CAN_SEND_MARKDOWN, CAN_SEND_IMAGE, CAN_SEND_FILE, CAN_SEND_THREAD, CAN_SEND_REPLY

    send(destination: string, payload: any): Promise<boolean>;
}
