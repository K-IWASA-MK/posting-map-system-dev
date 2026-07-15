import { NotificationTask } from '../services/NotificationQueue';

export type NotificationState = 'PENDING' | 'QUEUED' | 'SENDING' | 'DELIVERED' | 'FAILED';

export class NotificationStateMachine {
    private stateMap: Map<string, NotificationState> = new Map();

    public updateState(taskId: string, state: NotificationState): void {
        this.stateMap.set(taskId, state);
    }

    public getState(taskId: string): NotificationState | undefined {
        return this.stateMap.get(taskId);
    }
}
