import * as fs from 'fs';
import * as path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const PROTOCOLS_DIR = path.resolve(__dirname, '../../../aios/protocols');

interface SchemaProperties {
  protocolId?: { type: string; const?: string };
  protocolVersion?: { type: string; pattern?: string };
  compatibleVersions?: { type: string; items?: object };
  [key: string]: any;
}

interface JsonSchema {
  $schema?: string;
  type: string;
  properties?: SchemaProperties;
  required?: string[];
  [key: string]: any;
}

function validateProtocolSchema(fileName: string, expectedProtocolId: string) {
  const filePath = path.join(PROTOCOLS_DIR, fileName);
  console.log(`[Test] Verifying schema file: ${fileName}...`);
  
  // 1. Check existence
  assert(fs.existsSync(filePath), `${fileName} must exist in aios/protocols/`);

  // 2. Parse JSON
  const content = fs.readFileSync(filePath, 'utf8');
  let schema: JsonSchema;
  try {
    schema = JSON.parse(content);
  } catch (err: any) {
    throw new Error(`Failed to parse ${fileName} as JSON: ${err.message}`);
  }

  // 3. Validate root structural schema assertions
  assert(schema.$schema === "http://json-schema.org/draft-07/schema#", `${fileName} must define standard draft-07 schema`);
  assert(schema.type === "object", `${fileName} root type must be object`);
  assert(schema.properties !== undefined, `${fileName} must define properties`);

  // 4. Validate metadata parameters
  const props = schema.properties;
  assert(props.protocolId !== undefined, `${fileName} must define protocolId`);
  assert(props.protocolId.type === "string", `${fileName} protocolId must be string`);
  assert(props.protocolId.const === expectedProtocolId, `${fileName} protocolId.const must match '${expectedProtocolId}'`);

  assert(props.protocolVersion !== undefined, `${fileName} must define protocolVersion`);
  assert(props.protocolVersion.type === "string", `${fileName} protocolVersion must be string`);
  assert(props.protocolVersion.pattern === "^[0-9]+\\.[0-9]+\\.[0-9]+$", `${fileName} protocolVersion pattern must be semantic version regex`);

  assert(props.compatibleVersions !== undefined, `${fileName} must define compatibleVersions`);
  assert(props.compatibleVersions.type === "array", `${fileName} compatibleVersions must be array`);

  // 5. Check standard required fields
  const required = schema.required || [];
  assert(required.includes("protocolId"), `${fileName} required fields must include protocolId`);
  assert(required.includes("protocolVersion"), `${fileName} required fields must include protocolVersion`);
  assert(required.includes("compatibleVersions"), `${fileName} required fields must include compatibleVersions`);
  
  console.log(`   ✓ ${fileName} validated successfully.`);
}

async function runAll() {
  console.log('--- Starting G7-1: Protocol Foundation Tests ---');

  // Verify all 5 core protocol schemas
  validateProtocolSchema('decision-v1.json', 'aios-decision-v1');
  validateProtocolSchema('consensus-v1.json', 'aios-consensus-v1');
  validateProtocolSchema('capability-v1.json', 'aios-capability-v1');
  validateProtocolSchema('ledger-v1.json', 'aios-ledger-v1');
  validateProtocolSchema('governance-v1.json', 'aios-governance-v1');

  // Verify specification document existence
  const specPath = path.join(PROTOCOLS_DIR, 'ProtocolFoundation.md');
  assert(fs.existsSync(specPath), "ProtocolFoundation.md specification document must exist.");

  console.log('--- All G7-1: Protocol Foundation Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
