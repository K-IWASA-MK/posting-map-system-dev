import { execSync } from "child_process";

export class GitPushExecutor {
  /**
   * Pushes local commit states to the target remote branch.
   * Runs in the given working directory (defaults to process.cwd()).
   * Force pushes are strictly forbidden.
   */
  public static push(remote: string = "origin-dev", branch: string = "main", cwd: string = process.cwd()): void {
    try {
      execSync(`git push ${remote} HEAD:${branch}`, { cwd, stdio: "pipe" });
    } catch (err: any) {
      throw new Error(`Git push failed: ${err.stdout?.toString() || err.message}`);
    }
  }
}
