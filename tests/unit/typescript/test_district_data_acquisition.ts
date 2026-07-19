import * as fs from "fs";
import * as path from "path";
import { DistrictMasterRuntime } from "../../../domains/posting-map/district/runtime/DistrictMasterRuntime";
import { LocalDistrictDataSource } from "../../../domains/posting-map/district/acquisition/contracts/DistrictDataSource";
import { DistrictDataAcquisitionService } from "../../../domains/posting-map/district/acquisition/DistrictDataAcquisitionService";
import { DistrictDataAcquisitionRuntime } from "../../../domains/posting-map/district/acquisition/DistrictDataAcquisitionRuntime";
import { DistrictDataValidator } from "../../../domains/posting-map/district/acquisition/DistrictDataValidator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const TEST_DIR = path.join(__dirname, "../../../scratch/test-data-acquisition-sprint");
const REGISTRY_FILE = path.join(TEST_DIR, "district-registry.json");

function setupDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function runTests() {
  console.log("🧪 Running District Data Acquisition Foundation Tests...\n");

  setupDirs();

  // Setup: Register Saitama 8th District into the registry file
  const masterRuntime = new DistrictMasterRuntime(REGISTRY_FILE);
  await masterRuntime.registerDistrict({
    districtId: "saitama-08",
    districtName: "埼玉県第8区",
    prefecture: "埼玉県",
    districtNumber: "8",
    masterVersion: "2026.01",
    effectiveFrom: "2026-01-01",
    municipalities: [
      { municipalityCode: "11208", municipalityName: "所沢市" },
      { municipalityCode: "11245", municipalityName: "ふじみ野市" },
      { municipalityCode: "11324", municipalityName: "三芳町" }
    ]
  });

  const dataSource = new LocalDistrictDataSource(REGISTRY_FILE);
  const service = new DistrictDataAcquisitionService(dataSource);
  const runtime = new DistrictDataAcquisitionRuntime(service);

  // Scenario 1: Verify data resolution for Saitama 8th District
  // ==========================================================
  {
    console.log("Scenario 1: Resolving and acquiring Saitama 8th district raw data...");
    const request = {
      requestId: "req-acq-001",
      districtName: "埼玉県第8区"
    };

    const data = await runtime.executeAcquisition(request, { baseDir: TEST_DIR });

    assert(data.districtId === "saitama-08", "districtId is resolved correctly.");
    assert(data.districtName === "埼玉県第8区", "districtName is resolved correctly.");
    assert(data.prefecture === "埼玉県", "prefecture is resolved correctly.");
    assert(data.districtNumber === "8", "districtNumber is resolved correctly.");
    assert(data.municipalities.length === 3, "Contains exactly 3 municipalities.");

    const codes = data.municipalities.map(m => m.code);
    assert(codes.includes("11208"), "Contains Tokorozawa.");
    assert(codes.includes("11245"), "Contains Fujimino.");
    assert(codes.includes("11324"), "Contains Miyoshi.");

    // Verify output raw-district.json exists
    const rawFile = path.join(TEST_DIR, "埼玉県第8区/raw-district.json");
    assert(fs.existsSync(rawFile), "raw-district.json file exists on disk.");

    const fileContent = JSON.parse(fs.readFileSync(rawFile, "utf-8"));
    assert(fileContent.districtId === "saitama-08", "Stored json districtId matches.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // Scenario 2: Metadata and lineage hash check
  // ==========================================================
  {
    console.log("Scenario 2: Verifying data lineage metadata and sourceHash...");
    const request = {
      requestId: "req-acq-002",
      districtName: "埼玉県第8区"
    };

    const data = await runtime.executeAcquisition(request, { baseDir: TEST_DIR });
    
    assert(data.sourceType === "LOCAL_REGISTRY", "sourceType matches local registry.");
    assert(data.sourceHash.length === 64, "sourceHash is a valid SHA-256 hash string.");
    assert(data.acquiredAt !== undefined && !isNaN(Date.parse(data.acquiredAt)), "acquiredAt is valid ISO date.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // Scenario 3: Non-existent district resolution failure
  // ==========================================================
  {
    console.log("Scenario 3: Resolving non-existent district name...");
    const request = {
      requestId: "req-acq-003",
      districtName: "月面第1区"
    };

    let didFail = false;
    try {
      await runtime.executeAcquisition(request, { baseDir: TEST_DIR });
    } catch (err: any) {
      didFail = true;
      assert(err.message.includes("could not be resolved"), "Should throw could-not-resolve error.");
    }
    assert(didFail, "Runtime must fail on non-existent district.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // Scenario 4: Schema validation constraints failure
  // ==========================================================
  {
    console.log("Scenario 4: Validating malformed district data schema...");
    const validator = new DistrictDataValidator();

    const malformedData = {
      districtId: "INVALID_ID_FORMAT",
      districtName: "  ",
      prefecture: "埼玉県",
      districtNumber: "abc",
      municipalities: [
        { code: "123", name: "" } // Invalid code length and empty name
      ],
      acquiredAt: new Date().toISOString(),
      sourceHash: "wrong_hash",
      sourceType: "LOCAL_REGISTRY"
    };

    const valRes = validator.validate(malformedData);
    assert(!valRes.success, "Should fail validation.");
    assert(valRes.errors.some(e => e.includes("districtId")), "Catches invalid districtId.");
    assert(valRes.errors.some(e => e.includes("districtName")), "Catches invalid districtName.");
    assert(valRes.errors.some(e => e.includes("districtNumber")), "Catches invalid districtNumber.");
    assert(valRes.errors.some(e => e.includes("municipalities[0]")), "Catches invalid municipality code.");
    assert(valRes.errors.some(e => e.includes("sourceHash")), "Catches sourceHash mismatch.");

    console.log("✅ Scenario 4 Passed.\n");
  }

  console.log("🎉 All District Data Acquisition Tests completed successfully!");
}

runTests().catch(err => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
