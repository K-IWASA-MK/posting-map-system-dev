import { Launcher } from '../../../core/launcher/Launcher';
import { LauncherRequest } from '../../../core/launcher/LauncherRequest';
import { ProjectManager } from '../../../core/project-manager/ProjectManager';
import { ProjectDiscoveryResult } from '../../../core/project-discovery/ProjectDiscoveryResult';
import * as path from 'path';
import * as fs from 'fs';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const MOCK_WORKSPACE_ROOT = path.join(__dirname, 'mock_workspace_launcher');
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
// Test 1: Normal Launch Path (Clearance)
// ==============================================================================
function testNormalLaunchPath() {
  console.log('[Test 1] Normal launch path validation starting...');
  
  setupMockWorkspace([
    { id: 'posting-map', files: ['package.json', 'manifest.json', 'README.md'] }
  ]);

  const mockDiscovery: ProjectDiscoveryResult = {
    success: true,
    count: 1,
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'production', description: 'Field OS', path: path.join(MOCK_PROJECTS_DIR, 'posting-map') }
    ],
    warnings: [],
    errors: []
  };

  try {
    const manager = new ProjectManager(mockDiscovery);
    const request: LauncherRequest = {
      projectId: 'posting-map',
      mode: 'production',
      requestId: 'req-12345'
    };

    const result = Launcher.verifyLaunch(request, manager);
    assert(result.success === true, 'Valid request should clear the launch gate');
    assert(result.decision === 'allow', 'Decision should be allow');
    assert(result.reasons.length === 0, 'No reasons should be returned');
    assert(result.errorCodes.length === 0, 'No error codes should be returned');
    assert(result.projectId === 'posting-map', 'Project ID mismatch');
    assert(result.bootTimestamp !== undefined, 'Should include boot timestamp');

    console.log('[Test 1] Normal launch path validation: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 2: Block Archived Project Launch
// ==============================================================================
function testBlockArchivedLaunch() {
  console.log('[Test 2] Block archived project launch validation starting...');

  setupMockWorkspace([
    { id: 'posting-map', files: ['package.json', 'manifest.json', 'README.md'] }
  ]);

  const mockDiscovery: ProjectDiscoveryResult = {
    success: true,
    count: 1,
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'archived', description: 'Field OS', path: path.join(MOCK_PROJECTS_DIR, 'posting-map') }
    ],
    warnings: [],
    errors: []
  };

  try {
    const manager = new ProjectManager(mockDiscovery);
    const request: LauncherRequest = {
      projectId: 'posting-map',
      mode: 'development'
    };

    const result = Launcher.verifyLaunch(request, manager);
    assert(result.success === false, 'Archived project launch should be blocked');
    assert(result.decision === 'deny', 'Decision should be deny');
    assert(result.errorCodes.includes('PROJECT_ARCHIVED'), 'Expected PROJECT_ARCHIVED error code');

    console.log('[Test 2] Block archived project launch validation: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 3: Block Invalid Structure Layout
// ==============================================================================
function testBlockInvalidStructureLaunch() {
  console.log('[Test 3] Block invalid layout structure launch validation starting...');

  setupMockWorkspace([
    // missing package.json and README.md
    { id: 'posting-map', files: ['manifest.json'] }
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
    const request: LauncherRequest = {
      projectId: 'posting-map',
      mode: 'development'
    };

    const result = Launcher.verifyLaunch(request, manager);
    assert(result.success === false, 'Invalid structure project launch should be blocked');
    assert(result.decision === 'deny', 'Decision should be deny');
    assert(result.errorCodes.includes('VALIDATION_FAILED'), 'Expected VALIDATION_FAILED error code');

    console.log('[Test 3] Block invalid layout structure launch validation: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 4: Block Unregistered Project ID
// ==============================================================================
function testBlockUnregisteredLaunch() {
  console.log('[Test 4] Block unregistered project launch validation starting...');

  setupMockWorkspace([]);

  const mockDiscovery: ProjectDiscoveryResult = {
    success: true,
    count: 0,
    projects: [],
    warnings: [],
    errors: []
  };

  try {
    const manager = new ProjectManager(mockDiscovery);
    const request: LauncherRequest = {
      projectId: 'non-existent-proj',
      mode: 'development'
    };

    const result = Launcher.verifyLaunch(request, manager);
    assert(result.success === false, 'Unregistered project launch should be blocked');
    assert(result.decision === 'deny', 'Decision should be deny');
    assert(result.errorCodes.includes('PROJECT_NOT_FOUND'), 'Expected PROJECT_NOT_FOUND error code');

    console.log('[Test 4] Block unregistered project launch validation: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 5: Block Invalid Mode Parameter
// ==============================================================================
function testBlockInvalidModeLaunch() {
  console.log('[Test 5] Block invalid mode parameter launch validation starting...');

  setupMockWorkspace([
    { id: 'posting-map', files: ['package.json', 'manifest.json', 'README.md'] }
  ]);

  const mockDiscovery: ProjectDiscoveryResult = {
    success: true,
    count: 1,
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'production', description: 'Field OS', path: path.join(MOCK_PROJECTS_DIR, 'posting-map') }
    ],
    warnings: [],
    errors: []
  };

  try {
    const manager = new ProjectManager(mockDiscovery);
    const request: LauncherRequest = {
      projectId: 'posting-map',
      mode: 'invalid-mode' as any
    };

    const result = Launcher.verifyLaunch(request, manager);
    assert(result.success === false, 'Invalid execution mode launch should be blocked');
    assert(result.decision === 'deny', 'Decision should be deny');
    assert(result.errorCodes.includes('INVALID_LAUNCH_MODE'), 'Expected INVALID_LAUNCH_MODE error code');

    console.log('[Test 5] Block invalid mode parameter launch validation: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Runner
// ==============================================================================
function runAllTests() {
  console.log('--- Starting Launcher Foundation Unit Tests ---');
  testNormalLaunchPath();
  testBlockArchivedLaunch();
  testBlockInvalidStructureLaunch();
  testBlockUnregisteredLaunch();
  testBlockInvalidModeLaunch();
  console.log('--- All Launcher Foundation Unit Tests PASSED ---');
}

runAllTests();
