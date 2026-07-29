import * as path from "path";
import { CompletionRequest } from "../contracts/CompletionContract";
import { CompletionResult } from "../contracts/CompletionResult";
import { TestValidator } from "../validation/TestValidator";
import { GitCommitExecutor } from "../git/GitCommitExecutor";
import { GitPushExecutor } from "../git/GitPushExecutor";
import { RemoteVerifier } from "../git/RemoteVerifier";
import { HandoverGenerator } from "../handover/HandoverGenerator";

export interface CompletionEvent {
  readonly type: "COMPLETION_COMPLETED" | "COMPLETION_FAILED" | "COMPLETION_BLOCKED";
  readonly sprintId: string;
  readonly commitHash?: string;
  readonly pushed: boolean;
  readonly timestamp: number;
  readonly error?: string;
}

export type CompletionEventSubscriber = (event: CompletionEvent) => void;

export class CompletionRuntime {
  private readonly workspaceRoot: string;
  private readonly subscribers: CompletionEventSubscriber[] = [];

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  public subscribe(sub: CompletionEventSubscriber): () => void {
    this.subscribers.push(sub);
    return () => {
      const idx = this.subscribers.indexOf(sub);
      if (idx !== -1) this.subscribers.splice(idx, 1);
    };
  }

  private emit(event: CompletionEvent): void {
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error(`[CompletionRuntime] Subscriber dispatch failed:`, err);
      }
    }
  }

  /**
   * Orchestrates the completion workflow: Test Validate -> Git Commit -> Git Push -> Remote Verify -> Handover Generate -> Emit Event
   */
  public async processRequest(request: CompletionRequest, gitCwd?: string): Promise<CompletionResult> {
    const cwd = gitCwd || this.workspaceRoot;
    const handoverPath = request.handoverFilePath || path.join(this.workspaceRoot, "HANDOVER.md");

    // 1. Replay Safety check: check if already committed
    let isAlreadyCommitted = false;
    let existingCommitHash: string | undefined;
    try {
      const escapedFiles = request.changedFiles.map((f: string) => `"${f.replace(/"/g, '\\"')}"`).join(" ");
      const statusStdout = require("child_process").execSync(`git status --porcelain ${escapedFiles}`, { cwd, stdio: "pipe" }).toString().trim();
      if (!statusStdout) {
        const lastCommitMsg = require("child_process").execSync("git log -1 --pretty=%B", { cwd, stdio: "pipe" }).toString().trim();
        if (lastCommitMsg === request.commitMessage) {
          isAlreadyCommitted = true;
          existingCommitHash = require("child_process").execSync("git rev-parse HEAD", { cwd, stdio: "pipe" }).toString().trim();
        }
      }
    } catch (e) {
      // Ignore errors, execute full compiler lifecycle normally
    }

    if (isAlreadyCommitted && existingCommitHash) {
      console.log(`[CompletionRuntime] Replay Safety: Target state already committed in hash ${existingCommitHash}. Skipping commit and push.`);
      
      const remoteSync = RemoteVerifier.verify("origin-dev", "main", cwd);
      let handoverUpdated = false;
      try {
        HandoverGenerator.update(handoverPath, {
          sprintId: request.sprintId,
          commitHash: existingCommitHash,
          testsPassed: request.testResult.passed,
          testsTotal: request.testResult.total,
          remoteSync,
          status: "SUCCESS"
        });
        handoverUpdated = true;
      } catch (err: any) {
        console.warn(`[CompletionRuntime] Handover update warning (Replay): ${err.message}`);
      }

      const result: CompletionResult = {
        status: "SUCCESS",
        commitHash: existingCommitHash,
        pushStatus: "SKIPPED",
        remoteSync,
        handoverUpdated
      };

      this.emit({
        type: "COMPLETION_COMPLETED",
        sprintId: request.sprintId,
        commitHash: existingCommitHash,
        pushed: false,
        timestamp: Date.now()
      });

      return result;
    }

    // 2. Validate test results quality gate
    const testCheck = TestValidator.validate(request);
    if (!testCheck.valid) {
      this.emit({
        type: "COMPLETION_BLOCKED",
        sprintId: request.sprintId,
        pushed: false,
        timestamp: Date.now(),
        error: testCheck.error
      });
      return {
        status: "BLOCKED",
        pushStatus: "SKIPPED",
        remoteSync: false,
        handoverUpdated: false,
        error: testCheck.error
      };
    }

    let commitHash: string;
    // 3. Execute Git Commit
    try {
      commitHash = GitCommitExecutor.commit(request.changedFiles, request.commitMessage, cwd);
    } catch (err: any) {
      this.emit({
        type: "COMPLETION_FAILED",
        sprintId: request.sprintId,
        pushed: false,
        timestamp: Date.now(),
        error: err.message
      });
      return {
        status: "FAILED",
        pushStatus: "FAILED",
        remoteSync: false,
        handoverUpdated: false,
        error: err.message
      };
    }

    // 4. Execute Git Push
    try {
      GitPushExecutor.push("origin-dev", "main", cwd);
    } catch (err: any) {
      this.emit({
        type: "COMPLETION_FAILED",
        sprintId: request.sprintId,
        commitHash,
        pushed: false,
        timestamp: Date.now(),
        error: err.message
      });
      return {
        status: "FAILED",
        commitHash,
        pushStatus: "FAILED",
        remoteSync: false,
        handoverUpdated: false,
        error: err.message
      };
    }

    // 5. Verify Remote
    const remoteSync = RemoteVerifier.verify("origin-dev", "main", cwd);
    if (!remoteSync) {
      this.emit({
        type: "COMPLETION_FAILED",
        sprintId: request.sprintId,
        commitHash,
        pushed: true,
        timestamp: Date.now(),
        error: "Remote sync verification failed after push."
      });
      return {
        status: "FAILED",
        commitHash,
        pushStatus: "SUCCESS",
        remoteSync: false,
        handoverUpdated: false,
        error: "Remote sync verification failed."
      };
    }

    // 6. Generate HANDOVER
    let handoverUpdated = false;
    let status: "SUCCESS" | "WARNING" = "SUCCESS";
    let warningError: string | undefined;
    try {
      HandoverGenerator.update(handoverPath, {
        sprintId: request.sprintId,
        commitHash,
        testsPassed: request.testResult.passed,
        testsTotal: request.testResult.total,
        remoteSync,
        status: "SUCCESS"
      });
      handoverUpdated = true;
    } catch (err: any) {
      status = "WARNING";
      warningError = err.message;
      console.warn(`[CompletionRuntime] Handover update warning: ${err.message}`);
    }

    // 7. Emit Completion Completed Event
    this.emit({
      type: "COMPLETION_COMPLETED",
      sprintId: request.sprintId,
      commitHash,
      pushed: true,
      timestamp: Date.now()
    });

    return {
      status,
      commitHash,
      pushStatus: "SUCCESS",
      remoteSync,
      handoverUpdated,
      error: warningError
    };
  }
}
