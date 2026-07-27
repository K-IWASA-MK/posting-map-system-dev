import { ProjectManifest } from '../../../aios/projects/contracts/ProjectManifest';
import { ManifestValidator } from '../../../aios/projects/validation/ManifestValidator';

function runTest(name: string, testFn: () => void) {
  try {
    testFn();
    console.log(`[PASS] ${name}`);
  } catch (error) {
    console.error(`[FAIL] ${name}`);
    console.error(error);
    process.exit(1);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

const validManifest: ProjectManifest = {
  manifestVersion: "1.0",
  projectId: "test-project",
  projectName: "Test Project",
  version: "0.1.0",
  description: "A valid test project manifest",
  capabilities: ["CAP_TEST_1", "CAP_TEST_2"],
  runtimePolicy: {
    sandboxRequired: true,
    allowedPaths: ["./src", "./data"],
    executionPermissions: ["read_file", "write_file"]
  }
};

runTest("Manifest schema validation - Valid Manifest", () => {
  const result = ManifestValidator.validate(validManifest);
  assert(result.valid, "Valid manifest should pass validation");
  assert(result.errors.length === 0, "There should be no errors");
});

runTest("Invalid manifest rejection - Missing projectId", () => {
  const invalidManifest = { ...validManifest, projectId: "" };
  const result = ManifestValidator.validate(invalidManifest);
  assert(!result.valid, "Invalid manifest should fail validation");
  assert(result.errors.some(e => e.includes("projectId")), "Error should mention projectId");
});

runTest("Invalid manifest rejection - Missing capabilities array", () => {
  const invalidManifest = { ...validManifest, capabilities: "not-an-array" as any };
  const result = ManifestValidator.validate(invalidManifest);
  assert(!result.valid, "Invalid manifest should fail validation");
  assert(result.errors.some(e => e.includes("capabilities")), "Error should mention capabilities");
});

runTest("Invalid manifest rejection - Path traversal attempt", () => {
  const invalidManifest = { 
    ...validManifest, 
    runtimePolicy: {
      ...validManifest.runtimePolicy,
      allowedPaths: ["./src", "../secrets"]
    }
  };
  const result = ManifestValidator.validate(invalidManifest);
  assert(!result.valid, "Invalid manifest should fail validation due to path traversal");
  assert(result.errors.some(e => e.includes("Path traversal")), "Error should mention path traversal");
});

runTest("Invalid manifest rejection - Another path traversal attempt", () => {
  const invalidManifest = { 
    ...validManifest, 
    runtimePolicy: {
      ...validManifest.runtimePolicy,
      allowedPaths: ["..\\windows_secrets"]
    }
  };
  const result = ManifestValidator.validate(invalidManifest);
  assert(!result.valid, "Invalid manifest should fail validation due to path traversal");
});

console.log("\nAll project contract tests passed successfully.");
