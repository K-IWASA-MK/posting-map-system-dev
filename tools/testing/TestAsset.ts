/**
 * TestAsset represents a registered executable test asset with metadata and dependencies.
 */
export interface TestAsset {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly module: string; // Path relative to workspace root (e.g., "tests/unit/typescript/test_service_runtime.ts")
  readonly category: string;
  readonly tags: string[];
  readonly capabilities: string[];
  readonly timeout: number;
  readonly enabled: boolean;
  readonly isLegacy?: boolean;

  // ASP-006: Dependency Graph & Scheduling
  readonly dependsOn?: string[]; // Test IDs that this test depends on (must execute before this test)
  readonly priority?: number;    // Execution tie-breaker priority (lower numbers execute first)
}
