export class TimeoutManagementService {
    public checkTimeout(startTime: string, timeoutMs: number): boolean {
        const start = new Date(startTime).getTime();
        const now = Date.now();
        return (now - start) > timeoutMs;
    }
}
