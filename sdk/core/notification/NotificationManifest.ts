export interface NotificationManifest {
    id: string;
    version: string;
    name: string;
    description: string;
    capabilities: string[];
    defaultChannels: string[];
}
