import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export interface FreezeState {
  readonly generation: string;
  readonly status: "FROZEN" | "UNFROZEN";
  readonly allowedChanges: readonly string[];
  readonly createdAt: string;
  readonly hash: string;
}

export class GenerationFreezeController {
  private readonly statePath: string;
  private state: FreezeState | null = null;

  constructor(statePath?: string) {
    this.statePath = statePath || path.join(__dirname, "../../../freeze-state.json");
    this.loadState();
  }

  /**
   * Discovers and loads freeze state from disk persistence.
   */
  public loadState(): void {
    if (fs.existsSync(this.statePath)) {
      try {
        const raw = fs.readFileSync(this.statePath, "utf-8");
        this.state = JSON.parse(raw);
      } catch (err) {
        console.error(`[FreezeController] Failed to parse freeze-state: ${err}`);
        this.state = null;
      }
    } else {
      this.state = null;
    }
  }

  /**
   * Freezes the specified generation and persists state.
   */
  public freeze(generation: string): FreezeState {
    const rawData = {
      generation,
      status: "FROZEN" as const,
      allowedChanges: ["BUGFIX", "SECURITY_PATCH"],
      createdAt: new Date().toISOString()
    };

    // Calculate integrity hash for state verification
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(rawData))
      .digest("hex");

    const finalState: FreezeState = {
      ...rawData,
      hash
    };

    fs.writeFileSync(this.statePath, JSON.stringify(finalState, null, 2), "utf-8");
    this.state = finalState;
    return finalState;
  }

  public unfreeze(): void {
    if (fs.existsSync(this.statePath)) {
      fs.unlinkSync(this.statePath);
    }
    this.state = null;
  }

  /**
   * Policy firewall for code updates.
   * Restricts updates to frozen runtimes/contracts unless marked as BUGFIX or SECURITY_PATCH.
   */
  public validateModification(
    filePath: string,
    changesType: "FEATURE" | "BUGFIX" | "SECURITY_PATCH"
  ): { allowed: boolean; reason?: string } {
    if (!this.state || this.state.status !== "FROZEN") {
      return { allowed: true };
    }

    // Freeze targets include core runtimes under aios/ (except tests/patches) and contracts
    const isCoreFile =
      (filePath.startsWith("aios/") && !filePath.includes("/tests/") && !filePath.includes("/certification/")) ||
      filePath.includes("contracts");

    if (isCoreFile) {
      if (changesType === "FEATURE") {
        return {
          allowed: false,
          reason: `Freeze Block: Core updates under ${filePath} are blocked. Generation ${this.state.generation} is FROZEN. Only BUGFIX or SECURITY_PATCH modifications allowed.`
        };
      }
    }

    return { allowed: true };
  }

  public getState(): FreezeState | null {
    return this.state;
  }
}
