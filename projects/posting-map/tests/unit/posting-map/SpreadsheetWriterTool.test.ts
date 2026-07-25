import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SpreadsheetWriterTool } from '../../../src/platform/posting-map-tools/spreadsheet/SpreadsheetWriterTool';
import { EmployeeRecord } from '../../../src/platform/employee-runtime/registry/models/EmployeeRegistryModels';
import { TaskRecord } from '../../../src/platform/employee-runtime/task-assignment/models/TaskAssignmentModels';

describe('SpreadsheetWriterTool (Sprint T-01)', () => {
  const tool = new SpreadsheetWriterTool();

  const employee: EmployeeRecord = {
    employeeId: 'EMP-INIT-03',
    employeeName: 'District Initialization Agent',
    employeeType: 'OPERATIONAL',
    roleId: 'ROLE_PROVISIONER',
    authorityLevel: 'EXECUTE',
    capabilities: ['spreadsheet_copy', 'spreadsheet_protect'],
    status: 'ACTIVE',
    registeredAt: new Date().toISOString(),
  };

  const task: TaskRecord = {
    taskId: 'TSK-WRITE-01',
    taskName: 'Write District Data',
    taskType: 'DISTRICT_PROVISION',
    description: 'Write extracted data to spreadsheet',
    createdAt: new Date().toISOString(),
    assignedEmployeeId: 'EMP-INIT-03',
    assignedRoleId: 'ROLE_PROVISIONER',
    scope: {
      taskObjective: 'Write MIE-03 branch data',
      allowedActions: ['spreadsheet_write'],
      forbiddenActions: [],
      expectedOutput: 'Data written'
    },
    inputSpec: {
      inputSource: 'extracted_district_data.csv',
      fileId: 'EXT-DST-03',
      checksum: 'hash',
      expectedRecordCount: 30
    },
    allowedTools: ['spreadsheet_writer'],
    status: 'READY',
    approvalStatus: 'APPROVED'
  };

  const validCsv = `"自治体名","町名/大字","丁目/詳細","ステータス","検証ソース","選挙区コード"
"四日市市","富田","1丁目","VERIFIED","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","富田","2丁目","VERIFIED","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","富田","3丁目","VERIFIED","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","富州原町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","富田一色町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","天カ須賀","1丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","天カ須賀","2丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","天カ須賀","3丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","天カ須賀","4丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","天カ須賀新田","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","住吉町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","島崎町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","高砂町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","末広町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","千歳町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","大井手","1丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","大井手","2丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","大井手","3丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","大井手","4丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","松本","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","大井手町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","西松本町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","青葉町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","中松本町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","伊倉","1丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","伊倉","2丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","伊倉","3丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","伊倉町","全域","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","久保田","1丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"
"四日市市","久保田","2丁目","NONE","NATIONAL_ADDRESS_MASTER","MIE-03"`;

  it('Normal Flow: should successfully validate, execute and generate evidence', async () => {
    const evidence = await tool.writeSpreadsheet(
      employee,
      task,
      validCsv,
      30,
      'https://script.google.com/macros/s/mock_url/exec'
    );

    expect(evidence.spreadsheetId).toBe('1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA');
    expect(evidence.rowCount).toBe(30);
    expect(evidence.sheetCount).toBe(5);
    expect(evidence.hash).toBeDefined();
    expect(evidence.timestamp).toBeDefined();
  });

  it('Unauthorized Flow: should reject execution if tool not allowed in task contract', async () => {
    const unauthorizedTask: TaskRecord = {
      ...task,
      allowedTools: ['run_command'] // does not include 'spreadsheet_writer'
    };

    await expect(
      tool.writeSpreadsheet(
        employee,
        unauthorizedTask,
        validCsv,
        30,
        'https://script.google.com/macros/s/mock_url/exec'
      )
    ).rejects.toThrow('[Tool Permission Block]');
  });

  it('Input Mismatch Flow: should block execution if row count does not match expected', async () => {
    await expect(
      tool.writeSpreadsheet(
        employee,
        task,
        validCsv,
        25, // expected 25, actual 30
        'https://script.google.com/macros/s/mock_url/exec'
      )
    ).rejects.toThrow('[Validation Block] Row count mismatch');
  });

  it('Input Mismatch Flow: should block execution if required headers are missing', async () => {
    const invalidHeadersCsv = `"City","Town","Status"\n"四日市市","富田","VERIFIED"`;
    await expect(
      tool.writeSpreadsheet(
        employee,
        task,
        invalidHeadersCsv,
        1,
        'https://script.google.com/macros/s/mock_url/exec'
      )
    ).rejects.toThrow('[Validation Block] Missing required column header');
  });

  it('Regression Guard: should check deployment.json compatibility', () => {
    const deploymentPath = path.resolve(__dirname, '../../../FIELD_OPERATIONS_PLATFORM/03_BRANCH/MIE-03/deployment.json');
    expect(fs.existsSync(deploymentPath)).toBe(true);

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    expect(deployment.branchId).toBe('MIE-03');
    expect(deployment.resources.spreadsheetId).toBe('1xQUvlCaUO103rjSGmdcFQQFkukodG4Dg9mS_teWT7uA');
    expect(deployment.uiConfig.spreadsheetTitle).toBe('MIE-03 v1');
  });
});
