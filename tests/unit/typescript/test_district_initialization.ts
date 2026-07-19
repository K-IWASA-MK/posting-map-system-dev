import * as fs from "fs";
import * as path from "path";
import { DistrictInitializationRuntime } from "../../../domains/posting-map/initialization/runtime/DistrictInitializationRuntime";
import { DistrictInitializationWorkflow } from "../../../domains/posting-map/initialization/models/DistrictInitializationWorkflow";
import { StaticDistrictResolver } from "../../../domains/posting-map/initialization/contracts/DistrictResolver";
import { PostingAreaRuntime } from "../../../domains/posting-map/area/runtime/PostingAreaRuntime";
import { ElectionDashboardStorageRuntime } from "../../../domains/election/storage/runtime/ElectionDashboardStorageRuntime";
import { PostingMapVisualizationRuntime } from "../../../domains/posting-map/visualization/runtime/PostingMapVisualizationRuntime";
import { InitializationEvent } from "../../../domains/posting-map/initialization/contracts/DistrictInitializationContract";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const TEST_DIR = path.join(__dirname, "../../../scratch/test-initialization-sprint");

function setupDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function runTests() {
  console.log("🧪 Running District Initialization Tests...\n");

  // Setup Runtimes & Workflow & Resolver
  const resolver = new StaticDistrictResolver();
  const areaRuntime = new PostingAreaRuntime();
  const storageRuntime = new ElectionDashboardStorageRuntime();
  const visualizationRuntime = new PostingMapVisualizationRuntime();
  const workflow = new DistrictInitializationWorkflow(resolver, areaRuntime, storageRuntime, visualizationRuntime);
  
  // Scenario 1: Normal Initialization
  // ==========================================
  {
    console.log("Scenario 1: Normal initialization with resolved Mie 3rd district...");
    setupDirs();
    const runtime = new DistrictInitializationRuntime(resolver, workflow);

    const events: InitializationEvent[] = [];
    runtime.subscribe(ev => events.push(ev));

    const request = {
      initializationId: "init-id-001",
      districtName: "三重県第3区",
      requester: "sales-demo",
      requestedAt: new Date().toISOString()
    };

    const result = await runtime.initializeDistrict(request, { baseDir: TEST_DIR });
    
    assert(result.status === "READY", "Initialization must succeed with READY.");
    assert(result.resources.length === 2, "Should create 2 resources (areas.json & dashboard.json).");
    assert(events.length > 0, "Events should be dispatched.");
    
    // Check sequence of events
    assert(events[0].type === "POSTING_MAP_INITIALIZATION_STARTED", "First event must be STARTED.");
    assert(events[1].type === "POSTING_MAP_DISTRICT_RESOLVED", "Second event must be RESOLVED.");
    assert(events[2].type === "POSTING_MAP_AREA_READY", "Third event must be AREA_READY.");
    assert(events[3].type === "POSTING_MAP_DASHBOARD_READY", "Fourth event must be DASHBOARD_READY.");
    assert(events[4].type === "POSTING_MAP_VISUALIZATION_READY", "Fifth event must be VISUALIZATION_READY.");
    assert(events[5].type === "POSTING_MAP_INITIALIZATION_COMPLETED", "Final event must be COMPLETED.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // Scenario 2: Municipality lookup and resolve
  // ==========================================
  {
    console.log("Scenario 2: Resolve district municipalities...");
    const resolved = resolver.resolve("三重県第3区");
    assert(resolved.districtId === "mie-03", "District ID must resolve to mie-03.");
    assert(resolved.municipalities.length === 3, "Should resolve 3 municipalities.");
    assert(resolved.municipalities[0].name === "桑名市", "First municipality should be 桑名市.");
    assert(resolved.municipalities[1].name === "いなべ市", "Second municipality should be いなべ市.");
    assert(resolved.municipalities[2].name === "四日市市", "Third municipality should be 四日市市.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // Scenario 3: Area Master integration verify
  // ==========================================
  {
    console.log("Scenario 3: Verify Area Master generated file...");
    const areasFile = path.join(TEST_DIR, "三重県第3区/areas.json");
    assert(fs.existsSync(areasFile), "areas.json must be created.");
    const areasData = JSON.parse(fs.readFileSync(areasFile, "utf-8"));
    assert(Array.isArray(areasData), "areas.json must contain an array of areas.");
    assert(areasData.length > 0, "areas list should not be empty.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // Scenario 4: Dashboard Integration
  // ==========================================
  {
    console.log("Scenario 4: Verify Dashboard storage generated file...");
    const dbFile = path.join(TEST_DIR, "三重県第3区/dashboard.json");
    assert(fs.existsSync(dbFile), "dashboard.json must be created.");
    const dbData = JSON.parse(fs.readFileSync(dbFile, "utf-8"));
    assert(dbData.storageId === "storage-mie-03", "dashboard data should have expected storageId.");

    console.log("✅ Scenario 4 Passed.\n");
  }

  // Scenario 5: Visualization integration & Preview verify
  // ==========================================
  {
    console.log("Scenario 5: Verify Preview API and statuses...");
    const runtime = new DistrictInitializationRuntime(resolver, workflow);
    const preview = runtime.getPreview("三重県第3区", TEST_DIR);
    
    assert(preview.district === "三重県第3区", "Preview district match.");
    assert(preview.areaStatus === "READY", "Area status should be READY.");
    assert(preview.dashboardStatus === "READY", "Dashboard status should be READY.");
    assert(preview.visualizationStatus === "READY", "Visualization status should be READY.");

    console.log("✅ Scenario 5 Passed.\n");
  }

  // Scenario 6: Replay Protection
  // ==========================================
  {
    console.log("Scenario 6: Verify Replay Protection blocks duplicate initializationId...");
    const freshAreaRuntime = new PostingAreaRuntime();
    const freshStorageRuntime = new ElectionDashboardStorageRuntime();
    const freshVisualizationRuntime = new PostingMapVisualizationRuntime();
    const freshWorkflow = new DistrictInitializationWorkflow(resolver, freshAreaRuntime, freshStorageRuntime, freshVisualizationRuntime);
    const runtime = new DistrictInitializationRuntime(resolver, freshWorkflow);
    
    const request = {
      initializationId: "init-id-dup",
      districtName: "三重県第3区",
      requester: "sales",
      requestedAt: new Date().toISOString()
    };

    const res1 = await runtime.initializeDistrict(request, { baseDir: TEST_DIR });
    assert(res1.status === "READY", "First initialization succeeds.");

    // Second execution with same ID
    const res2 = await runtime.initializeDistrict(request, { baseDir: TEST_DIR });
    assert(res2.status === "FAILED", "Second initialization must be blocked.");
    assert(res2.error!.includes("Replay Protection Violation"), "Error message should mention Replay Protection.");

    console.log("✅ Scenario 6 Passed.\n");
  }

  // Scenario 7: Unknown District
  // ==========================================
  {
    console.log("Scenario 7: Unknown district failure...");
    const freshAreaRuntime = new PostingAreaRuntime();
    const freshStorageRuntime = new ElectionDashboardStorageRuntime();
    const freshVisualizationRuntime = new PostingMapVisualizationRuntime();
    const freshWorkflow = new DistrictInitializationWorkflow(resolver, freshAreaRuntime, freshStorageRuntime, freshVisualizationRuntime);
    const runtime = new DistrictInitializationRuntime(resolver, freshWorkflow);
    
    const request = {
      initializationId: "init-id-fail",
      districtName: "存在しない選挙区",
      requester: "sales",
      requestedAt: new Date().toISOString()
    };

    const result = await runtime.initializeDistrict(request, { baseDir: TEST_DIR });
    assert(result.status === "FAILED", "Must fail with FAILED status.");
    assert(result.error!.includes("Unknown or unsupported district"), "Error should explain unknown district.");

    console.log("✅ Scenario 7 Passed.\n");
  }

  console.log("🎉 All District Initialization tests completed successfully!");
}

runTests().catch(err => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
