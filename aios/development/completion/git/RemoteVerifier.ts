import { execSync } from "child_process";

export class RemoteVerifier {
  /**
   * Fetches latest remote heads and asserts that the local HEAD matches the remote branch HEAD.
   * Runs in the given working directory (defaults to process.cwd()).
   */
  public static verify(remote: string = "origin-dev", branch: string = "main", cwd: string = process.cwd()): boolean {
    try {
      // Fetch latest updates from remote first
      execSync(`git fetch ${remote}`, { cwd, stdio: "pipe" });

      const localSha = execSync("git rev-parse HEAD", { cwd, stdio: "pipe" }).toString().trim();
      const remoteSha = execSync(`git rev-parse ${remote}/${branch}`, { cwd, stdio: "pipe" }).toString().trim();

      return localSha === remoteSha;
    } catch (err: any) {
      console.warn(`[RemoteVerifier] Remote verification execution failed: ${err.message}`);
      return false;
    }
  }
}
