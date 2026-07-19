import { ElectionDashboardStorageSchema } from "../../../domains/election/storage/contracts/ElectionDashboardStorageContract";
import { MunicipalityGeoBinding } from "../../../domains/posting-map/visualization/contracts/MunicipalityGeoContract";
import { PostingMapVisualizationRuntime } from "../../../domains/posting-map/visualization/runtime/PostingMapVisualizationRuntime";
import { VisualizationEvent } from "../../../domains/posting-map/visualization/contracts/PostingMapVisualizationContract";
import { VisualizationProjectionValidator } from "../../../domains/posting-map/visualization/validation/VisualizationProjectionValidator";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class TestEventTracker {
  public readonly events: VisualizationEvent[] = [];
  public track(event: VisualizationEvent) {
    this.events.push(event);
  }
}

async function runTests() {
  console.log("🧪 Running Posting Map Election Visualization Projection Tests...\n");

  const runtime = new PostingMapVisualizationRuntime();
  const validator = new VisualizationProjectionValidator();
  const tracker = new TestEventTracker();
  runtime.subscribe(ev => tracker.track(ev));

  const mockStorage: ElectionDashboardStorageSchema = {
    storageId: "storage-101",
    version: "1",
    sourceType: "ELECTION_DASHBOARD_VIEW_MODEL",
    electionId: "house-2026",
    metadata: {
      sourceLineageHash: "af1d13e32129aad538849f5810525e6b03d37819af1d13e32129aad538849f58",
      contentHash: "279fc5e36437d2f9543e019a27e7d9cd469f3458279fc5e36437d2f9543e019a",
      generatedAt: "2026-07-19T09:20:00Z"
    },
    data: {
      sourceType: "TURNOUT_DASHBOARD_PROJECTION",
      electionId: "house-2026",
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
    }
  };

  const mockGeoBindings: MunicipalityGeoBinding[] = [
    {
      municipalityCode: "24205",
      geometryId: "geom-kuwana-24205",
      geometrySource: "MUNICIPALITY_BOUNDARY"
    }
  ];

  // ==========================================
  // Scenario 1: Normal Visualization Generation
  // ==========================================
  {
    console.log("Scenario 1: Generate normal visualization projection...");
    tracker.events.length = 0;

    const res = await runtime.processVisualization("proj-101", mockStorage, mockGeoBindings);
    assert(res.status === "SUCCESS", "Visualization generation must succeed.");
    assert(res.projection !== undefined, "Output projection must be defined.");
    
    // Verify success event emitted
    assert(tracker.events.length === 1, "Should emit exactly 1 event.");
    assert(tracker.events[0].type === "POSTING_MAP_VISUALIZATION_UPDATED", "Event type should be UPDATED.");
    assert(tracker.events[0].projectionId === "proj-101", "Event projectionId should match.");
    assert(tracker.events[0].municipalityCount === 1, "Event municipality count should match.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // ==========================================
  // Scenario 2: Color Preservation
  // ==========================================
  {
    console.log("Scenario 2: Verify Color Preservation (copy-transfer)...");
    const res = await runtime.processVisualization("proj-102", mockStorage, mockGeoBindings);
    assert(res.projection !== undefined, "Projection must be defined.");
    const muni = res.projection!.municipalities[0];
    
    // Check that fillColor is directly copied from colorStatus
    assert(muni.colorStatus === "YELLOW", "colorStatus should be preserved.");
    assert(muni.fillColor === "YELLOW", "fillColor should equal colorStatus.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // ==========================================
  // Scenario 3: Municipality Mapping
  // ==========================================
  {
    console.log("Scenario 3: Verify Municipality Geo Mapping...");
    const res = await runtime.processVisualization("proj-103", mockStorage, mockGeoBindings);
    assert(res.projection !== undefined, "Projection must be defined.");
    
    assert(res.projection!.municipalities[0].municipalityCode === "24205", "Code must match.");
    assert(res.projection!.municipalities[0].geometryId === "geom-kuwana-24205", "Geometry ID should align with bindings.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // ==========================================
  // Scenario 4: Invalid Color Block
  // ==========================================
  {
    console.log("Scenario 4: Verify Invalid Color Block...");
    tracker.events.length = 0;

    const corruptedStorage: ElectionDashboardStorageSchema = {
      ...mockStorage,
      data: {
        ...mockStorage.data,
        municipalities: [
          {
            ...mockStorage.data.municipalities[0],
            colorStatus: "BLUE" as any // Invalid color Status
          }
        ]
      }
    };

    const res = await runtime.processVisualization("proj-104", corruptedStorage, mockGeoBindings);
    assert(res.status === "FAILED", "Invalid color status must fail generation.");
    assert(tracker.events.length === 1, "Should emit exactly 1 event.");
    assert(tracker.events[0].type === "POSTING_MAP_VISUALIZATION_FAILED", "Event type should be FAILED.");
    assert(tracker.events[0].error !== undefined && tracker.events[0].error.includes("invalid colorStatus"), "Should report invalid colorStatus.");

    console.log("✅ Scenario 4 Passed.\n");
  }

  // ==========================================
  // Scenario 5: Hash Integrity
  // ==========================================
  {
    console.log("Scenario 5: Verify Hash Integrity validation...");
    
    const res = await runtime.processVisualization("proj-105", mockStorage, mockGeoBindings);
    assert(res.projection !== undefined, "Projection must be defined.");
    
    // Modify turnout in the projection object and see if validator blocks it
    const cloned = JSON.parse(res.projection!.toJSON());
    cloned.municipalities[0].turnout = 60.1; // Altered turnout

    const valRes = validator.validate(cloned);
    assert(valRes.success === false, "Altered data must fail hash integrity check.");
    assert(valRes.errors.some(e => e.includes("visualizationHash mismatch")), "Should report visualizationHash mismatch error.");

    console.log("✅ Scenario 5 Passed.\n");
  }

  // ==========================================
  // Scenario 6: Duplicate Municipality Detection
  // ==========================================
  {
    console.log("Scenario 6: Verify Duplicate Municipality Detection...");
    
    const duplicateStorage: ElectionDashboardStorageSchema = {
      ...mockStorage,
      data: {
        ...mockStorage.data,
        municipalities: [
          {
            code: "24205",
            name: "桑名市1",
            districtId: "mie-03",
            turnout: 57.1,
            national: 55.5,
            difference: 1.6,
            colorStatus: "YELLOW"
          },
          {
            code: "24205",
            name: "桑名市2",
            districtId: "mie-03",
            turnout: 58.1,
            national: 55.5,
            difference: 2.6,
            colorStatus: "YELLOW"
          }
        ]
      }
    };

    const duplicateBindings: MunicipalityGeoBinding[] = [
      {
        municipalityCode: "24205",
        geometryId: "geom-kuwana-24205",
        geometrySource: "MUNICIPALITY_BOUNDARY"
      }
    ];

    const res = await runtime.processVisualization("proj-106", duplicateStorage, duplicateBindings);
    assert(res.status === "FAILED", "Duplicate municipalities must fail validation.");
    assert(res.error !== undefined && res.error.includes("Duplicate municipalityCode detected"), "Should report duplicate code.");

    console.log("✅ Scenario 6 Passed.\n");
  }

  // ==========================================
  // Scenario 7: Read Only Protection (Deep Freeze)
  // ==========================================
  {
    console.log("Scenario 7: Verify deep freeze immutable protection...");
    const res = await runtime.processVisualization("proj-107", mockStorage, mockGeoBindings);
    assert(res.projection !== undefined, "Projection must be defined.");

    let throwsMetadata = false;
    try {
      (res.projection!.metadata as any).visualizationHash = "alteredHash";
    } catch (err: any) {
      throwsMetadata = true;
    }
    assert(throwsMetadata === true, "Modifying metadata properties must throw TypeError.");

    let throwsMuni = false;
    try {
      (res.projection!.municipalities[0] as any).fillColor = "RED";
    } catch (err: any) {
      throwsMuni = true;
    }
    assert(throwsMuni === true, "Modifying nested municipalities properties must throw TypeError.");

    console.log("✅ Scenario 7 Passed.\n");
  }

  // ==========================================
  // Scenario 8: Geo Binding Missing
  // ==========================================
  {
    console.log("Scenario 8: Verify Geo Binding Missing validation...");
    
    // Empty geo bindings so Kuwana code 24205 has no matching geometryId
    const res = await runtime.processVisualization("proj-108", mockStorage, []);
    assert(res.status === "FAILED", "Missing geo binding must fail validation.");
    assert(res.error !== undefined && res.error.includes("is missing geometryId mapping"), "Should report missing geometryId error.");

    console.log("✅ Scenario 8 Passed.\n");
  }

  // ==========================================
  // Scenario 9: Source Hash Mismatch
  // ==========================================
  {
    console.log("Scenario 9: Verify Source Hash Mismatch validation...");
    
    const res = await runtime.processVisualization("proj-109", mockStorage, mockGeoBindings);
    assert(res.status === "SUCCESS", "Should succeed normally.");
    const valRes = validator.validate(res.projection!, "279fc5e36437d2f9543e019a27e7d9cd469f3458279fc5e36437d2f9543e019b");
    assert(valRes.success === false, "Incorrect expectedSourceHash must fail validator mismatch check.");
    assert(valRes.errors.some(e => e.includes("sourceContentHash mismatch")), "Should report sourceContentHash mismatch error.");

    console.log("✅ Scenario 9 Passed.\n");
  }

  console.log("🎉 All Posting Map Election Visualization Projection tests completed successfully!");
}

try {
  runTests();
} catch (err) {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
}
