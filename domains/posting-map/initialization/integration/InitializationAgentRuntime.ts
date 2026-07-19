import {
  InitializationRequest,
  InitializationEvent,
  InitializationEventType
} from "./contracts/DistrictInitializationIntegrationContract";
import { InitializationTask } from "./InitializationTask";
import { InitializationStateStore, InitializationExecutionLedger } from "./InitializationStateStore";
import { InitializationValidator } from "./InitializationValidator";
import { InitializationTaskPlanner } from "./InitializationTaskPlanner";
import { InitializationExecutor } from "./InitializationExecutor";

export class InitializationAgentRuntime {
  private readonly validator = new InitializationValidator();
  private readonly planner = new InitializationTaskPlanner();
  private readonly subscribers = new Set<(event: InitializationEvent) => void>();

  constructor(private readonly executor: InitializationExecutor) {}

  /**
   * Subscribes a listener to initialization integration events.
   */
  public subscribe(sub: (event: InitializationEvent) => void): () => void {
    this.subscribers.add(sub);
    return () => {
      this.subscribers.delete(sub);
    };
  }

  private emit(
    type: InitializationEventType,
    requestId: string,
    districtName: string,
    taskType?: string,
    error?: string
  ): void {
    const event: InitializationEvent = {
      type,
      requestId,
      districtName,
      timestamp: Date.now(),
      taskType,
      error
    };
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error("[InitializationAgentRuntime] Subscriber error:", err);
      }
    }
  }

  /**
   * Executes the E2E initialization workflow integration:
   * Registers/Resolves district, importing areas, creating dashboard, and generating map visualization.
   */
  public async execute(
    request: InitializationRequest,
    options: { baseDir: string }
  ): Promise<InitializationExecutionLedger> {
    // 1. Validation and Replay Attack Protection
    const validationResult = this.validator.validateRequest(request);
    if (!validationResult.success) {
      const errorMsg = validationResult.errors.join("; ");
      this.emit("INIT_FAILED", request.requestId, request.districtName, undefined, errorMsg);
      throw new Error(`Initialization validation failed: ${errorMsg}`);
    }

    // Lock request to prevent replay
    this.validator.registerProcessedId(request.requestId);

    const store = new InitializationStateStore(request.requestId, request.districtName, request.districtId);
    let tasks = this.planner.planTasks(request.requestId);

    this.emit("INIT_STARTED", request.requestId, request.districtName);

    const updateTaskStatus = (
      agentType: string,
      status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED",
      error?: string
    ) => {
      tasks = tasks.map((t) => (t.agentType === agentType ? { ...t, status, error } : t));
    };

    try {
      // --- STEP 1: District Master ---
      const masterTask = tasks.find((t) => t.agentType === "DISTRICT_MASTER")!;
      updateTaskStatus("DISTRICT_MASTER", "RUNNING");
      store.updateState("DATA_ACQUIRED", tasks);

      await this.executor.execute(masterTask, request, options.baseDir);
      updateTaskStatus("DISTRICT_MASTER", "COMPLETED");
      store.updateState("MASTER_READY", tasks);
      this.emit("INIT_TASK_COMPLETED", request.requestId, request.districtName, "DISTRICT_MASTER");

      // --- STEP 2: Area Generation & Election Data (Parallel Execution) ---
      const areaTask = tasks.find((t) => t.agentType === "AREA_GENERATION")!;
      const electionTask = tasks.find((t) => t.agentType === "ELECTION_DATA")!;

      updateTaskStatus("AREA_GENERATION", "RUNNING");
      updateTaskStatus("ELECTION_DATA", "RUNNING");

      await Promise.all([
        (async () => {
          await this.executor.execute(areaTask, request, options.baseDir);
          updateTaskStatus("AREA_GENERATION", "COMPLETED");
          this.emit("INIT_TASK_COMPLETED", request.requestId, request.districtName, "AREA_GENERATION");
        })(),
        (async () => {
          await this.executor.execute(electionTask, request, options.baseDir);
          updateTaskStatus("ELECTION_DATA", "COMPLETED");
          this.emit("INIT_TASK_COMPLETED", request.requestId, request.districtName, "ELECTION_DATA");
        })()
      ]);

      store.updateState("AREA_READY", tasks);
      store.updateState("ELECTION_READY", tasks);

      // --- STEP 3: Dashboard ---
      const dashboardTask = tasks.find((t) => t.agentType === "DASHBOARD")!;
      updateTaskStatus("DASHBOARD", "RUNNING");
      await this.executor.execute(dashboardTask, request, options.baseDir);
      updateTaskStatus("DASHBOARD", "COMPLETED");
      store.updateState("DASHBOARD_READY", tasks);
      this.emit("INIT_TASK_COMPLETED", request.requestId, request.districtName, "DASHBOARD");

      // --- STEP 4: Visualization ---
      const visualizationTask = tasks.find((t) => t.agentType === "VISUALIZATION")!;
      updateTaskStatus("VISUALIZATION", "RUNNING");
      await this.executor.execute(visualizationTask, request, options.baseDir);
      updateTaskStatus("VISUALIZATION", "COMPLETED");
      store.updateState("VISUALIZATION_READY", tasks);
      this.emit("INIT_TASK_COMPLETED", request.requestId, request.districtName, "VISUALIZATION");

      // --- STEP 5: Completed ---
      const finalLedger = store.updateState("COMPLETED", tasks);
      this.emit("INIT_SUCCESS", request.requestId, request.districtName);
      return finalLedger;
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      // Fail currently running tasks
      tasks = tasks.map((t) => (t.status === "RUNNING" ? { ...t, status: "FAILED", error: errorMsg } : t));
      store.updateState("FAILED", tasks);
      this.emit("INIT_FAILED", request.requestId, request.districtName, undefined, errorMsg);
      throw err;
    }
  }

  public getValidator(): InitializationValidator {
    return this.validator;
  }
}
