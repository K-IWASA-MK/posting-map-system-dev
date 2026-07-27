/**
 * ProjectRuntimePolicy defines the execution constraints for a project.
 * It specifies the execution environment boundaries when an AI Employee
 * operates within this project via ExecutionRuntime.
 */
export interface ProjectRuntimePolicy {
  /**
   * If true, requires the ExecutionRuntime to run within a secure sandbox.
   */
  readonly sandboxRequired: boolean;

  /**
   * Defines the paths that AI Employees are allowed to access.
   * e.g., ["./src", "./config"]
   */
  readonly allowedPaths: readonly string[];

  /**
   * Defines the specific execution permissions granted to the AI Employee.
   * e.g., ["read_file", "execute_command"]
   */
  readonly executionPermissions: readonly string[];
}
