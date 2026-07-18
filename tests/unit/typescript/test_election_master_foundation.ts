import { NationalTurnout } from "../../../domains/election/master/models/NationalTurnout";
import { DistrictTurnout } from "../../../domains/election/master/models/DistrictTurnout";
import { MunicipalityTurnout } from "../../../domains/election/master/models/MunicipalityTurnout";
import { ElectionMasterValidator } from "../../../domains/election/master/validation/ElectionMasterValidator";
import { ElectionMasterSchema } from "../../../domains/election/master/contracts/ElectionMasterContract";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log("🧪 Running Election Master Storage Contract Foundation Tests...\n");

  const validator = new ElectionMasterValidator();

  // ==========================================
  // Scenario 1: Normal Data Registration
  // ==========================================
  {
    console.log("Scenario 1: Normal Turnout Data validation...");
    validator.clearRegistry();

    const normalData: ElectionMasterSchema = {
      electionId: "2024-house",
      electionType: "HOUSE",
      electionDate: "2024-10-27",
      nationalTurnout: new NationalTurnout(55.5),
      districts: [
        new DistrictTurnout("mie-03", "三重県第3区", 52.8)
      ],
      municipalities: [
        new MunicipalityTurnout("24205", "桑名市", "mie-03", 57.1)
      ]
    };

    const res = validator.validate(normalData);
    assert(res.success === true, "Normal election data should validate successfully.");
    assert(res.errors.length === 0, "Should have 0 errors.");
    console.log("✅ Scenario 1 Passed.\n");
  }

  // ==========================================
  // Scenario 2: Invalid Turnout Range Block
  // ==========================================
  {
    console.log("Scenario 2: Out of bounds Turnout values [-10%, 120%]...");
    validator.clearRegistry();

    const lowTurnoutData: ElectionMasterSchema = {
      electionId: "2024-house",
      electionType: "HOUSE",
      electionDate: "2024-10-27",
      nationalTurnout: new NationalTurnout(-10),
      districts: [
        new DistrictTurnout("mie-03", "三重県第3区", 52.8)
      ],
      municipalities: [
        new MunicipalityTurnout("24205", "桑名市", "mie-03", 57.1)
      ]
    };

    const highTurnoutData: ElectionMasterSchema = {
      electionId: "2024-house",
      electionType: "HOUSE",
      electionDate: "2024-10-27",
      nationalTurnout: new NationalTurnout(55.5),
      districts: [
        new DistrictTurnout("mie-03", "三重県第3区", 120)
      ],
      municipalities: [
        new MunicipalityTurnout("24205", "桑名市", "mie-03", 57.1)
      ]
    };

    const resLow = validator.validate(lowTurnoutData);
    assert(resLow.success === false, "Negative turnout should be blocked.");
    assert(resLow.errors.some(e => e.includes("out of bounds")), "Should report out of bounds error.");

    const resHigh = validator.validate(highTurnoutData);
    assert(resHigh.success === false, "Turnout > 100 should be blocked.");
    assert(resHigh.errors.some(e => e.includes("out of bounds")), "Should report out of bounds error.");

    console.log("✅ Scenario 2 Passed.\n");
  }

  // ==========================================
  // Scenario 3: Duplicate Election ID Check
  // ==========================================
  {
    console.log("Scenario 3: Duplicate electionId validation...");
    validator.clearRegistry();

    // Register first ID
    validator.registerElectionId("2024-house");

    const duplicateData: ElectionMasterSchema = {
      electionId: "2024-house",
      electionType: "HOUSE",
      electionDate: "2024-10-27",
      nationalTurnout: new NationalTurnout(55.5),
      districts: [
        new DistrictTurnout("mie-03", "三重県第3区", 52.8)
      ],
      municipalities: [
        new MunicipalityTurnout("24205", "桑名市", "mie-03", 57.1)
      ]
    };

    const res = validator.validate(duplicateData);
    assert(res.success === false, "Duplicate election ID should be blocked.");
    assert(res.errors.some(e => e.includes("Duplicate")), "Should report duplicate ID error.");
    console.log("✅ Scenario 3 Passed.\n");
  }

  // ==========================================
  // Scenario 4: District Municipality ID Relation
  // ==========================================
  {
    console.log("Scenario 4: Relational mismatch (undefined districtId in districts list)...");
    validator.clearRegistry();

    const unmatchedRelationData: ElectionMasterSchema = {
      electionId: "2024-house",
      electionType: "HOUSE",
      electionDate: "2024-10-27",
      nationalTurnout: new NationalTurnout(55.5),
      districts: [
        new DistrictTurnout("mie-03", "三重県第3区", 52.8)
      ],
      municipalities: [
        new MunicipalityTurnout("24205", "桑名市", "mie-99", 57.1) // districtId 'mie-99' does not exist in districts
      ]
    };

    const res = validator.validate(unmatchedRelationData);
    assert(res.success === false, "Unmatched district relation should fail validation.");
    assert(res.errors.some(e => e.includes("does not exist in districts")), "Should report relation error.");
    console.log("✅ Scenario 4 Passed.\n");
  }

  console.log("🎉 All Election Master Foundation tests completed successfully!");
}

try {
  runTests();
} catch (err) {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
}
