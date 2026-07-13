import { NotificationRule } from './NotificationRule';

export class NotificationRegistry {
    private rules: Map<string, NotificationRule> = new Map();
    private destinations: Map<string, any> = new Map();

    public registerRule(rule: NotificationRule): void {
        this.rules.set(rule.ruleId, rule);
    }

    public getRulesForEvent(eventType: string): NotificationRule[] {
        const matched: NotificationRule[] = [];
        for (const rule of this.rules.values()) {
            if (rule.eventType === '*' || rule.eventType === eventType) {
                matched.push(rule);
            }
        }
        return matched;
    }

    public registerDestination(channel: string, config: any): void {
        this.destinations.set(channel, config);
    }

    public getDestination(channel: string): any {
        return this.destinations.get(channel);
    }
}
