import * as crypto from "crypto";

export class SourceHashGenerator {
  /**
   * Generates a deterministic SHA-256 hash from the raw contents of the input files.
   * Order of hash updating is strictly defined to ensure deterministic output.
   */
  public static generate(inputs: {
    researchJson: string;
    deploymentJson: string;
    activationJson: string;
    assetRegistryJson: string;
  }): string {
    const hash = crypto.createHash("sha256");
    hash.update(inputs.researchJson);
    hash.update(inputs.deploymentJson);
    hash.update(inputs.activationJson);
    hash.update(inputs.assetRegistryJson);
    return hash.digest("hex");
  }
}
