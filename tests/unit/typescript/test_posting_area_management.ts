import * as fsReal from "fs";
import * as path from "path";
import { ImportAddressEntry, PostingAreaImportService } from "../../../domains/posting-map/area/import/PostingAreaImportService";
import { PostingAreaRuntime } from "../../../domains/posting-map/area/runtime/PostingAreaRuntime";
import { AreaMasterEvent } from "../../../domains/posting-map/area/contracts/AreaMasterContract";
import { ElectionMasterSchema } from "../../../domains/election/master/contracts/ElectionMasterContract";
import { PostingAreaValidator } from "../../../domains/posting-map/area/validation/PostingAreaValidator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class TestEventTracker {
  public readonly events: AreaMasterEvent[] = [];
  public track(event: AreaMasterEvent) {
    this.events.push(event);
  }
}

const TEST_DIR = path.join(__dirname, "../../../scratch/test-area-sprint");
const DESTINATION_FILE = path.join(TEST_DIR, "area-master-data.json");

function setupDirs() {
  if (fsReal.existsSync(TEST_DIR)) {
    fsReal.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fsReal.mkdirSync(TEST_DIR, { recursive: true });
}

async function runTests() {
  console.log("🧪 Running Posting Area Management Tests...\n");

  const runtime = new PostingAreaRuntime();
  const importService = new PostingAreaImportService();
  const validator = new PostingAreaValidator();
  const tracker = new TestEventTracker();
  runtime.subscribe(ev => tracker.track(ev));

  const mockElectionMaster: ElectionMasterSchema = {
    electionId: "house-2026",
    electionType: "HOUSE",
    electionDate: "2026-10-25",
    nationalTurnout: { level: "NATIONAL", turnout: 55.5 },
    districts: [
      { districtId: "mie-03", districtName: "三重県第3区", turnout: 52.8 }
    ],
    municipalities: [
      { municipalityCode: "24205", municipalityName: "桑名市", districtId: "mie-03", turnout: 57.1 },
      { municipalityCode: "24207", municipalityName: "いなべ市", districtId: "mie-03", turnout: 56.2 },
      { municipalityCode: "24202", municipalityName: "四日市市", districtId: "mie-03", turnout: 54.1 }
    ]
  };

  // ==========================================
  // Scenario 1: Municipality Sorting
  // ==========================================
  {
    console.log("Scenario 1: Sort municipalities alphabetically (Hiragana)...");
    
    // Unsorted municipality list (桑名市, いなべ市, 四日市市)
    const rawEntries: ImportAddressEntry[] = [
      { address: "桑名市吉之丸1", municipalityCode: "24205", municipalityName: "桑名市" },
      { address: "いなべ市員弁町1", municipalityCode: "24207", municipalityName: "いなべ市" },
      { address: "四日市市本町1", municipalityCode: "24202", municipalityName: "四日市市" }
    ];

    const areas = importService.importAddresses(rawEntries);
    assert(areas.length === 3, "Should generate 3 areas.");
    // Sorted should be: いなべ市 (24207) -> 桑名市 (24205) -> 四日市市 (24202)
    assert(areas[0].municipalityName === "いなべ市", "First municipality must be いなべ市.");
    assert(areas[1].municipalityName === "桑名市", "Second municipality must be 桑名市.");
    assert(areas[2].municipalityName === "四日市市", "Third municipality must be 四日市市.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // ==========================================
  // Scenario 2: Address Sorting
  // ==========================================
  {
    console.log("Scenario 2: Sort addresses alphabetically within each municipality...");
    
    const rawEntries: ImportAddressEntry[] = [
      { address: "桑名市よしのまる", municipalityCode: "24205", municipalityName: "桑名市" },
      { address: "桑名市えば", municipalityCode: "24205", municipalityName: "桑名市" },
      { address: "桑名市たいちまる", municipalityCode: "24205", municipalityName: "桑名市" },
      { address: "桑名市だいふく", municipalityCode: "24205", municipalityName: "桑名市" }
    ];

    const areas = importService.importAddresses(rawEntries);
    assert(areas.length === 1, "Should generate 1 chunk/area.");
    
    const sorted = areas[0].sourceAddresses;
    // Expected sorted: えば (eba) -> たいちまる (taichimaru) -> だいふく (daifuku) -> よしのまる (yoshinomaru)
    assert(sorted[0] === "桑名市えば", "First address must be えば.");
    assert(sorted[1] === "桑名市たいちまる", "Second address must be たいちまる.");
    assert(sorted[2] === "桑名市だいふく", "Third address must be だいふく.");
    assert(sorted[3] === "桑名市よしのまる", "Fourth address must be よしのまる.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // ==========================================
  // Scenario 3: Sheet Chunk Generation (53 items)
  // ==========================================
  {
    console.log("Scenario 3: Verify 10-item sheet chunking (53 items into 6 sheets)...");
    
    const rawEntries: ImportAddressEntry[] = [];
    for (let i = 1; i <= 53; i++) {
      // Pad i with leading zeros so alphabetical sorting matches insertion order easily
      const padded = i.toString().padStart(3, "0");
      rawEntries.push({
        address: `桑名市街区-${padded}`,
        municipalityCode: "24205",
        municipalityName: "桑名市"
      });
    }

    const areas = importService.importAddresses(rawEntries);
    assert(areas.length === 6, "53 items chunked by 10 must produce exactly 6 sheets.");
    assert(areas[0].addressCount === 10, "Sheet 1 should contain 10 items.");
    assert(areas[4].addressCount === 10, "Sheet 5 should contain 10 items.");
    assert(areas[5].addressCount === 3, "Sheet 6 should contain exactly 3 items.");
    
    // Check range formation
    assert(areas[0].addressRange === "桑名市街区-001〜桑名市街区-010", "Sheet 1 range mismatch.");
    assert(areas[5].addressRange === "桑名市街区-051〜桑名市街区-053", "Sheet 6 range mismatch.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // ==========================================
  // Scenario 4: Area ID Generation
  // ==========================================
  {
    console.log("Scenario 4: Verify Area ID naming convention...");
    const rawEntries: ImportAddressEntry[] = [
      { address: "桑名市江場1", municipalityCode: "24205", municipalityName: "桑名市" },
      { address: "桑名市江場2", municipalityCode: "24205", municipalityName: "桑名市" }
    ];

    const areas = importService.importAddresses(rawEntries);
    assert(areas[0].areaId === "24205-0001", "Area ID should format as {municipalityCode}-{sheetNumber} with padding.");

    console.log("✅ Scenario 4 Passed.\n");
  }

  // ==========================================
  // Scenario 5: Duplicate Block
  // ==========================================
  {
    console.log("Scenario 5: Verify duplicate Area ID validation block...");
    
    const areas = [
      {
        areaId: "24205-0001",
        municipalityCode: "24205",
        municipalityName: "桑名市",
        sheetNumber: 1,
        addressRange: "江場",
        addressCount: 1,
        managementNumber: "24205-0001",
        distributionStatus: "UNASSIGNED" as const,
        sourceAddresses: ["江場"]
      },
      {
        areaId: "24205-0001", // Duplicate areaId
        municipalityCode: "24205",
        municipalityName: "桑名市",
        sheetNumber: 2,
        addressRange: "吉之丸",
        addressCount: 1,
        managementNumber: "24205-0001",
        distributionStatus: "UNASSIGNED" as const,
        sourceAddresses: ["吉之丸"]
      }
    ];

    const master = {
      masterId: "master-mie",
      districtId: "mie-03",
      electionId: "house-2026",
      generatedAt: new Date().toISOString(),
      areas,
      sourceHash: "dummyHash",
      contentHash: "dummyHash"
    };

    const valRes = validator.validateMaster(master, mockElectionMaster);
    assert(valRes.success === false, "Duplicate areaId master must fail validation.");
    assert(valRes.errors.some(e => e.includes("Duplicate areaId detected")), "Should report Duplicate areaId detected error.");

    console.log("✅ Scenario 5 Passed.\n");
  }

  // ==========================================
  // Scenario 6: Status Transition (Valid & Invalid)
  // ==========================================
  {
    console.log("Scenario 6: Verify status transition state-machine logic...");
    
    // UNASSIGNED -> ASSIGNED (Valid)
    const t1 = validator.validateTransition("UNASSIGNED", "ASSIGNED");
    assert(t1.success === true, "UNASSIGNED -> ASSIGNED should succeed.");

    // ASSIGNED -> IN_PROGRESS (Valid)
    const t2 = validator.validateTransition("ASSIGNED", "IN_PROGRESS");
    assert(t2.success === true, "ASSIGNED -> IN_PROGRESS should succeed.");

    // IN_PROGRESS -> COMPLETED (Valid)
    const t3 = validator.validateTransition("IN_PROGRESS", "COMPLETED");
    assert(t3.success === true, "IN_PROGRESS -> COMPLETED should succeed.");

    // IN_PROGRESS -> ASSIGNED (Valid, re-allocating agent)
    const t4 = validator.validateTransition("IN_PROGRESS", "ASSIGNED");
    assert(t4.success === true, "IN_PROGRESS -> ASSIGNED should succeed.");

    // COMPLETED -> ASSIGNED (Blocked)
    const t5 = validator.validateTransition("COMPLETED", "ASSIGNED");
    assert(t5.success === false, "COMPLETED -> ASSIGNED should be blocked.");
    assert(t5.error !== undefined && t5.error.includes("already COMPLETED"), "Should report error containing already COMPLETED.");

    // UNASSIGNED -> IN_PROGRESS (Blocked, assignee must be set first)
    const t6 = validator.validateTransition("UNASSIGNED", "IN_PROGRESS");
    assert(t6.success === false, "UNASSIGNED -> IN_PROGRESS should be blocked.");

    console.log("✅ Scenario 6 Passed.\n");
  }

  // ==========================================
  // Scenario 7: Immutable Protection
  // ==========================================
  {
    console.log("Scenario 7: Verify deep freeze immutable protection...");
    
    setupDirs();
    const rawEntries = [
      { address: "桑名市江場1", municipalityCode: "24205", municipalityName: "桑名市" }
    ];

    const runRes = await runtime.importAreas("master-007", "mie-03", "house-2026", rawEntries, DESTINATION_FILE, mockElectionMaster);
    assert(runRes.status === "SUCCESS", "Runtime import must succeed.");
    const master = runRes.master!;

    // Attempt modifying master properties
    let throwsMaster = false;
    try {
      (master as any).districtId = "alteredDistrict";
    } catch (err: any) {
      throwsMaster = true;
    }
    assert(throwsMaster === true, "Modifying master properties must throw TypeError.");

    // Attempt modifying area properties
    let throwsArea = false;
    try {
      (master.areas[0] as any).distributionStatus = "COMPLETED";
    } catch (err: any) {
      throwsArea = true;
    }
    assert(throwsArea === true, "Modifying nested area properties must throw TypeError.");

    // Attempt modifying source addresses array inside an area
    let throwsAddr = false;
    try {
      (master.areas[0].sourceAddresses as any)[0] = "alteredAddress";
    } catch (err: any) {
      throwsAddr = true;
    }
    assert(throwsAddr === true, "Modifying nested sourceAddresses element must throw TypeError.");

    console.log("✅ Scenario 7 Passed.\n");
  }

  // ==========================================
  // Scenario 8: Runtime Import & State Update Integration
  // ==========================================
  {
    console.log("Scenario 8: Verify Runtime Import & State Updates flow...");
    setupDirs();
    tracker.events.length = 0;

    const rawEntries = [
      { address: "桑名市江場1", municipalityCode: "24205", municipalityName: "桑名市" },
      { address: "桑名市江場2", municipalityCode: "24205", municipalityName: "桑名市" }
    ];

    // 1. Initial Import
    const impRes = await runtime.importAreas("master-008", "mie-03", "house-2026", rawEntries, DESTINATION_FILE, mockElectionMaster);
    assert(impRes.status === "SUCCESS", "Should succeed importing.");
    assert(tracker.events.length === 1, "Should emit exactly 1 event.");
    assert(tracker.events[0].type === "POSTING_AREA_CREATED", "Event type should be CREATED.");
    assert(tracker.events[0].areaCount === 1, "Area count should be 1.");

    // 2. Assign Agent (ASSIGNED)
    const updateRes1 = await runtime.updateAreaStatus("master-008", "24205-0001", "ASSIGNED", "Agent-47", DESTINATION_FILE, mockElectionMaster);
    assert(updateRes1.status === "SUCCESS", "Assign status must succeed.");
    assert(updateRes1.master!.areas[0].distributionStatus === "ASSIGNED", "Status should be ASSIGNED.");
    assert(updateRes1.master!.areas[0].assignee === "Agent-47", "Assignee should be Agent-47.");

    // 3. Fail Assignment (No Agent name provided)
    const updateResFail = await runtime.updateAreaStatus("master-008", "24205-0001", "ASSIGNED", "", DESTINATION_FILE, mockElectionMaster);
    assert(updateResFail.status === "FAILED", "Assignment without agent name must fail.");

    console.log("✅ Scenario 8 Passed.\n");
  }

  console.log("🎉 All Posting Area Management tests completed successfully!");
}

try {
  runTests();
} catch (err) {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
}
