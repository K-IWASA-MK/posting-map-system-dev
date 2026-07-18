import { CompletionRequest } from "../contracts/CompletionContract";

export class TestValidator {
  /**
   * Asserts the test suite execution results.
   * Returns valid true only if passed > 0, failed === 0, and qualityGate !== "FAIL".
   */
  public static validate(request: CompletionRequest): { valid: boolean; error?: string } {
    const { testResult } = request;

    if (testResult.failed > 0) {
      return {
        valid: false,
        error: `Quality gate block: testResult contains ${testResult.failed} failed test cases.`
      };
    }

    if (testResult.passed === 0) {
      return {
        valid: false,
        error: "Quality gate block: passing test count is zero."
      };
    }

    if (testResult.qualityGate === "FAIL") {
      return {
        valid: false,
        error: "Quality gate block: qualityGate status is explicitly set to FAIL."
      };
    }

    return { valid: true };
  }
}
