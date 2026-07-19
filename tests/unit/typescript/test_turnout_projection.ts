import { ElectionMasterSchema } from "../../../domains/election/master/contracts/ElectionMasterContract";
import { TurnoutDashboardProjectionEngine } from "../../../domains/election/projection/engine/TurnoutDashboardProjectionEngine";
import { ProjectionValidator } from "../../../domains/election/projection/validation/ProjectionValidator";
import { TurnoutDashboardProjection } from "../../../domains/election/projection/models/TurnoutDashboardProjection";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log("🧪 Running Turnout Dashboard Projection Foundation Tests...\n");

  const engine = new TurnoutDashboardProjectionEngine();
  const validator = new ProjectionValidator();

  // Helper to compile a valid Election Master SSOT
  const normalMaster: ElectionMasterSchema = {
    electionId: "2024-house",
    electionType: "HOUSE",
    electionDate: "2024-10-27",
    nationalTurnout: { level: "NATIONAL", turnout: 55.5 },
    districts: [
      { districtId: "mie-03", districtName: "三重県第3区", turnout: 52.8 }
    ],
    municipalities: [
      { municipalityCode: "24205", municipalityName: "桑名市", districtId: "mie-03", turnout: 57.1 }
    ]
  };

  // ==========================================
  // Scenario 1: Normal Projection Integration
  // ==========================================
  {
    console.log("Scenario 1: Build normal projection and validate...");
    const projection = engine.project(normalMaster);

    assert(projection.electionId === "2024-house", "Election ID should match.");
    assert(projection.nationalTurnout === 55.5, "National turnout should match.");
    
    // Check district properties (difference and status)
    assert(projection.districts.length === 1, "Should have 1 district projection.");
    const d = projection.districts[0];
    assert(d.districtId === "mie-03", "District ID should match.");
    assert(d.difference === -2.7, `District difference should be -2.7, got ${d.difference}`);
    assert(d.status === "YELLOW", `District status should be YELLOW, got ${d.status}`);

    // Check municipality properties (difference and status)
    assert(projection.municipalities.length === 1, "Should have 1 municipality projection.");
    const m = projection.municipalities[0];
    assert(m.municipalityCode === "24205", "Municipality code should match.");
    assert(m.difference === 1.6, `Municipality difference should be 1.6, got ${m.difference}`);
    assert(m.status === "YELLOW", `Municipality status should be YELLOW, got ${m.status}`);

    // Validate lineage hash
    assert(!!projection.lineage.hash, "Should generate lineage hash.");
    assert(projection.lineage.hash.length === 64, "Lineage hash should be 64 characters.");

    // Validate overall projection
    const res = validator.validate(projection);
    assert(res.success === true, "Normal projection should pass validator.");
    console.log("✅ Scenario 1 Passed.\n");
  }

  // ==========================================
  // Scenario 2: Relational / Mismatch Error Validation
  // ==========================================
  {
    console.log("Scenario 2: Relational mismatch and calculation inconsistency validation...");
    const normalProjection = engine.project(normalMaster);

    // Relational error: Municipality points to non-existent district ID
    const unmatchedDistrictProjection = new TurnoutDashboardProjection(
      normalProjection.electionId,
      normalProjection.electionType,
      normalProjection.electionDate,
      normalProjection.nationalTurnout,
      normalProjection.districts,
      [{ ...normalProjection.municipalities[0], districtId: "mie-99" }], // mismatched districtId
      normalProjection.lineage
    );

    const resUnmatched = validator.validate(unmatchedDistrictProjection);
    assert(resUnmatched.success === false, "Should block unmatched district IDs.");
    assert(resUnmatched.errors.some(e => e.includes("does not exist in districts")), "Should report relation error.");

    // Calculation Inconsistency: Incorrect difference in district
    const incorrectDiffProjection = new TurnoutDashboardProjection(
      normalProjection.electionId,
      normalProjection.electionType,
      normalProjection.electionDate,
      normalProjection.nationalTurnout,
      [{ ...normalProjection.districts[0], difference: 15.0 }], // mutated difference
      normalProjection.municipalities,
      normalProjection.lineage
    );

    const resIncorrect = validator.validate(incorrectDiffProjection);
    assert(resIncorrect.success === false, "Should block inconsistent difference math.");
    assert(resIncorrect.errors.some(e => e.includes("difference") && e.includes("does not match")), "Should report difference mismatch error.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // ==========================================
  // Scenario 3: Turnout Boundary Limits Block
  // ==========================================
  {
    console.log("Scenario 3: Out-of-bounds turnout values (e.g. 120%)...");
    const normalProjection = engine.project(normalMaster);

    const outOfBoundsProjection = new TurnoutDashboardProjection(
      normalProjection.electionId,
      normalProjection.electionType,
      normalProjection.electionDate,
      normalProjection.nationalTurnout,
      [{ ...normalProjection.districts[0], turnout: 120.0, difference: 64.5, status: "GREEN" }], // out of bounds turnout
      normalProjection.municipalities,
      normalProjection.lineage
    );

    const res = validator.validate(outOfBoundsProjection);
    assert(res.success === false, "Out of bounds values should fail validation.");
    assert(res.errors.some(e => e.includes("out of bounds")), "Should report out of bounds error.");

    console.log("✅ Scenario 3 Passed.\n");
  }

  // ==========================================
  // Scenario 4: Lineage Hash Validation
  // ==========================================
  {
    console.log("Scenario 4: Lineage invalid SHA-256 hash checks...");
    const normalProjection = engine.project(normalMaster);

    const invalidHashProjection = new TurnoutDashboardProjection(
      normalProjection.electionId,
      normalProjection.electionType,
      normalProjection.electionDate,
      normalProjection.nationalTurnout,
      normalProjection.districts,
      normalProjection.municipalities,
      { ...normalProjection.lineage, hash: "invalid-short-hash" } // invalid hash format
    );

    const res = validator.validate(invalidHashProjection);
    assert(res.success === false, "Invalid hash string should fail validation.");
    assert(res.errors.some(e => e.includes("must be a valid SHA-256 hex string")), "Should report invalid hash error.");

    console.log("✅ Scenario 4 Passed.\n");
  }

  console.log("🎉 All Turnout Dashboard Projection tests completed successfully!");
}

try {
  runTests();
} catch (err) {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
}
