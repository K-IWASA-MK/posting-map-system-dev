import { execSync } from "child_process";

export class GitCommitExecutor {
  /**
   * Stages specified files and commits them. Returns the generated commit SHA.
   * Runs in the given working directory (defaults to process.cwd()).
   * Does NOT auto-fix, resolve conflicts, or perform force commits.
   */
  public static commit(files: readonly string[], message: string, cwd: string = process.cwd()): string {
    if (files.length === 0) {
      throw new Error("No files specified for commit.");
    }
    if (!message) {
      throw new Error("Commit message cannot be empty.");
    }

    try {
      // Escaping file paths to avoid shell injection
      const escapedFiles = files.map(f => `"${f.replace(/"/g, '\\"')}"`).join(" ");
      execSync(`git add ${escapedFiles}`, { cwd, stdio: "pipe" });

      const escapedMessage = message.replace(/"/g, '\\"').replace(/`/g, "\\`").replace(/\$/g, "\\$");
      execSync(`git commit -m "${escapedMessage}"`, { cwd, stdio: "pipe" });

      const hashBuffer = execSync("git rev-parse HEAD", { cwd, stdio: "pipe" });
      return hashBuffer.toString().trim();
    } catch (err: any) {
      throw new Error(`Git commit failed: ${err.stdout?.toString() || err.message}`);
    }
  }
}
