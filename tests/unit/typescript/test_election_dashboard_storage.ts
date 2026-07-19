import * as fs from "fs";
import * as path from "path";
import { ElectionTurnoutViewModel } from "../../../domains/election/consumer/contracts/ElectionDashboardConsumerContract";
import { ElectionDashboardStorageRuntime } from "../../../domains/election/storage/runtime/ElectionDashboardStorageRuntime";
import { ElectionDashboardStorageReader } from "../../../domains/election/storage/reader/ElectionDashboardStorageReader";
import { ElectionDashboardDeliveryAdapter } from "../../../domains/election/storage/adapters/ElectionDashboardDeliveryAdapter";
import { ReleaseRuntime } from "../../../aios/release/runtime/ReleaseRuntime";
import { StorageEvent } from "../../../domains/election/storage/contracts/ElectionDashboardStorageContract";

const TEST_DIR = path.join(__dirname, "../../../scratch/test-storage-sprint");
const DESTINATION_FILE = path.join(TEST_DIR, "election-dashboard-data.json");
const MOCK_MASTER_DIR = path.join(__dirname, "../../../domains/election/master");

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function cleanDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function setupDirs() {
  cleanDirs();
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

// A simple local subscriber helper to gather events
class StorageEventTracker {
  public readonly events: StorageEvent[] = [];
  public track(event: StorageEvent) {
    this.events.push(event);
  }
}

async function runTests() {
  console.log("🧪 Running Election Dashboard Storage & Delivery Tests...\n");

  const runtime = new ElectionDashboardStorageRuntime();
  const tracker = new StorageEventTracker();
  runtime.subscribe(ev => tracker.track(ev));

  const mockViewModel: ElectionTurnoutViewModel = {
    sourceType: "TURNOUT_DASHBOARD_PROJECTION",
    electionId: "election-2026-house",
    electionDate: "2026-10-25",
    nationalTurnout: 55.5,
    districts: [
      {
        id: "mie-03",
        name: "三重県第3区",
        turnout: 52.8,
        difference: -2.7,
        colorStatus: "YELLOW"
      }
    ],
    municipalities: [
      {
        code: "24205",
        name: "桑名市",
        districtId: "mie-03",
        turnout: 57.1,
        national: 55.5,
        difference: 1.6,
        colorStatus: "YELLOW"
      }
    ],
    lineageHash: "af1d13e32129aad538849f5810525e6b03d37819af1d13e32129aad538849f58",
    lastUpdated: "2026-07-19T09:11:00Z"
  };

  // ==========================================
  // Scenario 1: Normal Storage Flow
  // ==========================================
  {
    console.log("Scenario 1: Process normal storage flow...");
    setupDirs();
    tracker.events.length = 0;

    const res = await runtime.processStorage("storage-001", "1", mockViewModel, DESTINATION_FILE);
    if (res.status !== "SUCCESS") {
      console.error("Storage processing failed with error:", res.error);
    }
    assert(res.status === "SUCCESS", "Storage processing must succeed.");
    assert(res.storage !== undefined, "Storage output must be defined.");
    assert(fs.existsSync(DESTINATION_FILE), "Target output JSON must exist.");

    // Verify storage event emitted
    assert(tracker.events.length === 1, "Should emit exactly 1 success event.");
    assert(tracker.events[0].type === "ELECTION_DASHBOARD_STORAGE_UPDATED", "Event type should be UPDATED.");
    assert(tracker.events[0].storageId === "storage-001", "Event storageId should match.");
    assert(tracker.events[0].version === "1", "Event version should match.");
    assert(tracker.events[0].hash !== undefined, "Event hash must be defined.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // ==========================================
  // Scenario 2: Hash Verification
  // ==========================================
  {
    console.log("Scenario 2: Verify SHA-256 hashes...");
    const reader = new ElectionDashboardStorageReader();
    const storageModel = reader.read(DESTINATION_FILE);

    assert(storageModel.metadata.sourceLineageHash === mockViewModel.lineageHash, "sourceLineageHash must match lineageHash.");
    assert(storageModel.metadata.contentHash !== undefined, "contentHash must be present.");
    assert(storageModel.metadata.contentHash.length === 64, "contentHash must be a valid SHA-256 string.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // ==========================================
  // Scenario 3: Corruption Detection
  // ==========================================
  {
    console.log("Scenario 3: Corrupt turnout value and verify block...");
    tracker.events.length = 0;
    
    // Corrupt the turnout value in the JSON file
    const content = fs.readFileSync(DESTINATION_FILE, "utf8");
    const parsed = JSON.parse(content);
    parsed.data.nationalTurnout = 120; // range out of bounds [0, 100]

    fs.writeFileSync(DESTINATION_FILE, JSON.stringify(parsed), "utf8");

    const reader = new ElectionDashboardStorageReader();
    let throws = false;
    try {
      reader.read(DESTINATION_FILE);
    } catch (err: any) {
      throws = true;
      assert(err.message.includes("Validation failed"), "Should complain about validation fail.");
    }
    assert(throws === true, "Reader must throw error for corrupted file.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // ==========================================
  // Scenario 4: Replay Safety
  // ==========================================
  {
    console.log("Scenario 4: Validate Replay Safety...");
    setupDirs();
    runtime.clearCache();
    tracker.events.length = 0;

    // 1. Process first storage version 1
    const res1 = await runtime.processStorage("storage-001", "1", mockViewModel, DESTINATION_FILE);
    assert(res1.status === "SUCCESS", "Initial process must succeed.");

    // 2. Process same version 1 (should be skipped)
    const res2 = await runtime.processStorage("storage-001", "1", mockViewModel, DESTINATION_FILE);
    assert(res2.status === "SKIPPED", "Same version replay must be skipped.");

    // 3. Process lower version 0 (should be skipped)
    const res3 = await runtime.processStorage("storage-001", "0", mockViewModel, DESTINATION_FILE);
    assert(res3.status === "SKIPPED", "Lower version replay must be skipped.");

    // 4. Process higher version 2 (should succeed)
    const res4 = await runtime.processStorage("storage-001", "2", mockViewModel, DESTINATION_FILE);
    assert(res4.status === "SUCCESS", "Higher version must succeed.");

    console.log("✅ Scenario 4 Passed.\n");
  }

  // ==========================================
  // Scenario 5: Delivery Boundary Check
  // ==========================================
  {
    console.log("Scenario 5: Check delivery adapter bounds...");
    const releaseWorkspace = path.join(TEST_DIR, "release-ws");
    fs.mkdirSync(releaseWorkspace, { recursive: true });

    const releaseRuntime = new ReleaseRuntime(releaseWorkspace);
    const deliveryAdapter = new ElectionDashboardDeliveryAdapter();

    const reader = new ElectionDashboardStorageReader();
    // Re-write a valid storage first
    setupDirs();
    runtime.clearCache();
    const runRes = await runtime.processStorage("storage-005", "1", mockViewModel, DESTINATION_FILE);
    const storageModel = reader.read(DESTINATION_FILE);

    // Verify delivery adapter bridges to processRelease correctly
    const releaseRes = await deliveryAdapter.deliver(DESTINATION_FILE, storageModel, releaseRuntime);
    
    // Check that we didn't bypass or operate directly on git/deploy inside deliveryAdapter,
    // instead passing straight request down to ReleaseRuntime.
    assert(releaseRes !== undefined, "Should return release result from ReleaseRuntime.");
    assert(releaseRes.releaseId === "storage-005", "Release ID in result matches storageId.");

    console.log("✅ Scenario 5 Passed.\n");
  }

  // ==========================================
  // Scenario 6: Immutable Protection (Deep Freeze)
  // ==========================================
  {
    console.log("Scenario 6: Verify Immutable deep freeze protection...");
    const reader = new ElectionDashboardStorageReader();
    const storage = reader.read(DESTINATION_FILE);

    let throwsMetadata = false;
    try {
      (storage.metadata as any).contentHash = "alteredHash";
    } catch (err: any) {
      throwsMetadata = true;
    }
    assert(throwsMetadata === true, "Modifying metadata properties must throw TypeError.");

    let throwsMuni = false;
    try {
      (storage.data.municipalities[0] as any).turnout = 99.9;
    } catch (err: any) {
      throwsMuni = true;
    }
    assert(throwsMuni === true, "Modifying nested municipalities properties must throw TypeError.");

    console.log("✅ Scenario 6 Passed.\n");
  }

  // ==========================================
  // Scenario 7: Storage Boundary Violation
  // ==========================================
  {
    console.log("Scenario 7: Verify Storage Boundary Violation prevention...");

    // Record modified time of the master contract if it exists
    const masterPath = path.join(MOCK_MASTER_DIR, "contracts/ElectionMasterContract.ts");
    let initialMtime = 0;
    if (fs.existsSync(masterPath)) {
      initialMtime = fs.statSync(masterPath).mtimeMs;
    }

    // Run storage runtime pipeline
    await runtime.processStorage("storage-boundary-test", "1", mockViewModel, DESTINATION_FILE);

    // Verify that master file is completely untouched
    if (fs.existsSync(masterPath)) {
      const currentMtime = fs.statSync(masterPath).mtimeMs;
      assert(currentMtime === initialMtime, "Storage processing must NOT write to or modify ElectionMaster files.");
    }

    console.log("✅ Scenario 7 Passed.\n");
  }

  console.log("🎉 All Election Dashboard Storage & Delivery tests completed successfully!");
}

try {
  runTests();
} catch (err) {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
}
