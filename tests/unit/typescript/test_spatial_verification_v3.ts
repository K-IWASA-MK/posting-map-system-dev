import { AddressCoordinateResolver } from '../../../src/platform/spatial-verification-v3/resolver/AddressCoordinateResolver';
import { CoordinateValidator } from '../../../src/platform/spatial-verification-v3/validator/CoordinateValidator';
import { WaterAreaDetector } from '../../../src/platform/spatial-verification-v3/validator/WaterAreaDetector';
import { SecretProvider } from '../../../src/platform/spatial-verification-v3/resolver/SecretProvider';

// Mock fetch globally
(global as any).fetch = async (url: string) => {
  const decodedUrl = decodeURIComponent(url);
  // Simple mock to return controlled responses for tests
  return {
    json: async () => {
      if (decodedUrl.includes('〒999-9999')) {
        return {
          status: "OK",
          results: [{
            geometry: {
              location: { lat: 35.0350, lng: 136.7020 }, // Some land coord
              location_type: "APPROXIMATE"
            }
          }]
        };
      } else if (decodedUrl.includes('桑名市江場')) {
        return {
          status: "OK",
          results: [{
            geometry: {
              location: { lat: 35.0500, lng: 136.6500 }, // Safe kuwana coord
              location_type: "ROOFTOP"
            }
          }]
        };
      }
      return { status: "ZERO_RESULTS", results: [] };
    }
  };
};

// Mock SecretProvider to prevent error
SecretProvider.getGoogleMapsApiKey = () => "mock-api-key";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING MIE-03 SPATIAL VERIFICATION V3.1 PRO TESTS (Google API Mock)");
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
  // Case 2: 郵便番号フォールバック (Retry Resolution)
  // ---------------------------------------------------------
  console.log("\n[CASE 2] Resolver Postal Code Fallback Logic");
  const retryResult = await resolver.retryResolve("999-9999");
  if (retryResult && retryResult.source === "POSTAL_APPROXIMATE" && retryResult.accuracy === "C") {
    console.log("✅ PASS: Resolver correctly fell back to POSTAL_APPROXIMATE with C accuracy.");
  } else {
    console.error("❌ FAIL: Resolver retry logic failed.");
    process.exit(1);
  }

  // ---------------------------------------------------------
  // Case 3: 四日市市 MIE-02地域座標 -> REJECT
  // ---------------------------------------------------------
  console.log("\n[CASE 3] Yokkaichi MIE-02 Coordinate -> REJECT");
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
  const resolveResult4 = await resolver.resolve("桑名市", "江場");
  const validateResult4 = validator.validate(resolveResult4.latitude, resolveResult4.longitude, "桑名市");
  if (validateResult4.isValid && validateResult4.status === "VERIFIED") {
    console.log(`✅ PASS: Kuwana Eba resolved and verified successfully (Lat: ${resolveResult4.latitude}, Lng: ${resolveResult4.longitude}).`);
  } else {
    console.error(`❌ FAIL: Normal address was rejected. Reason: ${validateResult4.reason}`);
    process.exit(1);
  }

  console.log("\n✅ ALL TESTS PASSED: Spatial Verification Engine v3.1 Pro API Mock.");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
