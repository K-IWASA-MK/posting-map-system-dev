import { OrchestrationSession } from './OrchestrationSession';
import { JobSchedule } from './models/JobSchedule';
import { RuntimeLock } from './models/RuntimeLock';

export class OrchestrationRegistry {
    private sessions: Map<string, OrchestrationSession> = new Map();
    private schedules: Map<string, JobSchedule> = new Map();
    private locks: Map<string, RuntimeLock> = new Map();

    public registerSession(session: OrchestrationSession) {
        this.sessions.set(session.sessionId, session);
    }
    public getSession(sessionId: string) {
        return this.sessions.get(sessionId);
    }

    public registerSchedule(schedule: JobSchedule) {
        this.schedules.set(schedule.jobId, schedule);
    }

    public registerLock(lock: RuntimeLock) {
        this.locks.set(lock.lockOwner, lock);
    }
    public getLock(jobId: string) {
        return this.locks.get(jobId);
    }
}
