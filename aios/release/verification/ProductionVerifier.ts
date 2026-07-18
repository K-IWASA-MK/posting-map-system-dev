import * as fs from "fs";
import * as crypto from "crypto";

export class ProductionVerifier {
  /**
   * Verifies that the content of the deployed file matches the content of the source file exactly.
   */
  public static verify(
    sourceFilePath: string,
    deployedDestination: string
  ): { verified: boolean; error?: string } {
    try {
      if (!fs.existsSync(sourceFilePath)) {
        return { verified: false, error: `Source file does not exist: ${sourceFilePath}` };
      }
      if (!fs.existsSync(deployedDestination)) {
        return { verified: false, error: `Deployed destination does not exist: ${deployedDestination}` };
      }

      const sourceContent = fs.readFileSync(sourceFilePath);
      const deployedContent = fs.readFileSync(deployedDestination);

      const sourceHash = crypto.createHash("sha256").update(sourceContent).digest("hex");
      const deployedHash = crypto.createHash("sha256").update(deployedContent).digest("hex");

      if (sourceHash !== deployedHash) {
        return {
          verified: false,
          error: `Verification hash mismatch. Source: ${sourceHash}, Destination: ${deployedHash}`
        };
      }

      return { verified: true };
    } catch (err: any) {
      return { verified: false, error: `Verification process failed: ${err.message}` };
    }
  }
}
