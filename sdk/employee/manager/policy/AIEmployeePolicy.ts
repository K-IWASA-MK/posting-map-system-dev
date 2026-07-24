export interface AIEmployeePolicy {
  maxConcurrentTasks: number;
  maxBrowserSessions: number;
  allowBackgroundTasks: boolean;
  allowHumanAuth: boolean;
}

export class DefaultAIEmployeePolicy implements AIEmployeePolicy {
  maxConcurrentTasks = 1;
  maxBrowserSessions = 1;
  allowBackgroundTasks = true;
  allowHumanAuth = true;
}
