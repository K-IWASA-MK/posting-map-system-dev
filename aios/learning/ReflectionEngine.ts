import { WorkforceExecutionResult } from '../execution/WorkforceExecutionTypes';
import { StructuredReflection, PersonalLesson } from './ReflectionTypes';
import { AgentPersonalMemory } from '../workforce/memory/AgentPersonalMemory';

export class ReflectionEngine {
  private readonly memoryStore: Map<string, AgentPersonalMemory> = new Map();

  /**
   * Retrieves or initializes an AgentPersonalMemory.
   */
  public getOrCreateMemory(employeeId: string): AgentPersonalMemory {
    const existing = this.memoryStore.get(employeeId);
    if (existing) {
      return existing;
    }
    const initial: AgentPersonalMemory = {
      employeeId,
      memoryVersion: 1,
      totalCompletedTasks: 0,
      successCount: 0,
      domainTaskCounts: {},
      lessons: [],
      lastActiveAt: Date.now()
    };
    this.memoryStore.set(employeeId, initial);
    return initial;
  }

  /**
   * Async Event Listener: Triggered asynchronously upon Task Execution completion.
   * Analyzes ExecutionEvents, formulates 4-stage StructuredReflection, and updates AgentPersonalMemory.
   */
  public async onExecutionCompleted(result: WorkforceExecutionResult): Promise<PersonalLesson> {
    const memory = this.getOrCreateMemory(result.employeeId);

    // 1. Analyze 4-stage Structured Reflection
    let observation = `Task executed with status ${result.status} across ${result.stepResults.length} steps.`;
    let cause = "Normal execution within expected parameters.";
    let pattern = "Standard execution flow.";
    let futureRule = "Maintain standard execution procedure.";
    let category: "SUCCESS_PATTERN" | "FAILURE_RECOVERY" | "CONFIG_GOTCHA" = "SUCCESS_PATTERN";
    let confidence = 0.90;

    if (result.violationsCount > 0) {
      const violationEvents = result.events.filter(e => e.eventType === "SANDBOX_VIOLATION");
      const violationPayload = violationEvents[0]?.payload || {};
      observation = `Sandbox violation detected on path '${violationPayload.path || "restricted"}' during execution.`;
      cause = `Execution runtime policy denied unauthorized access: ${violationPayload.reason || "Policy restriction"}.`;
      pattern = "Sandbox boundary path restriction pattern in project context.";
      futureRule = `Verify allowedPaths in project manifest before referencing paths outside allowed boundaries.`;
      category = "CONFIG_GOTCHA";
      confidence = 0.85;
    } else if (result.status === "FAILED" || result.status === "INTERCEPTED") {
      observation = `Execution halted with status ${result.status}.`;
      cause = "Execution step failure or security interception.";
      pattern = "Execution boundary interception pattern.";
      futureRule = "Require pre-validation of permissions and environment prior to execution.";
      category = "FAILURE_RECOVERY";
      confidence = 0.80;
    } else if (result.projectId === "posting-map") {
      observation = "LIFF and GAS authentication check completed on posting-map.";
      cause = "LIFF authentication endpoint URL and GAS quota verified successfully.";
      pattern = "LIFF + GAS integration pattern on posting-map domain.";
      futureRule = "Pre-verify AppScript execution quotas when conducting LIFF authentication checks.";
      category = "SUCCESS_PATTERN";
      confidence = 0.92;
    }

    const reflectionId = `REFL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const reflection: StructuredReflection = {
      reflectionId,
      executionId: result.executionId,
      taskId: result.taskId,
      employeeId: result.employeeId,
      projectId: result.projectId,
      observation,
      cause,
      pattern,
      futureRule,
      confidence
    };

    // 2. Check for existing similar lessons to increment evidenceCount and update task IDs
    const existingLessonIndex = memory.lessons.findIndex(l => l.reflection.futureRule === futureRule);
    let updatedLesson: PersonalLesson;

    const currentLessons = [...memory.lessons];
    if (existingLessonIndex >= 0) {
      const existing = currentLessons[existingLessonIndex];
      const updatedTaskIds = Array.from(new Set([...existing.evidenceTaskIds, result.taskId]));
      updatedLesson = {
        ...existing,
        reflection,
        evidenceTaskIds: updatedTaskIds,
        evidenceCount: existing.evidenceCount + 1,
        confidence: Math.min(existing.confidence + 0.05, 1.0),
        timestamp: Date.now()
      };
      currentLessons[existingLessonIndex] = updatedLesson;
    } else {
      updatedLesson = {
        lessonId: `LES-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category,
        reflection,
        evidenceTaskIds: [result.taskId],
        evidenceCount: 1,
        confidence,
        timestamp: Date.now()
      };
      currentLessons.push(updatedLesson);
    }

    // 3. Update AgentPersonalMemory
    const domainCounts = { ...memory.domainTaskCounts };
    domainCounts[result.projectId] = (domainCounts[result.projectId] || 0) + 1;

    const updatedMemory: AgentPersonalMemory = {
      ...memory,
      totalCompletedTasks: memory.totalCompletedTasks + 1,
      successCount: result.status === "COMPLETED" ? memory.successCount + 1 : memory.successCount,
      domainTaskCounts: domainCounts,
      lessons: currentLessons,
      lastActiveAt: Date.now()
    };

    this.memoryStore.set(result.employeeId, updatedMemory);
    return updatedLesson;
  }
}
