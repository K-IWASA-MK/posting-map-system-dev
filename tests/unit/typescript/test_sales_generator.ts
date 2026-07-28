import * as fs from "fs";
import * as path from "path";
import { SalesGeneratorApp } from "../../../projects/posting-map/apps/posting-map-generator/SalesGeneratorApp";
import { SalesGeneratorEvent } from "../../../projects/posting-map/apps/posting-map-generator/SalesGeneratorEvents";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

const TEST_DIR = path.join(__dirname, "../../../scratch/test-sales-generator");

function setupDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

async function runTests() {
  console.log("🧪 Running Sales Generator Application Integration Tests...\n");

  // Mock global document if running in Node context to allow mounting
  if (typeof (global as any).document === "undefined") {
    (global as any).document = {
      getElementById: (id: string) => {
        return {
          innerHTML: "",
          querySelector: () => {
            const listeners: Record<string, Function[]> = {};
            return {
              addEventListener: (type: string, cb: Function) => {
                if (!listeners[type]) listeners[type] = [];
                listeners[type].push(cb);
              },
              dispatchEvent: (event: any) => {
                const type = event.type;
                if (listeners[type]) {
                  listeners[type].forEach(cb => cb());
                }
              },
              classList: { remove: () => {}, add: () => {} },
              disabled: false
            };
          },
          querySelectorAll: () => []
        };
      }
    };
  }

  // Scenario 1: Verify normal starting flow for 三重県第3区
  // ========================================================
  {
    console.log("Scenario 1: Starting generation flow for 三重県第3区...");
    setupDirs();
    
    const app = new SalesGeneratorApp(TEST_DIR);
    app.mount({
      inputContainerId: "input-container",
      progressContainerId: "progress-container",
      previewContainerId: "preview-container"
    });

    const vm = app.getViewModel();
    const runtime = app.getRuntime();

    const events: SalesGeneratorEvent[] = [];
    runtime.subscribe(ev => events.push(ev));

    await runtime.generate("三重県第3区", vm);

    assert(vm.status === "completed", "Generation status should be completed.");
    assert(vm.progress === 100, "Progress should reach 100%.");
    assert(vm.completedTasks.includes("Complete"), "Checklist should contain 'Complete'.");
    assert(vm.previewReady === true, "Preview status is READY.");
    assert(vm.session !== null, "Session should be populated.");
    assert(vm.session!.status === "COMPLETED", "Session status is COMPLETED.");
    assert(vm.session!.districtId === "mie-03", "Mapped district ID mie-03 correctly.");
    assert(events.length > 0, "Progress events must be dispatched.");
    assert(events[0].type === "GENERATION_STARTED", "First event is GENERATION_STARTED.");
    assert(events[events.length - 1].type === "GENERATION_COMPLETED", "Last event is GENERATION_COMPLETED.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // Scenario 2 & 4: Progress updates and execution checkpoints for 埼玉県第8区
  // =========================================================================
  {
    console.log("Scenario 2 & 4: Verifying step-by-step progress events for 埼玉県第8区...");
    setupDirs();

    const app = new SalesGeneratorApp(TEST_DIR);
    const vm = app.getViewModel();
    const runtime = app.getRuntime();

    const progressLogs: { progress: number; currentTask: string }[] = [];
    runtime.subscribe((ev) => {
      if (ev.type === "GENERATION_PROGRESS") {
        progressLogs.push({ progress: ev.progress, currentTask: ev.currentTask });
      }
    });

    await runtime.generate("埼玉県第8区", vm);

    assert(vm.status === "completed", "Flow completed successfully.");
    assert(vm.session!.districtId === "saitama-08", "Mapped district ID to saitama-08.");

    // Check progress transitions (real-time checklist checkoff points)
    assert(progressLogs.length > 0, "Should dispatch multiple progress update events.");
    const progressValues = progressLogs.map(l => l.progress);
    assert(progressValues.includes(10), "Acquisition task progress (10%) emitted.");
    assert(progressValues.includes(30), "Master resolution progress (30%) emitted.");
    assert(progressValues.includes(45), "Area Generation task progress (45%) emitted.");

    console.log("✅ Scenario 2 & 4 Passed.\n");
  }

  // Scenario 3: Non-existent district error block
  // ==============================================
  {
    console.log("Scenario 3: Verifying failed flow for non-existent district name...");
    setupDirs();

    const app = new SalesGeneratorApp(TEST_DIR);
    const vm = app.getViewModel();
    const runtime = app.getRuntime();

    const events: SalesGeneratorEvent[] = [];
    runtime.subscribe(ev => events.push(ev));

    await runtime.generate("存在しない選挙区", vm);

    assert(vm.status === "failed", "Status should transition to failed.");
    assert(vm.error !== null && (vm.error.includes("Unknown or unsupported district") || vm.error.includes("District could not be resolved")), "Should capture resolver error message.");
    assert(vm.previewReady === false, "Preview is disabled.");
    assert(vm.session!.status === "FAILED", "Session status transitions to FAILED.");
    assert(events[events.length - 1].type === "GENERATION_FAILED", "Should dispatch GENERATION_FAILED event.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // Scenario 5: Dashboard Preview Launch Verification
  // ==================================================
  {
    console.log("Scenario 5: Launching Dashboard Preview validation...");
    setupDirs();

    const app = new SalesGeneratorApp(TEST_DIR);
    app.mount({
      inputContainerId: "input-container",
      progressContainerId: "progress-container",
      previewContainerId: "preview-container"
    });
    const vm = app.getViewModel();
    const runtime = app.getRuntime();

    await runtime.generate("三重県第3区", vm);

    let launchTarget: string = "";
    let launchDistrict: string = "";

    // Simulate clicking launch preview
    const launcher = app["previewLauncher"];
    launcher.onLaunch((target, dist) => {
      launchTarget = target;
      launchDistrict = dist;
    });

    launcher["previewBtn"]!.dispatchEvent(new Event("click"));

    assert(launchTarget === "dashboard", "Target is dashboard.");
    assert(launchDistrict === "三重県第3区", "Launched for三重県第3区.");

    console.log("✅ Scenario 5 Passed.\n");
  }

  console.log("🎉 All Sales Generator Application Tests completed successfully!");
}

runTests().catch(err => {
  console.error("❌ Test execution failed:", err);
  process.exit(1);
});
