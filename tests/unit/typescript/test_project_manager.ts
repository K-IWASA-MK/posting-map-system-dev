import * as fs from 'fs';
import * as path from 'path';
import { ProjectDiscoveryResult } from '../../../core/project-discovery/ProjectDiscoveryResult';
import { ProjectManager } from '../../../core/project-manager/ProjectManager';
import { ProjectLifecycle } from '../../../core/project-manager/ProjectLifecycle';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const MOCK_WORKSPACE_ROOT = path.join(__dirname, 'mock_workspace_manager');
const MOCK_PROJECTS_DIR = path.join(MOCK_WORKSPACE_ROOT, 'projects');

function setupMockWorkspace(projectDirs: { id: string; files: string[] }[]) {
  teardownMockWorkspace();

  fs.mkdirSync(MOCK_WORKSPACE_ROOT, { recursive: true });
  fs.mkdirSync(MOCK_PROJECTS_DIR, { recursive: true });

  for (const proj of projectDirs) {
    const projPath = path.join(MOCK_PROJECTS_DIR, proj.id);
    fs.mkdirSync(projPath, { recursive: true });

    for (const file of proj.files) {
      fs.writeFileSync(path.join(projPath, file), 'mock content', 'utf-8');
    }
  }
}

function teardownMockWorkspace() {
  if (fs.existsSync(MOCK_WORKSPACE_ROOT)) {
    fs.rmSync(MOCK_WORKSPACE_ROOT, { recursive: true, force: true });
  }
}

// ==============================================================================
// Test 1: Manager Initialization and Filtering
// ==============================================================================
function testManagerInitialization() {
  console.log('[Test 1] ProjectManager initialization and query verification starting...');

  setupMockWorkspace([
    { id: 'posting-map', files: ['package.json', 'manifest.json', 'README.md'] },
    { id: 'hokusei-ch', files: ['package.json', 'manifest.json', 'README.md'] }
  ]);

  const mockDiscovery: ProjectDiscoveryResult = {
    success: true,
    count: 2,
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'production', description: 'Field OS', path: path.join(MOCK_PROJECTS_DIR, 'posting-map') },
      { id: 'hokusei-ch', name: 'Hokusei Channel', status: 'development', description: 'Local Community', path: path.join(MOCK_PROJECTS_DIR, 'hokusei-ch') }
    ],
    warnings: [],
    errors: []
  };

  try {
    const manager = new ProjectManager(mockDiscovery);
    const projects = manager.listProjects();

    assert(projects.length === 2, `Expected 2 managed projects, found ${projects.length}`);
    
    const prodProjects = manager.listProjectsByStatus('production');
    assert(prodProjects.length === 1, 'Expected 1 production project');
    assert(prodProjects[0].project.id === 'posting-map', 'Production project ID mismatch');

    const devProjects = manager.listProjectsByStatus('development');
    assert(devProjects.length === 1, 'Expected 1 development project');
    assert(devProjects[0].project.id === 'hokusei-ch', 'Development project ID mismatch');

    const singleProject = manager.getProject('posting-map');
    assert(singleProject !== undefined, 'Expected to retrieve posting-map project');
    assert(singleProject?.project.name === 'Posting Map', 'Project name mismatch');
    assert(singleProject?.validation.valid === true, 'Project validation should be valid');

    console.log('[Test 1] ProjectManager initialization and query verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 2: Filesystem Validation checks (package.json, manifest.json, README.md)
// ==============================================================================
function testFilesystemValidation() {
  console.log('[Test 2] Filesystem validation checks verification starting...');

  setupMockWorkspace([
    { id: 'posting-map', files: ['package.json', 'manifest.json', 'README.md'] },
    // missing manifest.json and README.md
    { id: 'hokusei-ch', files: ['package.json'] }
  ]);

  const mockDiscovery: ProjectDiscoveryResult = {
    success: true,
    count: 2,
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'production', description: 'Field OS', path: path.join(MOCK_PROJECTS_DIR, 'posting-map') },
      { id: 'hokusei-ch', name: 'Hokusei Channel', status: 'development', description: 'Local Community', path: path.join(MOCK_PROJECTS_DIR, 'hokusei-ch') }
    ],
    warnings: [],
    errors: []
  };

  try {
    const manager = new ProjectManager(mockDiscovery);
    
    const pmMeta = manager.getProject('posting-map');
    assert(pmMeta !== undefined, 'posting-map must be found');
    assert(pmMeta!.validation.valid === true, 'posting-map should be valid');
    assert(pmMeta!.validation.missingFiles.length === 0, 'posting-map should have 0 missing files');

    const hcMeta = manager.getProject('hokusei-ch');
    assert(hcMeta !== undefined, 'hokusei-ch must be found');
    assert(hcMeta!.validation.valid === false, 'hokusei-ch should be invalid due to missing files');
    assert(hcMeta!.validation.missingFiles.includes('manifest.json') === true, 'hokusei-ch should miss manifest.json');
    assert(hcMeta!.validation.missingFiles.includes('README.md') === true, 'hokusei-ch should miss README.md');
    assert(hcMeta!.validation.missingFiles.includes('package.json') === false, 'hokusei-ch has package.json, should not list it as missing');

    console.log('[Test 2] Filesystem validation checks verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 3: Lifecycle State Machine Transitions
// ==============================================================================
function testLifecycleStateMachine() {
  console.log('[Test 3] Lifecycle state machine transition checks verification starting...');

  setupMockWorkspace([
    { id: 'posting-map', files: ['package.json', 'manifest.json', 'README.md'] }
  ]);

  const mockDiscovery: ProjectDiscoveryResult = {
    success: true,
    count: 1,
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'development', description: 'Field OS', path: path.join(MOCK_PROJECTS_DIR, 'posting-map') }
    ],
    warnings: [],
    errors: []
  };

  try {
    const manager = new ProjectManager(mockDiscovery);
    
    // Initial status should be development
    const meta = manager.getProject('posting-map');
    assert(meta?.lifecycle === 'development', 'Initial status should be development');

    // 1. Allowed Transition: development -> production
    let success = manager.transitionStatus('posting-map', 'production');
    assert(success === true, 'Transition development -> production should be allowed');
    assert(meta?.lifecycle === 'production', 'Status should be updated to production');
    assert(meta?.project.status === 'production', 'Underlying project status should be updated');

    // 2. Prohibited Transition: production -> development (backward transition)
    success = manager.transitionStatus('posting-map', 'development');
    assert(success === false, 'Transition production -> development (backward) should be blocked');
    assert(meta?.lifecycle === 'production', 'Status must remain production');

    // 3. Allowed Transition: production -> archived
    success = manager.transitionStatus('posting-map', 'archived');
    assert(success === true, 'Transition production -> archived should be allowed');
    assert(meta?.lifecycle === 'archived', 'Status should be updated to archived');

    // 4. Prohibited Transition: archived -> development
    success = manager.transitionStatus('posting-map', 'development');
    assert(success === false, 'Transition archived -> development should be blocked');
    assert(meta?.lifecycle === 'archived', 'Status must remain archived');

    console.log('[Test 3] Lifecycle state machine transition checks verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 4: Static Lifecycle Transitions Validation Helper
// ==============================================================================
function testStaticLifecycleTransitions() {
  console.log('[Test 4] Static ProjectLifecycle checks verification starting...');
  
  // development -> production: Allowed
  assert(ProjectLifecycle.isTransitionAllowed('development', 'production') === true, 'dev -> prod allowed');
  // production -> archived: Allowed
  assert(ProjectLifecycle.isTransitionAllowed('production', 'archived') === true, 'prod -> arch allowed');
  // development -> archived: Prohibited (must go dev -> prod -> arch)
  assert(ProjectLifecycle.isTransitionAllowed('development', 'archived') === false, 'dev -> arch prohibited');
  // archived -> development: Prohibited
  assert(ProjectLifecycle.isTransitionAllowed('archived', 'development') === false, 'arch -> dev prohibited');
  // production -> development: Prohibited
  assert(ProjectLifecycle.isTransitionAllowed('production', 'development') === false, 'prod -> dev prohibited');
  // Same status transition (no-op): Allowed
  assert(ProjectLifecycle.isTransitionAllowed('production', 'production') === true, 'prod -> prod allowed');

  console.log('[Test 4] Static ProjectLifecycle checks verification: PASSED');
}

// ==============================================================================
// Runner
// ==============================================================================
function runAllTests() {
  console.log('--- Starting Project Manager Foundation Unit Tests ---');
  testManagerInitialization();
  testFilesystemValidation();
  testLifecycleStateMachine();
  testStaticLifecycleTransitions();
  console.log('--- All Project Manager Foundation Unit Tests PASSED ---');
}

runAllTests();
