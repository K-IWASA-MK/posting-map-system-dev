import * as fs from "fs";
import * as path from "path";
import { DistrictMasterRuntime } from "../../../domains/posting-map/district/runtime/DistrictMasterRuntime";
import { DistrictMasterRepository } from "../../../domains/posting-map/district/storage/DistrictMasterRepository";
import { DistrictMasterResolver } from "../../../domains/posting-map/district/resolver/DistrictMasterResolver";
import { DistrictInitializationRuntime } from "../../../domains/posting-map/initialization/runtime/DistrictInitializationRuntime";
import { DistrictInitializationWorkflow } from "../../../domains/posting-map/initialization/models/DistrictInitializationWorkflow";
import { PostingAreaRuntime } from "../../../domains/posting-map/area/runtime/PostingAreaRuntime";
import { ElectionDashboardStorageRuntime } from "../../../domains/election/storage/runtime/ElectionDashboardStorageRuntime";
import { PostingMapVisualizationRuntime } from "../../../domains/posting-map/visualization/runtime/PostingMapVisualizationRuntime";
import { DashboardRuntime } from "../../../domains/posting-map/dashboard/runtime/DashboardRuntime";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const TEST_DIR = path.join(__dirname, "../../../scratch/test-dashboard-runtime-sprint");
const REGISTRY_FILE = path.join(TEST_DIR, "district-registry.json");

function setupDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function runTests() {
  console.log("🧪 Running Dashboard Runtime Integration Foundation Tests...\n");

  setupDirs();

  // Step 1: Register and Initialize Mie 3rd District
  const masterRuntime = new DistrictMasterRuntime(REGISTRY_FILE);
  await masterRuntime.registerDistrict({
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

  const repository = new DistrictMasterRepository();
  const resolver = new DistrictMasterResolver(repository, REGISTRY_FILE);

  const areaRuntime = new PostingAreaRuntime();
  const storageRuntime = new ElectionDashboardStorageRuntime();
  const visualizationRuntime = new PostingMapVisualizationRuntime();
  const workflow = new DistrictInitializationWorkflow(resolver, areaRuntime, storageRuntime, visualizationRuntime);
  const initRuntime = new DistrictInitializationRuntime(resolver, workflow);

  const initRequest = {
    initializationId: "init-dash-001",
    districtName: "三重県第3区",
    requester: "operator",
    requestedAt: new Date().toISOString()
  };

  // Perform E2E domain initialization to write dashboard.json and areas.json to TEST_DIR
  await initRuntime.initializeDistrict(initRequest, { baseDir: TEST_DIR });

  // Scenario 1: Verify district and municipalities loaded
  // =======================================================
  {
    console.log("Scenario 1: Verify district and municipalities list loading...");
    const runtime = new DashboardRuntime();
    const viewModel = runtime.getDashboardView("三重県第3区", TEST_DIR);

    assert(viewModel.districtId === "mie-03", "districtId maps correctly.");
    assert(viewModel.districtName === "三重県第3区", "districtName maps correctly.");
    assert(viewModel.municipalities.length === 3, "Contains 3 municipalities.");
    assert(viewModel.municipalities.some(m => m.name === "桑名市"), "Contains Kuwana.");
    assert(viewModel.municipalities.some(m => m.name === "いなべ市"), "Contains Inabe.");
    assert(viewModel.municipalities.some(m => m.name === "四日市市"), "Contains Yokkaichi.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // Scenario 2: Turnout percentage validation
  // =======================================================
  {
    console.log("Scenario 2: Verify national, district, and municipal turnout stats...");
    const runtime = new DashboardRuntime();
    const viewModel = runtime.getDashboardView("三重県第3区", TEST_DIR);

    assert(viewModel.election.nationalTurnout === 52.4, "National turnout is 52.4%.");
    assert(viewModel.election.districtTurnout === 53.1, "District turnout is 53.1%.");

    const kuwana = viewModel.municipalities.find(m => m.name === "桑名市");
    assert(kuwana !== undefined, "Kuwana is mapped.");
    assert(kuwana!.turnout === 51.5, "Kuwana turnout is 51.5%.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // Scenario 3: Color preserver verification
  // =======================================================
  {
    console.log("Scenario 3: Verify color coding status and preservation mapping...");
    const runtime = new DashboardRuntime();
    const viewModel = runtime.getDashboardView("三重県第3区", TEST_DIR);

    const kuwana = viewModel.municipalities.find(m => m.name === "桑名市");
    assert(kuwana!.colorStatus === "YELLOW", "Kuwana is YELLOW coded.");

    const feature = viewModel.mapFeatures.find(f => f.municipalityCode === "24205");
    assert(feature !== undefined, "Kuwana map feature exists.");
    assert(feature!.geometryId === "geom-24205", "geometryId is geom-24205.");
    assert(feature!.fillColor === "YELLOW", "fillColor preservation match colorStatus.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // Scenario 4: Area summary metrics integration
  // =======================================================
  {
    console.log("Scenario 4: Verify area sync status (total, completed, progress)...");
    const runtime = new DashboardRuntime();
    const viewModel = runtime.getDashboardView("三重県第3区", TEST_DIR);

    // Initial state: total chunks created = 3, completed = 0, progress = 0%
    assert(viewModel.areaSummary.total === 3, "Total areas chunks.");
    assert(viewModel.areaSummary.completed === 0, "Completed areas chunks.");
    assert(viewModel.areaSummary.progress === 0, "Progress ratio maps to 0%.");

    console.log("✅ Scenario 4 Passed.\n");
  }

  // Scenario 5: Hash integrity tampering block
  // =======================================================
  {
    console.log("Scenario 5: Verify hash integrity verification and tampering block...");
    const runtime = new DashboardRuntime();

    const dbFile = path.join(TEST_DIR, "三重県第3区/dashboard.json");
    const originalContent = fs.readFileSync(dbFile, "utf-8");

    try {
      // Modify dashboard turnout values directly in the file (tampering)
      const parsed = JSON.parse(originalContent);
      parsed.data.nationalTurnout = 99.9; // Tampered value
      fs.writeFileSync(dbFile, JSON.stringify(parsed), "utf-8");

      try {
        runtime.getDashboardView("三重県第3区", TEST_DIR);
        throw new Error("Should have thrown validation error.");
      } catch (err: any) {
        assert(err.message.includes("tampered with"), "Validation error must block tampered file.");
      }
    } finally {
      // Restore file
      fs.writeFileSync(dbFile, originalContent, "utf-8");
    }

    console.log("✅ Scenario 5 Passed.\n");
  }

  console.log("🎉 All Dashboard Runtime Tests completed successfully!");
}

runTests().catch(err => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
