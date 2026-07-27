import * as path from 'path';
import * as fs from 'fs';
import { ProjectRegistry } from '../../../aios/projects/registry/ProjectRegistry';
import { ManifestLoader } from '../../../aios/projects/manifest/ManifestLoader';
import { ProjectDescriptor } from '../../../aios/projects/contracts/ProjectDescriptor';

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

const mockManifestContentGIS = JSON.stringify({
  manifestVersion: "1.0",
  projectId: "posting-map",
  projectName: "Posting Map System",
  version: "1.0.0",
  description: "Field operations and GIS mapping system",
  capabilities: ["GIS", "LIFF", "GAS"],
  runtimePolicy: {
    sandboxRequired: true,
    allowedPaths: ["./src"],
    executionPermissions: ["read_file"]
  }
});

const mockManifestContentMedia = JSON.stringify({
  manifestVersion: "1.0",
  projectId: "80s-disco",
  projectName: "80s Disco Media Database",
  version: "0.5.0",
  description: "Music curation and media database",
  capabilities: ["DATABASE", "MEDIA_CURATION"],
  runtimePolicy: {
    sandboxRequired: true,
    allowedPaths: ["./media"],
    executionPermissions: ["read_file"]
  }
});

const mockInvalidManifestContent = JSON.stringify({
  manifestVersion: "1.0",
  projectId: "invalid-proj",
  // Missing projectName and capabilities
  runtimePolicy: {
    sandboxRequired: true,
    allowedPaths: ["../traversal_attempt"], // Path traversal error
    executionPermissions: []
  }
});

// Setup temporary mock directory for registry loading tests
const tempDir = path.resolve(__dirname, '../../../scratch/test_registry_tmp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const manifestPathGIS = path.join(tempDir, 'posting-map.json');
const manifestPathMedia = path.join(tempDir, '80s-disco.json');
const manifestPathInvalid = path.join(tempDir, 'invalid.json');
const registryFilePath = path.join(tempDir, 'registry.json');

fs.writeFileSync(manifestPathGIS, mockManifestContentGIS);
fs.writeFileSync(manifestPathMedia, mockManifestContentMedia);
fs.writeFileSync(manifestPathInvalid, mockInvalidManifestContent);

fs.writeFileSync(registryFilePath, JSON.stringify({
  projects: [
    { projectId: "posting-map", manifestPath: manifestPathGIS },
    { projectId: "80s-disco", manifestPath: manifestPathMedia },
    { projectId: "invalid-proj", manifestPath: manifestPathInvalid }
  ]
}));

try {
  // Case 1: 正常登録 & Resolve
  runTest("Case 1: Normal Load & Resolve", () => {
    const registry = new ProjectRegistry();
    const result = ManifestLoader.loadFromFile(manifestPathGIS);
    assert(result.success, "Manifest loading should succeed for valid file");
    assert(result.descriptor !== undefined, "Descriptor should be generated");

    registry.register(result.descriptor!);
    const resolved = registry.resolve("posting-map");
    assert(resolved !== undefined, "Project 'posting-map' should be resolved");
    assert(resolved?.manifest.projectName === "Posting Map System", "Project name should match");
  });

  // Case 2: Project 検索 (findByCapability)
  runTest("Case 2: Capability Search (findByCapability)", () => {
    const registry = new ProjectRegistry();
    const loadResult1 = ManifestLoader.loadFromFile(manifestPathGIS);
    const loadResult2 = ManifestLoader.loadFromFile(manifestPathMedia);

    registry.register(loadResult1.descriptor!);
    registry.register(loadResult2.descriptor!);

    const gisProjects = registry.findByCapability("GIS");
    assert(gisProjects.length === 1, "Exactly one GIS project should be found");
    assert(gisProjects[0].manifest.projectId === "posting-map", "Found project should be 'posting-map'");

    const mediaProjects = registry.findByCapability("MEDIA_CURATION");
    assert(mediaProjects.length === 1, "Exactly one MEDIA_CURATION project should be found");
    assert(mediaProjects[0].manifest.projectId === "80s-disco", "Found project should be '80s-disco'");

    const unknownCapProjects = registry.findByCapability("QUANTUM_COMPUTING");
    assert(unknownCapProjects.length === 0, "No projects should be found for unknown capability");
  });

  // Case 3: 存在しない Project
  runTest("Case 3: Resolve Unknown Project", () => {
    const registry = new ProjectRegistry();
    const resolved = registry.resolve("non-existent-project");
    assert(resolved === undefined, "Resolving unknown project must return undefined without throwing");
  });

  // Case 4: Invalid Manifest の拒否
  runTest("Case 4: Invalid Manifest Rejection", () => {
    const registry = new ProjectRegistry();
    const result = ManifestLoader.loadFromFile(manifestPathInvalid);
    assert(!result.success, "Loading invalid manifest must return success: false");
    assert(result.errorReason === "MANIFEST_VALIDATION_FAILED", "Error reason must be MANIFEST_VALIDATION_FAILED");
    assert(Boolean(result.validationErrors && result.validationErrors.length > 0), "Validation errors should be provided");

    // Ensure it is NOT registered in the registry
    if (result.descriptor) {
      registry.register(result.descriptor);
    }
    assert(registry.resolve("invalid-proj") === undefined, "Invalid project must not be resolved in registry");
  });

  // Case 5: Load from Registry File
  runTest("Case 5: Load from Registry File (Batch Integration)", () => {
    const registry = new ProjectRegistry();
    const results = ManifestLoader.loadFromRegistryFile(registryFilePath, registry);

    assert(results.length === 3, "Results array should contain 3 entries");
    assert(registry.list().length === 2, "Only 2 valid projects should be registered");
    assert(registry.resolve("posting-map") !== undefined, "posting-map should be registered");
    assert(registry.resolve("80s-disco") !== undefined, "80s-disco should be registered");
    assert(registry.resolve("invalid-proj") === undefined, "invalid-proj should be rejected");
  });

  console.log("\nAll ProjectRegistry and ManifestLoader tests passed successfully.");
} finally {
  // Cleanup temporary mock files
  fs.rmSync(tempDir, { recursive: true, force: true });
}
