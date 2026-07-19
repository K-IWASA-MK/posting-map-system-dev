import * as fs from "fs";
import * as path from "path";
import { SalesPreviewRuntime } from "../../../apps/posting-map-sales-preview/runtime/SalesPreviewRuntime";
import { DistrictInitializationRuntime } from "../../../domains/posting-map/initialization/runtime/DistrictInitializationRuntime";
import { DistrictInitializationWorkflow } from "../../../domains/posting-map/initialization/models/DistrictInitializationWorkflow";
import { StaticDistrictResolver } from "../../../domains/posting-map/initialization/contracts/DistrictResolver";
import { PostingAreaRuntime } from "../../../domains/posting-map/area/runtime/PostingAreaRuntime";
import { ElectionDashboardStorageRuntime } from "../../../domains/election/storage/runtime/ElectionDashboardStorageRuntime";
import { PostingMapVisualizationRuntime } from "../../../domains/posting-map/visualization/runtime/PostingMapVisualizationRuntime";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const TEST_DIR = path.join(__dirname, "../../../scratch/test-sales-preview-sprint");

function setupDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function runTests() {
  console.log("🧪 Running Sales Preview Application Foundation Tests...\n");

  const resolver = new StaticDistrictResolver();
  const areaRuntime = new PostingAreaRuntime();
  const storageRuntime = new ElectionDashboardStorageRuntime();
  const visualizationRuntime = new PostingMapVisualizationRuntime();
  const workflow = new DistrictInitializationWorkflow(resolver, areaRuntime, storageRuntime, visualizationRuntime);
  const initRuntime = new DistrictInitializationRuntime(resolver, workflow);

  // Scenario 1: Mie 3rd District Preview
  // ==========================================
  {
    console.log("Scenario 1: Verify Mie 3rd district sales preview is READY...");
    setupDirs();
    const runtime = new SalesPreviewRuntime(initRuntime);

    const request = {
      initializationId: "init-sales-001",
      districtName: "三重県第3区",
      requester: "sales-person",
      requestedAt: new Date().toISOString()
    };

    const previewModel = await runtime.requestDemoPreview(request, { baseDir: TEST_DIR });
    
    assert(previewModel.areaStatus === "READY", "Area status should be READY.");
    assert(previewModel.dashboardStatus === "READY", "Dashboard status should be READY.");
    assert(previewModel.visualizationStatus === "READY", "Visualization status should be READY.");
    assert(previewModel.districtName === "三重県第3区", "District name match.");
    assert(previewModel.previewId.startsWith("preview-"), "Preview ID should be populated.");
    assert(previewModel.traceId.length === 32, "Trace ID should be 32-hex chars.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // Scenario 2: Municipality List Display
  // ==========================================
  {
    console.log("Scenario 2: Verify municipality list display...");
    const runtime = new SalesPreviewRuntime(initRuntime);
    const previewModel = runtime.getPreview("三重県第3区", TEST_DIR);

    assert(previewModel.municipalities.length === 3, "Should display 3 municipalities.");
    assert(previewModel.municipalities.includes("桑名市"), "Should include 桑名市.");
    assert(previewModel.municipalities.includes("いなべ市"), "Should include いなべ市.");
    assert(previewModel.municipalities.includes("四日市市"), "Should include 四日市市.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // Scenario 3: Turnout Display
  // ==========================================
  {
    console.log("Scenario 3: Verify turnout percentages display...");
    const runtime = new SalesPreviewRuntime(initRuntime);
    const previewModel = runtime.getPreview("三重県第3区", TEST_DIR);

    const national = previewModel.turnoutOverview.find(t => t.name === "全国");
    assert(national !== undefined, "Should have National turnout info.");
    assert(national!.turnout === 52.4, "National turnout value match.");

    const district = previewModel.turnoutOverview.find(t => t.name === "三重県第3区");
    assert(district !== undefined, "Should have District turnout info.");
    assert(district!.turnout === 53.1, "District turnout value match.");

    const kuwana = previewModel.turnoutOverview.find(t => t.name === "桑名市");
    assert(kuwana !== undefined, "Should have Kuwana turnout info.");
    assert(kuwana!.turnout === 51.5, "Kuwana turnout value match.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // Scenario 4: Color Coding Verification
  // ==========================================
  {
    console.log("Scenario 4: Verify turnout status color mapping (Color Preservation)...");
    const runtime = new SalesPreviewRuntime(initRuntime);
    const previewModel = runtime.getPreview("三重県第3区", TEST_DIR);

    const district = previewModel.turnoutOverview.find(t => t.name === "三重県第3区");
    assert(district!.colorStatus === "GREEN", "District color status match.");

    const kuwana = previewModel.turnoutOverview.find(t => t.name === "桑名市");
    assert(kuwana!.colorStatus === "YELLOW", "Kuwana color status match.");

    console.log("✅ Scenario 4 Passed.\n");
  }

  // Scenario 5: Visualization Feature Mapping
  // ==========================================
  {
    console.log("Scenario 5: Verify visualization features mapping...");
    const runtime = new SalesPreviewRuntime(initRuntime);
    const previewModel = runtime.getPreview("三重県第3区", TEST_DIR);

    assert(previewModel.visualizationFeatures.length === 3, "Should map 3 features.");
    
    // Check Kuwana mapping
    const kuwanaFeat = previewModel.visualizationFeatures.find(f => f.municipalityCode === "24205");
    assert(kuwanaFeat !== undefined, "Kuwana feature exists.");
    assert(kuwanaFeat!.geometryId === "geom-24205", "geometryId matches code.");
    assert(kuwanaFeat!.colorStatus === "YELLOW", "colorStatus preserved.");
    assert(kuwanaFeat!.fillColor === "YELLOW", "fillColor matches colorStatus.");

    console.log("✅ Scenario 5 Passed.\n");
  }

  // Scenario 6: Read-Only (Object Frozen)
  // ==========================================
  {
    console.log("Scenario 6: Verify Read-Only immutability...");
    const runtime = new SalesPreviewRuntime(initRuntime);
    const previewModel = runtime.getPreview("三重県第3区", TEST_DIR);

    assert(Object.isFrozen(previewModel), "Model object must be frozen.");
    assert(Object.isFrozen(previewModel.turnoutOverview), "turnoutOverview list must be frozen.");
    assert(Object.isFrozen(previewModel.visualizationFeatures), "visualizationFeatures list must be frozen.");

    // Try modifying (throws TypeError in strict mode / TS compile block, but let's check it throws at runtime)
    try {
      (previewModel as any).districtName = "Modified District";
      throw new Error("Should have thrown TypeError.");
    } catch (err: any) {
      assert(err instanceof TypeError, "Mutating frozen property must throw TypeError.");
    }

    console.log("✅ Scenario 6 Passed.\n");
  }

  // Scenario 7: Hash Integrity
  // ==========================================
  {
    console.log("Scenario 7: Verify Hash Integrity check on tampered files...");
    const runtime = new SalesPreviewRuntime(initRuntime);

    const dbFile = path.join(TEST_DIR, "三重県第3区/dashboard.json");
    const originalContent = fs.readFileSync(dbFile, "utf-8");

    try {
      // Modify dashboard turnout values directly in the file (tampering)
      const data = JSON.parse(originalContent);
      data.data.nationalTurnout = 99.9; // Tampered value
      fs.writeFileSync(dbFile, JSON.stringify(data), "utf-8");

      // Verify that getPreview throws validation error due to mismatching hash
      try {
        runtime.getPreview("三重県第3区", TEST_DIR);
        throw new Error("Should have thrown validation error.");
      } catch (err: any) {
        assert(err.message.includes("tampered with"), "Validation error must mention tampering.");
      }
    } finally {
      // Restore file
      fs.writeFileSync(dbFile, originalContent, "utf-8");
    }

    console.log("✅ Scenario 7 Passed.\n");
  }

  // Scenario 8: Direct Write Attempt
  // ==========================================
  {
    console.log("Scenario 8: Verify Sales Preview runtime exposes no mutation APIs...");
    const runtime = new SalesPreviewRuntime(initRuntime);
    
    // Validate that update or mutation methods do not exist
    assert((runtime as any).updateAreaStatus === undefined, "Should not expose write APIs.");
    assert((runtime as any).processStorage === undefined, "Should not expose storage write APIs.");

    console.log("✅ Scenario 8 Passed.\n");
  }

  console.log("🎉 All Sales Preview Tests completed successfully!");
}

runTests().catch(err => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
