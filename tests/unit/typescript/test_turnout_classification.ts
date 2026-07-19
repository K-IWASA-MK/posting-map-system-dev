import { ElectionMasterSchema } from "../../../domains/election/master/contracts/ElectionMasterContract";
import { TurnoutClassificationEngine } from "../../../domains/election/classification/engine/TurnoutClassificationEngine";
import { ClassificationValidator } from "../../../domains/election/classification/validation/ClassificationValidator";
import { TurnoutClassification } from "../../../domains/election/classification/models/TurnoutClassification";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log("🧪 Running Turnout Classification Engine Foundation Tests...\n");

  const engine = new TurnoutClassificationEngine();
  const validator = new ClassificationValidator();

  // Helper to compile a minimal valid Election Master record
  function makeMockMaster(national: number, municipalityTurnout: number, districtTurnout: number = 52.8): ElectionMasterSchema {
    return {
      electionId: "2024-house",
      electionType: "HOUSE",
      electionDate: "2024-10-27",
      nationalTurnout: { level: "NATIONAL", turnout: national },
      districts: [{ districtId: "mie-03", districtName: "三重県第3区", turnout: districtTurnout }],
      municipalities: [{ municipalityCode: "24205", municipalityName: "桑名市", districtId: "mie-03", turnout: municipalityTurnout }]
    };
  }

  // ==========================================
  // Scenario 1: Normal Case Validation (YELLOW)
  // ==========================================
  {
    console.log("Scenario 1: Normal Turnout Case (+1.6% Diff -> YELLOW)...");
    const master = makeMockMaster(55.5, 57.1);
    const classifications = engine.classify(master);
    const projections = engine.project(master);

    assert(classifications.length === 1, "Should classify 1 municipality.");
    const c = classifications[0];
    assert(c.difference === 1.6, `Difference should be 1.6, got ${c.difference}`);
    assert(c.classification === "YELLOW", `Classification should be YELLOW, got ${c.classification}`);

    // Verify Validator
    const res = validator.validateClassification(c);
    assert(res.success === true, "Valid normal classification should pass validator.");

    const resProj = validator.validateProjection(projections[0]);
    assert(resProj.success === true, "Valid normal projection should pass validator.");

    console.log("✅ Scenario 1 Passed.\n");
  }

  // ==========================================
  // Scenario 2: Green Case (+4.5% Diff -> GREEN)
  // ==========================================
  {
    console.log("Scenario 2: Green Turnout Case (+4.5% Diff -> GREEN)...");
    const master = makeMockMaster(55.5, 60.0);
    const classifications = engine.classify(master);
    const c = classifications[0];

    assert(c.difference === 4.5, `Difference should be 4.5, got ${c.difference}`);
    assert(c.classification === "GREEN", `Classification should be GREEN, got ${c.classification}`);

    const res = validator.validateClassification(c);
    assert(res.success === true, "Valid green classification should pass validator.");
    console.log("✅ Scenario 2 Passed.\n");
  }

  // ==========================================
  // Scenario 3: Red Case (-5.5% Diff -> RED)
  // ==========================================
  {
    console.log("Scenario 3: Red Turnout Case (-5.5% Diff -> RED)...");
    const master = makeMockMaster(55.5, 50.0);
    const classifications = engine.classify(master);
    const c = classifications[0];

    assert(c.difference === -5.5, `Difference should be -5.5, got ${c.difference}`);
    assert(c.classification === "RED", `Classification should be RED, got ${c.classification}`);

    const res = validator.validateClassification(c);
    assert(res.success === true, "Valid red classification should pass validator.");
    console.log("✅ Scenario 3 Passed.\n");
  }

  // ==========================================
  // Scenario 4: Boundary Checks (+3.0, +2.99, -3.0, -2.99)
  // ==========================================
  {
    console.log("Scenario 4: Boundary Checks (exact threshold values)...");
    
    // +3.0 -> GREEN
    const masterPlus3 = makeMockMaster(50.0, 53.0);
    assert(engine.classify(masterPlus3)[0].classification === "GREEN", "+3.0 should be GREEN");
    assert(validator.validateClassification(engine.classify(masterPlus3)[0]).success === true, "+3.0 validation should pass");

    // +2.99 -> YELLOW
    const masterPlus299 = makeMockMaster(50.0, 52.99);
    assert(engine.classify(masterPlus299)[0].classification === "YELLOW", "+2.99 should be YELLOW");
    assert(validator.validateClassification(engine.classify(masterPlus299)[0]).success === true, "+2.99 validation should pass");

    // -3.0 -> RED
    const masterMinus3 = makeMockMaster(50.0, 47.0);
    assert(engine.classify(masterMinus3)[0].classification === "RED", "-3.0 should be RED");
    assert(validator.validateClassification(engine.classify(masterMinus3)[0]).success === true, "-3.0 validation should pass");

    // -2.99 -> YELLOW
    const masterMinus299 = makeMockMaster(50.0, 47.01);
    assert(engine.classify(masterMinus299)[0].classification === "YELLOW", "-2.99 should be YELLOW");
    assert(validator.validateClassification(engine.classify(masterMinus299)[0]).success === true, "-2.99 validation should pass");

    console.log("✅ Scenario 4 Passed.\n");
  }

  // ==========================================
  // Scenario 5: Invalid Turnout Range Block (120%)
  // ==========================================
  {
    console.log("Scenario 5: Out of bounds Turnout values (> 100%)...");
    
    const invalidClass = new TurnoutClassification(
      "24205",
      "桑名市",
      55.5,
      52.8,
      120.0, // Invalid turnout
      64.5,
      "GREEN"
    );

    const res = validator.validateClassification(invalidClass);
    assert(res.success === false, "Out of bounds turnout should fail validator.");
    assert(res.errors.some(e => e.includes("out of bounds")), "Should report out of bounds error.");

    console.log("✅ Scenario 5 Passed.\n");
  }

  // ==========================================
  // Scenario 6: Mismatched Status Block
  // ==========================================
  {
    console.log("Scenario 6: Logic inconsistency status mismatch...");
    
    // Difference is +5.0 (should be GREEN), but status is set to RED
    const mismatchedClass = new TurnoutClassification(
      "24205",
      "桑名市",
      50.0,
      52.8,
      55.0,
      5.0,
      "RED" // Mismatched status
    );

    const res = validator.validateClassification(mismatchedClass);
    assert(res.success === false, "Mismatched status should fail validator.");
    assert(res.errors.some(e => e.includes("status mismatch")), "Should report status mismatch error.");

    console.log("✅ Scenario 6 Passed.\n");
  }

  console.log("🎉 All Turnout Classification Engine tests completed successfully!");
}

try {
  runTests();
} catch (err) {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
}
