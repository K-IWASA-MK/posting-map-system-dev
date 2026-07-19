import { TurnoutDashboardProjectionSchema } from "../../../domains/election/projection/contracts/TurnoutDashboardProjectionContract";
import { ElectionDashboardConsumerAdapter } from "../../../domains/election/consumer/adapters/ElectionDashboardConsumerAdapter";
import { ConsumerValidator } from "../../../domains/election/consumer/validation/ConsumerValidator";
import { ElectionDashboardViewModel } from "../../../domains/election/consumer/models/ElectionDashboardViewModel";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log("🧪 Running Election Dashboard Consumer Adapter Tests...\n");

  const adapter = new ElectionDashboardConsumerAdapter();
  const validator = new ConsumerValidator();

  // Helper to compile a valid TurnoutDashboardProjectionSchema
  const mockProjection: TurnoutDashboardProjectionSchema = {
    electionId: "2024-house",
    electionType: "HOUSE",
    electionDate: "2024-10-27",
    nationalTurnout: 55.5,
    districts: [
      {
        districtId: "mie-03",
        districtName: "三重県第3区",
        turnout: 52.8,
        nationalTurnout: 55.5,
        difference: -2.7,
        status: "YELLOW"
      }
    ],
    municipalities: [
      {
        municipalityCode: "24205",
        municipalityName: "桑名市",
        districtId: "mie-03",
        turnout: 57.1,
        national: 55.5,
        difference: 1.6,
        status: "YELLOW"
      }
    ],
    lineage: {
      source: "ElectionMaster",
      classification: "TurnoutClassification",
      generatedAt: "2026-07-19T09:11:00Z",
      hash: "af1d13e32129aad538849f5810525e6b03d37819af1d13e32129aad538849f58"
    }
  };

  // ==========================================
  // Scenario 1: Normal Adaptation Integration
  // ==========================================
  {
    console.log("Scenario 1: Adapt projection and validate ViewModel...");
    const vm = adapter.adapt(mockProjection);

    assert(vm.sourceType === "TURNOUT_DASHBOARD_PROJECTION", "sourceType should match.");
    assert(vm.electionId === "2024-house", "electionId should match.");
    assert(vm.electionDate === "2024-10-27", "electionDate should match.");
    assert(vm.nationalTurnout === 55.5, "nationalTurnout should match.");

    // Validate ID preservation
    assert(vm.districts.length === 1, "Should have 1 district ViewModel.");
    assert(vm.districts[0].id === "mie-03", "District ID must be preserved.");
    assert(vm.districts[0].colorStatus === "YELLOW", "District status must match colorStatus.");

    assert(vm.municipalities.length === 1, "Should have 1 municipality ViewModel.");
    assert(vm.municipalities[0].code === "24205", "Municipality code must be preserved.");
    assert(vm.municipalities[0].colorStatus === "YELLOW", "Municipality status must match colorStatus.");

    // Lineage binding checks
    assert(vm.lineageHash === "af1d13e32129aad538849f5810525e6b03d37819af1d13e32129aad538849f58", "Lineage hash must map to lineageHash.");
    assert(vm.lastUpdated === "2026-07-19T09:11:00Z", "generatedAt must map to lastUpdated.");

    // Validate overall structure
    const res = validator.validate(vm);
    if (!res.success) {
      console.error("Validation Errors:", res.errors);
    }
    assert(res.success === true, "Normal adapted ViewModel should pass validator.");
    console.log("✅ Scenario 1 Passed.\n");
  }

  // ==========================================
  // Scenario 2: Defensive Validation Check (Missing Lineage)
  // ==========================================
  {
    console.log("Scenario 2: Validate missing lineage metadata blocking...");
    
    const corruptedVm = new ElectionDashboardViewModel(
      "2024-house",
      "2024-10-27",
      55.5,
      [],
      [],
      "", // missing hash
      ""  // missing timestamp
    );

    const res = validator.validate(corruptedVm);
    assert(res.success === false, "Missing lineage must fail validator.");
    assert(res.errors.some(e => e.includes("lineageHash is missing")), "Should report missing hash error.");
    assert(res.errors.some(e => e.includes("lastUpdated is missing")), "Should report missing date error.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // ==========================================
  // Scenario 3: ID Preservation Verification
  // ==========================================
  {
    console.log("Scenario 3: Validate ID preservation consistency...");
    const vm = adapter.adapt(mockProjection);

    // Assert mapped keys align with contracts and match input directly
    assert(vm.districts[0].id === mockProjection.districts[0].districtId, "Adapted district ID must equal source districtId.");
    assert(vm.municipalities[0].code === mockProjection.municipalities[0].municipalityCode, "Adapted municipality code must equal source municipalityCode.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  console.log("🎉 All Election Dashboard Consumer Adapter tests completed successfully!");
}

try {
  runTests();
} catch (err) {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
}
