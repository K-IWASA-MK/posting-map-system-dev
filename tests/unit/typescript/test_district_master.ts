import * as fs from "fs";
import * as path from "path";
import { DistrictMasterRuntime } from "../../../domains/posting-map/district/runtime/DistrictMasterRuntime";
import { DistrictMasterRepository } from "../../../domains/posting-map/district/storage/DistrictMasterRepository";
import { DistrictMasterResolver } from "../../../domains/posting-map/district/resolver/DistrictMasterResolver";
import { DistrictMasterValidator } from "../../../domains/posting-map/district/validation/DistrictMasterValidator";
import { DistrictInitializationRuntime } from "../../../domains/posting-map/initialization/runtime/DistrictInitializationRuntime";
import { DistrictInitializationWorkflow } from "../../../domains/posting-map/initialization/models/DistrictInitializationWorkflow";
import { PostingAreaRuntime } from "../../../domains/posting-map/area/runtime/PostingAreaRuntime";
import { ElectionDashboardStorageRuntime } from "../../../domains/election/storage/runtime/ElectionDashboardStorageRuntime";
import { PostingMapVisualizationRuntime } from "../../../domains/posting-map/visualization/runtime/PostingMapVisualizationRuntime";
import { SalesPreviewRuntime } from "../../../apps/posting-map-sales-preview/runtime/SalesPreviewRuntime";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const TEST_DIR = path.join(__dirname, "../../../scratch/test-district-master-sprint");
const REGISTRY_FILE = path.join(TEST_DIR, "district-registry.json");

function setupDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function runTests() {
  console.log("🧪 Running District Master Foundation Tests...\n");

  // Scenario 1 & 2: Registration and Municipality resolve
  // =======================================================
  {
    console.log("Scenario 1 & 2: Register Mie 3rd district and resolve municipalities...");
    setupDirs();
    const runtime = new DistrictMasterRuntime(REGISTRY_FILE);

    const res = await runtime.registerDistrict({
      districtId: "mie-03",
      districtName: "三重県第3区",
      prefecture: "三重県",
      districtNumber: "3",
      masterVersion: "2026.01",
      effectiveFrom: "2026-01-01",
      municipalities: [
        { municipalityCode: "24205", municipalityName: "桑名市" },
        { municipalityCode: "24214", municipalityName: "いなべ市" },
        { municipalityCode: "24202", municipalityName: "四日市市" }
      ]
    });

    assert(res.status === "SUCCESS", "Registration should succeed.");
    const master = res.master!;
    assert(master.districtId === "mie-03", "districtId match.");
    assert(master.masterVersion === "2026.01", "masterVersion match.");
    assert(master.effectiveFrom === "2026-01-01", "effectiveFrom match.");
    assert(master.sourceHash !== undefined, "sourceHash generated.");
    assert(master.contentHash !== undefined, "contentHash generated.");

    assert(master.municipalities.length === 3, "Contains 3 municipalities.");
    assert(master.municipalities[0].municipalityName === "桑名市", "First is Kuwana.");

    console.log("✅ Scenario 1 & 2 Passed.\n");
  }

  // Scenario 3: Saitama 8th District Addition
  // =======================================================
  {
    console.log("Scenario 3: Register Saitama 8th district...");
    const runtime = new DistrictMasterRuntime(REGISTRY_FILE);

    const res = await runtime.registerDistrict({
      districtId: "saitama-08",
      districtName: "埼玉県第8区",
      prefecture: "埼玉県",
      districtNumber: "8",
      masterVersion: "2026.01",
      effectiveFrom: "2026-01-01",
      municipalities: [
        { municipalityCode: "11208", municipalityName: "所沢市" },
        { municipalityCode: "11231", municipalityName: "三芳町" }
      ]
    });

    assert(res.status === "SUCCESS", "Saitama registration should succeed.");
    const list = runtime.getDistricts();
    assert(list.length === 2, "Registry list should contain 2 districts.");
    assert(list[1].districtId === "saitama-08", "Saitama districtId match.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // Scenario 4 & 5: Resolver test
  // =======================================================
  {
    console.log("Scenario 4 & 5: Search via DistrictMasterResolver...");
    const repository = new DistrictMasterRepository();
    const resolver = new DistrictMasterResolver(repository, REGISTRY_FILE);

    // Scenario 4: Valid search
    const info = resolver.resolve("三重県第3区");
    assert(info.districtId === "mie-03", "Resolver maps districtId.");
    assert(info.municipalities.length === 3, "Resolver maps municipalities.");

    // Scenario 5: Unknown district
    try {
      resolver.resolve("存在しない選挙区");
      throw new Error("Should have thrown resolver error.");
    } catch (err: any) {
      assert(err.message.includes("Unknown or unsupported district"), "Error message match.");
    }

    console.log("✅ Scenario 4 & 5 Passed.\n");
  }

  // Scenario 6: Duplicate Registration Block
  // =======================================================
  {
    console.log("Scenario 6: Verify duplicate ID blocking...");
    const runtime = new DistrictMasterRuntime(REGISTRY_FILE);

    // Duplicate ID registration
    const resId = await runtime.registerDistrict({
      districtId: "mie-03", // Duplicate ID
      districtName: "三重県第3区(新仕様)",
      prefecture: "三重県",
      districtNumber: "3",
      masterVersion: "2026.02",
      effectiveFrom: "2026-02-01",
      municipalities: [
        { municipalityCode: "24205", municipalityName: "桑名市" }
      ]
    });
    assert(resId.status === "FAILED", "Duplicate ID registration must fail.");
    assert(resId.error!.includes("Duplicate districtId"), "ID error message match.");

    // Duplicate Name registration
    const resName = await runtime.registerDistrict({
      districtId: "mie-03-dup",
      districtName: "三重県第3区", // Duplicate Name
      prefecture: "三重県",
      districtNumber: "3",
      masterVersion: "2026.02",
      effectiveFrom: "2026-02-01",
      municipalities: [
        { municipalityCode: "24205", municipalityName: "桑名市" }
      ]
    });
    assert(resName.status === "FAILED", "Duplicate name registration must fail.");
    assert(resName.error!.includes("Duplicate districtName"), "Name error message match.");

    console.log("✅ Scenario 6 Passed.\n");
  }

  // Scenario 7: Hash Integrity
  // =======================================================
  {
    console.log("Scenario 7: Verify Hash Integrity check...");
    const repository = new DistrictMasterRepository();
    const validator = new DistrictMasterValidator();

    const list = repository.read(REGISTRY_FILE);
    const mie = list.find(d => d.districtId === "mie-03")!;

    // Tamper with municipalities list inside the schema to trigger sourceHash validation mismatch
    const tamperedSchema = {
      ...mie,
      municipalities: [
        { municipalityCode: "24205", municipalityName: "桑名市" } // Removed inabe/yokkaichi without recalculating sourceHash
      ]
    };

    const valRes = validator.validate(tamperedSchema);
    assert(!valRes.success, "Validator should detect mismatching sourceHash.");
    assert(valRes.errors.join("; ").includes("sourceHash mismatch"), "Correct validation error output.");

    console.log("✅ Scenario 7 Passed.\n");
  }

  // Scenario 8: Sales Preview Integration (E2E)
  // =======================================================
  {
    console.log("Scenario 8: E2E check with District Initialization and Sales Preview...");
    const repository = new DistrictMasterRepository();
    const resolver = new DistrictMasterResolver(repository, REGISTRY_FILE);

    const areaRuntime = new PostingAreaRuntime();
    const storageRuntime = new ElectionDashboardStorageRuntime();
    const visualizationRuntime = new PostingMapVisualizationRuntime();
    const workflow = new DistrictInitializationWorkflow(resolver, areaRuntime, storageRuntime, visualizationRuntime);
    const initRuntime = new DistrictInitializationRuntime(resolver, workflow);
    const previewRuntime = new SalesPreviewRuntime(initRuntime);

    const request = {
      initializationId: "init-e2e-001",
      districtName: "三重県第3区",
      requester: "sales-flow",
      requestedAt: new Date().toISOString()
    };

    const previewModel = await previewRuntime.requestDemoPreview(request, { baseDir: TEST_DIR });

    assert(previewModel.districtName === "三重県第3区", "Sales preview should map resolved district.");
    assert(previewModel.areaStatus === "READY", "E2E: Area status matches.");
    assert(previewModel.municipalities.length === 3, "E2E: Municipality list resolved dynamically.");
    assert(previewModel.turnoutOverview.find(t => t.name === "桑名市") !== undefined, "E2E: Turnout metrics resolved.");
    assert(previewModel.visualizationFeatures.find(f => f.municipalityCode === "24205") !== undefined, "E2E: Geo mapping resolved.");

    console.log("✅ Scenario 8 Passed.\n");
  }

  console.log("🎉 All District Master Foundation Tests completed successfully!");
}

runTests().catch(err => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
