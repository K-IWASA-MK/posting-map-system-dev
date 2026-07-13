export interface NotificationRule {
    ruleId: string;
    eventType: string;       // e.g., 'DeploymentCompleted' or '*'
    severity?: string;       // e.g., 'INFO', 'WARN', 'CRITICAL'
    targetChannels: string[];// e.g., ['Slack', 'LINE']
    condition?: string;      // Custom condition string evaluating to boolean (optional)
}
