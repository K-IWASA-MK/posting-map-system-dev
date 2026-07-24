import assert from 'assert';
import {
  AIEmployeeManager,
  AIEmployeeState,
  AssignmentStatus,
  EmployeeHealth,
  BrowserCapabilityProvider,
  MapCapabilityProvider,
  LineCapabilityProvider,
  WeatherCapabilityProvider,
  EmployeeAlreadyExistsException,
  EmployeeNotFoundException
} from '../../../sdk/employee/manager';

console.log("==================================================");
console.log("   AI EMPLOYEE MANAGER FOUNDATION UNIT TEST SUITE");
console.log("==================================================");

async function runAIEmployeeManagerFoundationTests() {
  // Test 1: Employee Registration & AIEmployeeIdentity Verification
  console.log("\n[Test 1] AI Employee Registration & Identity Model Verification...");
  AIEmployeeManager.resetInstance();
  const manager = AIEmployeeManager.getInstance();

  const trafficEmp = manager.registerEmployee(
    {
      employeeId: 'emp-traffic-001',
      employeeName: 'Traffic Monitoring Agent',
      employeeType: 'AGENT',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    },
    [new BrowserCapabilityProvider(), new LineCapabilityProvider()],
    { departmentId: 'dept-media', teamId: 'team-traffic', priorityGroup: 'CORE' }
  );

  assert.strictEqual(trafficEmp.identity.employeeId, 'emp-traffic-001');
  assert.strictEqual(trafficEmp.state, AIEmployeeState.PROVISIONED);
  assert.strictEqual(trafficEmp.assignmentStatus, AssignmentStatus.UNASSIGNED);
  assert.strictEqual(trafficEmp.health, EmployeeHealth.NORMAL);
  assert.strictEqual(trafficEmp.capabilities.length, 2);
  console.log("   ✓ Test 1 Passed (Employee registered into PROVISIONED state)");

  // Test 2: Duplicate Registration Guard
  console.log("\n[Test 2] Duplicate Employee Registration Protection...");
  assert.throws(
    () => manager.registerEmployee({
      employeeId: 'emp-traffic-001',
      employeeName: 'Duplicate Agent',
      employeeType: 'AGENT',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    }),
    EmployeeAlreadyExistsException,
    'Re-registering same employeeId must throw EmployeeAlreadyExistsException'
  );
  console.log("   ✓ Test 2 Passed (Duplicate employee registration blocked)");

  // Test 3: AIEmployeeState & AssignmentStatus Independent Transitions
  console.log("\n[Test 3] State & Assignment Independent Lifecycle Transitions...");
  manager.updateState('emp-traffic-001', AIEmployeeState.IDLE);
  assert.strictEqual(manager.getEmployee('emp-traffic-001').state, AIEmployeeState.IDLE);

  manager.updateAssignment('emp-traffic-001', AssignmentStatus.ASSIGNED);
  assert.strictEqual(manager.getEmployee('emp-traffic-001').assignmentStatus, AssignmentStatus.ASSIGNED);

  manager.updateState('emp-traffic-001', AIEmployeeState.WORKING);
  manager.updateAssignment('emp-traffic-001', AssignmentStatus.EXECUTING);
  assert.strictEqual(manager.getEmployee('emp-traffic-001').state, AIEmployeeState.WORKING);
  assert.strictEqual(manager.getEmployee('emp-traffic-001').assignmentStatus, AssignmentStatus.EXECUTING);
  console.log("   ✓ Test 3 Passed (State and AssignmentStatus transitioned independently)");

  // Test 4: Health Model & Health Degradation
  console.log("\n[Test 4] Health Model & Degradation Control...");
  manager.updateHealth('emp-traffic-001', EmployeeHealth.WARNING);
  assert.strictEqual(manager.getEmployee('emp-traffic-001').health, EmployeeHealth.WARNING);

  manager.updateHealth('emp-traffic-001', EmployeeHealth.CRITICAL);
  manager.updateState('emp-traffic-001', AIEmployeeState.DEGRADED);
  assert.strictEqual(manager.getEmployee('emp-traffic-001').state, AIEmployeeState.DEGRADED);
  console.log("   ✓ Test 4 Passed (Health degraded to CRITICAL and state to DEGRADED)");

  // Test 5: Self-Healing Recovery Sequence
  console.log("\n[Test 5] Self-Healing Recovery Sequence...");
  const recoverySuccess = await manager.recoverEmployee('emp-traffic-001');
  assert.strictEqual(recoverySuccess, true);
  assert.strictEqual(manager.getEmployee('emp-traffic-001').state, AIEmployeeState.IDLE);
  assert.strictEqual(manager.getEmployee('emp-traffic-001').health, EmployeeHealth.NORMAL);
  console.log("   ✓ Test 5 Passed (Employee recovered to IDLE state and NORMAL health)");

  // Test 6: Capability Providers Verification
  console.log("\n[Test 6] Capability Providers Interoperability...");
  const weatherEmp = manager.registerEmployee(
    {
      employeeId: 'emp-weather-001',
      employeeName: 'Weather Forecast Agent',
      employeeType: 'AGENT',
      version: '1.0.0',
      createdAt: new Date().toISOString()
    },
    [new BrowserCapabilityProvider(), new WeatherCapabilityProvider(), new MapCapabilityProvider()],
    { departmentId: 'dept-field-ops', teamId: 'team-weather', priorityGroup: 'SECONDARY' }
  );

  assert.strictEqual(weatherEmp.capabilities.length, 3);
  assert.ok(weatherEmp.capabilities.some(c => c.capabilityName === 'IWeatherCapability'));
  assert.ok(weatherEmp.capabilities.some(c => c.capabilityName === 'IMapCapability'));
  console.log("   ✓ Test 6 Passed (Multiple capabilities assigned and validated)");

  console.log("\n==================================================");
  console.log("   ALL AI EMPLOYEE MANAGER FOUNDATION TESTS PASSED!");
  console.log("==================================================");
}

runAIEmployeeManagerFoundationTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
