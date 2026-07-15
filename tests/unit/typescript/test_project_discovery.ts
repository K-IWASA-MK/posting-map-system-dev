import * as fs from 'fs';
import * as path from 'path';
import { ProjectDiscovery } from '../../../core/project-discovery/ProjectDiscovery';
import { RegistryValidator } from '../../../core/project-discovery/RegistryValidator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Temporary directory for mock workspace testing
const MOCK_WORKSPACE_ROOT = path.join(__dirname, 'mock_workspace_discovery');
const MOCK_PROJECTS_DIR = path.join(MOCK_WORKSPACE_ROOT, 'projects');

function setupMockWorkspace(registryData: any, physicalDirs: string[]) {
  // Clean up any existing directory
  teardownMockWorkspace();

  // Create mock directory structure
  fs.mkdirSync(MOCK_WORKSPACE_ROOT, { recursive: true });
  fs.mkdirSync(MOCK_PROJECTS_DIR, { recursive: true });

  // Write registry.json
  const registryPath = path.join(MOCK_PROJECTS_DIR, 'registry.json');
  fs.writeFileSync(registryPath, JSON.stringify(registryData, null, 2), 'utf-8');

  // Create physical subdirectories
  for (const dir of physicalDirs) {
    fs.mkdirSync(path.join(MOCK_PROJECTS_DIR, dir), { recursive: true });
  }
}

function teardownMockWorkspace() {
  if (fs.existsSync(MOCK_WORKSPACE_ROOT)) {
    fs.rmSync(MOCK_WORKSPACE_ROOT, { recursive: true, force: true });
  }
}

// ==============================================================================
// Test 1: Normal Flow Verification
// ==============================================================================
function testNormalFlow() {
  console.log('[Test 1] Normal project discovery flow verification starting...');
  
  const mockRegistry = {
    version: '1.0',
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'production', description: 'Field OS' },
      { id: 'hokusei-ch', name: 'Hokusei Channel', status: 'development', description: 'Local Community' }
    ]
  };
  const dirs = ['posting-map', 'hokusei-ch'];
  
  setupMockWorkspace(mockRegistry, dirs);
  
  try {
    const result = ProjectDiscovery.discover(MOCK_WORKSPACE_ROOT);
    
    assert(result.success === true, 'Discovery should be successful');
    assert(result.count === 2, `Expected 2 projects, found ${result.count}`);
    assert(result.projects.length === 2, 'Expected project array length of 2');
    assert(result.errors.length === 0, 'Expected zero errors');
    
    assert(result.projects[0].id === 'posting-map', 'First project ID mismatch');
    assert(result.projects[0].status === 'production', 'First project status mismatch');
    assert(result.projects[1].id === 'hokusei-ch', 'Second project ID mismatch');
    
    console.log('[Test 1] Normal project discovery flow verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 2: Invalid ID and format Validation (non-kebab-case)
// ==============================================================================
function testInvalidIdFormat() {
  console.log('[Test 2] Invalid ID format (non-kebab-case) verification starting...');
  
  const mockRegistry = {
    version: '1.0',
    projects: [
      { id: 'Posting_Map', name: 'Posting Map', status: 'production', description: 'Field OS' },
      { id: 'hokusei-ch', name: 'Hokusei Channel', status: 'development', description: 'Local Community' }
    ]
  };
  const dirs = ['Posting_Map', 'hokusei-ch'];
  
  setupMockWorkspace(mockRegistry, dirs);
  
  try {
    const result = ProjectDiscovery.discover(MOCK_WORKSPACE_ROOT);
    
    assert(result.success === false, 'Discovery should fail due to invalid ID format');
    assert(result.errors.some(e => e.code === 'INVALID_ID_FORMAT'), 'Expected INVALID_ID_FORMAT error');
    
    console.log('[Test 2] Invalid ID format verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 3: Duplicate ID Detection
// ==============================================================================
function testDuplicateIds() {
  console.log('[Test 3] Duplicate project ID verification starting...');
  
  const mockRegistry = {
    version: '1.0',
    projects: [
      { id: 'posting-map', name: 'Posting Map 1', status: 'production', description: 'Field OS 1' },
      { id: 'posting-map', name: 'Posting Map 2', status: 'production', description: 'Field OS 2' }
    ]
  };
  const dirs = ['posting-map'];
  
  setupMockWorkspace(mockRegistry, dirs);
  
  try {
    const result = ProjectDiscovery.discover(MOCK_WORKSPACE_ROOT);
    
    assert(result.success === false, 'Discovery should fail due to duplicate IDs');
    assert(result.errors.some(e => e.code === 'DUPLICATE_PROJECT_ID'), 'Expected DUPLICATE_PROJECT_ID error');
    
    console.log('[Test 3] Duplicate project ID verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 4: Invalid Status Validation
// ==============================================================================
function testInvalidStatus() {
  console.log('[Test 4] Invalid lifecycle status verification starting...');
  
  const mockRegistry = {
    version: '1.0',
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'retired', description: 'Field OS' }
    ]
  };
  const dirs = ['posting-map'];
  
  setupMockWorkspace(mockRegistry, dirs);
  
  try {
    const result = ProjectDiscovery.discover(MOCK_WORKSPACE_ROOT);
    
    assert(result.success === false, 'Discovery should fail due to invalid status');
    assert(result.errors.some(e => e.code === 'INVALID_PROJECT_STATUS'), 'Expected INVALID_PROJECT_STATUS error');
    
    console.log('[Test 4] Invalid lifecycle status verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 5: Missing Directory Detection
// ==============================================================================
function testMissingDirectory() {
  console.log('[Test 5] Missing project directory verification starting...');
  
  const mockRegistry = {
    version: '1.0',
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'production', description: 'Field OS' },
      { id: 'hokusei-ch', name: 'Hokusei Channel', status: 'development', description: 'Local Community' }
    ]
  };
  // 'hokusei-ch' directory is physically missing
  const dirs = ['posting-map'];
  
  setupMockWorkspace(mockRegistry, dirs);
  
  try {
    const result = ProjectDiscovery.discover(MOCK_WORKSPACE_ROOT);
    
    assert(result.success === false, 'Discovery should fail due to missing project directory');
    assert(result.errors.some(e => e.code === 'MISSING_PROJECT_DIRECTORY'), 'Expected MISSING_PROJECT_DIRECTORY error');
    
    console.log('[Test 5] Missing project directory verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Test 6: Orphan Directory Detection
// ==============================================================================
function testOrphanDirectory() {
  console.log('[Test 6] Orphan directory verification starting...');
  
  const mockRegistry = {
    version: '1.0',
    projects: [
      { id: 'posting-map', name: 'Posting Map', status: 'production', description: 'Field OS' }
    ]
  };
  // 'hokusei-ch' is a physical directory but not registered in registry.json
  const dirs = ['posting-map', 'hokusei-ch'];
  
  setupMockWorkspace(mockRegistry, dirs);
  
  try {
    const result = ProjectDiscovery.discover(MOCK_WORKSPACE_ROOT);
    
    assert(result.success === false, 'Discovery should fail due to orphan directory');
    assert(result.errors.some(e => e.code === 'ORPHAN_PROJECT_DIRECTORY'), 'Expected ORPHAN_PROJECT_DIRECTORY error');
    assert(result.errors.find(e => e.code === 'ORPHAN_PROJECT_DIRECTORY')?.projectId === 'hokusei-ch', 'Expected orphan directory error details to reference hokusei-ch');
    
    console.log('[Test 6] Orphan directory verification: PASSED');
  } finally {
    teardownMockWorkspace();
  }
}

// ==============================================================================
// Runner
// ==============================================================================
function runAllTests() {
  console.log('--- Starting Project Discovery Foundation Unit Tests ---');
  testNormalFlow();
  testInvalidIdFormat();
  testDuplicateIds();
  testInvalidStatus();
  testMissingDirectory();
  testOrphanDirectory();
  console.log('--- All Project Discovery Foundation Unit Tests PASSED ---');
}

runAllTests();
