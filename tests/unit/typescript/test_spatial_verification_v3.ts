import { AddressCoordinateResolver } from '../../../src/platform/spatial-verification-v3/resolver/AddressCoordinateResolver';
import { CoordinateValidator } from '../../../src/platform/spatial-verification-v3/validator/CoordinateValidator';
import { WaterAreaDetector } from '../../../src/platform/spatial-verification-v3/validator/WaterAreaDetector';

function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING MIE-03 SPATIAL VERIFICATION V3.1 PRO TESTS");
  console.log("==================================================\n");

  const resolver = new AddressCoordinateResolver();
  const validator = new CoordinateValidator();
  const waterDetector = new WaterAreaDetector();

  // ---------------------------------------------------------
  // Case 1: 川中座標 -> FAIL
  // ---------------------------------------------------------
  console.log("[CASE 1] Water Coordinate -> FAIL");
  const waterCheck = waterDetector.detect(35.0500, 136.6950); // Inside Ibi River
  if (waterCheck.isWater && waterCheck.severity === 'ERROR') {
    console.log("✅ PASS: Correctly detected water area (Ibi River) with ERROR severity.");
  } else {
    console.error("❌ FAIL: Did not detect water area.");
    process.exit(1);
  }
  
  const validateResult1 = validator.validate(35.0500, 136.6950, "桑名市");
  if (!validateResult1.isValid && validateResult1.status === "INVALID_COORDINATE") {
    console.log("✅ PASS: CoordinateValidator correctly rejected water coordinate.");
  } else {
    console.error("❌ FAIL: CoordinateValidator did not reject water coordinate.");
    process.exit(1);
  }

  // ---------------------------------------------------------
  // Case 2: 補正後ではなく再取得 (Retry Resolution)
  // ---------------------------------------------------------
  console.log("\n[CASE 2] Resolver Retry Logic");
  const retryResult = resolver.retryResolve("MIE03-999999", "桑名市", "長島町○○", 1);
  if (retryResult && retryResult.source === "OAZA_CENTROID" && retryResult.accuracy === "C") {
    console.log("✅ PASS: Resolver correctly fell back to OAZA_CENTROID with C accuracy on retry.");
  } else {
    console.error("❌ FAIL: Resolver retry logic failed.");
    process.exit(1);
  }

  // ---------------------------------------------------------
  // Case 3: 四日市市 MIE-02地域座標 -> REJECT
  // ---------------------------------------------------------
  console.log("\n[CASE 3] Yokkaichi MIE-02 Coordinate -> REJECT");
  // MIE-02 Yokkaichi (South Yokkaichi e.g. Hinaga 34.9500, 136.6000)
  const validateResult3 = validator.validate(34.9500, 136.6000, "四日市市");
  if (!validateResult3.isValid && validateResult3.status === "REJECTED_BOUNDARY_LEAK") {
    console.log("✅ PASS: Correctly rejected Yokkaichi coordinate outside MIE-03 inclusion zone.");
  } else {
    console.error("❌ FAIL: Did not reject MIE-02 leakage for Yokkaichi.");
    process.exit(1);
  }

  // ---------------------------------------------------------
  // Case 4: 正常住所 (桑名市江場) -> PASS
  // ---------------------------------------------------------
  console.log("\n[CASE 4] Normal Address (Kuwana Eba) -> PASS");
  const resolveResult4 = resolver.resolve("MIE03-000150", "桑名市", "江場", 100);
  const validateResult4 = validator.validate(resolveResult4.lat, resolveResult4.lng, "桑名市");
  if (validateResult4.isValid && validateResult4.status === "VERIFIED") {
    console.log(`✅ PASS: Kuwana Eba resolved and verified successfully (Lat: ${resolveResult4.lat}, Lng: ${resolveResult4.lng}).`);
  } else {
    console.error(`❌ FAIL: Normal address was rejected. Reason: ${validateResult4.reason}`);
    process.exit(1);
  }

  console.log("\n✅ ALL TESTS PASSED: Spatial Verification Engine v3.1 Pro is strictly enforcing data accuracy.");
}

runTests();
