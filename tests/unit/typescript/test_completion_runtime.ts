import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { CompletionRuntime, CompletionEvent } from "../../../aios/development/completion/runtime/CompletionRuntime";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

// Temporary directory configuration
const TEST_DIR = path.join(__dirname, "temp-git-test");
const REMOTE_DIR = path.join(__dirname, "temp-git-remote");
const DUMMY_HANDOVER_PATH = path.join(TEST_DIR, "HANDOVER.md");

function cleanDirs() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(REMOTE_DIR)) {
    fs.rmSync(REMOTE_DIR, { recursive: true, force: true });
  }
}

function setupGitHarness() {
  cleanDirs();
  fs.mkdirSync(TEST_DIR, { recursive: true });
  fs.mkdirSync(REMOTE_DIR, { recursive: true });

  // Initialize bare remote repo
  execSync("git init --bare", { cwd: REMOTE_DIR, stdio: "pipe" });

  // Initialize local repo
  execSync("git init", { cwd: TEST_DIR, stdio: "pipe" });
  execSync("git config user.name \"AIOS Test\"", { cwd: TEST_DIR, stdio: "pipe" });
  execSync("git config user.email \"aios-test@development.os\"", { cwd: TEST_DIR, stdio: "pipe" });
  execSync("git config init.defaultBranch main", { cwd: TEST_DIR, stdio: "pipe" });

  // Create initial commit
  fs.writeFileSync(path.join(TEST_DIR, "init.txt"), "first init file", "utf-8");
  execSync("git add init.txt", { cwd: TEST_DIR, stdio: "pipe" });
  execSync("git commit -m \"initial commit\"", { cwd: TEST_DIR, stdio: "pipe" });

  // Add remote
  execSync(`git remote add origin-dev "${REMOTE_DIR}"`, { cwd: TEST_DIR, stdio: "pipe" });
  execSync("git push -u origin-dev HEAD:main", { cwd: TEST_DIR, stdio: "pipe" });

  // Create dummy HANDOVER.md
  fs.writeFileSync(DUMMY_HANDOVER_PATH, "# Handover Document\n", "utf-8");
}

async function runTest() {
  console.log("🧪 Running Completion Runtime Foundation Test...\n");

  // ==========================================
  // Scenario 1: Normal Completion Flow & Event SUCCESS check
  // ==========================================
  {
    setupGitHarness();

    const runtime = new CompletionRuntime(TEST_DIR);
    const events: CompletionEvent[] = [];
    runtime.subscribe((ev: CompletionEvent) => events.push(ev));

    // Write a dummy file to commit
    fs.writeFileSync(path.join(TEST_DIR, "code.js"), "console.log('code');", "utf-8");

    const request = {
      sprintId: "SPRINT-TEST-01",
      phase: "implementation",
      implementationStatus: "COMPLETED" as const,
      testResult: { passed: 10, failed: 0, total: 10, qualityGate: "PASS" as const },
      changedFiles: ["code.js"],
      commitMessage: "feat: sprint test commit",
      handoverFilePath: DUMMY_HANDOVER_PATH
    };

    const result = await runtime.processRequest(request, TEST_DIR);
    
    assert(result.status === "SUCCESS", "Completion must return SUCCESS.");
    assert(result.pushStatus === "SUCCESS", "Remote push must succeed.");
    assert(result.remoteSync === true, "Remote sync must be verified.");
    assert(result.handoverUpdated === true, "Handover.md must be updated.");

    // Event check
    assert(events.length === 1, "Exactly 1 event should be published.");
    assert(events[0].type === "COMPLETION_COMPLETED", "Published event must be COMPLETION_COMPLETED.");
    assert(events[0].sprintId === "SPRINT-TEST-01", "SprintId matches.");
    assert(events[0].pushed === true, "pushed state is true.");
    assert(events[0].commitHash === result.commitHash, "Event commitHash matches.");

    // Handover file check
    const content = fs.readFileSync(DUMMY_HANDOVER_PATH, "utf-8");
    assert(content.includes("Sprint: SPRINT-TEST-01"), "Handover must contain Sprint name.");
    assert(content.includes(`Commit: ${result.commitHash}`), "Handover must contain commit hash.");
    assert(content.includes("Remote: SYNCED"), "Handover must contain Remote sync state.");

    console.log("   ✓ Normal Completion Flow & Event SUCCESS verified.");
  }

  // ==========================================
  // Scenario 2: Test Failure Block
  // ==========================================
  {
    setupGitHarness();

    const runtime = new CompletionRuntime(TEST_DIR);
    const events: CompletionEvent[] = [];
    runtime.subscribe((ev: CompletionEvent) => events.push(ev));

    fs.writeFileSync(path.join(TEST_DIR, "code.js"), "console.log('failed code');", "utf-8");

    // Failure case: failed > 0
    const request = {
      sprintId: "SPRINT-TEST-02",
      phase: "implementation",
      implementationStatus: "COMPLETED" as const,
      testResult: { passed: 9, failed: 1, total: 10, qualityGate: "FAIL" as const },
      changedFiles: ["code.js"],
      commitMessage: "feat: failed sprint commit",
      handoverFilePath: DUMMY_HANDOVER_PATH
    };

    const result = await runtime.processRequest(request, TEST_DIR);

    assert(result.status === "BLOCKED", "Test failures must block transition.");
    assert(result.pushStatus === "SKIPPED", "Push is skipped.");

    // Event Check
    assert(events.length === 1 && events[0].type === "COMPLETION_BLOCKED", "Emits COMPLETION_BLOCKED event.");

    // Verify no commit was written
    const statusStdout = execSync("git status --porcelain", { cwd: TEST_DIR, stdio: "pipe" }).toString().trim();
    assert(statusStdout.includes("code.js"), "Files remain untracked / dirty.");

    console.log("   ✓ Test Failure Block verified.");
  }

  // ==========================================
  // Scenario 3: Git Push Failure
  // ==========================================
  {
    setupGitHarness();

    const runtime = new CompletionRuntime(TEST_DIR);
    const events: CompletionEvent[] = [];
    runtime.subscribe((ev: CompletionEvent) => events.push(ev));

    // Force push failure by deleting the remote URL setting or folder
    execSync("git remote remove origin-dev", { cwd: TEST_DIR, stdio: "pipe" });

    fs.writeFileSync(path.join(TEST_DIR, "code.js"), "console.log('unpushed');", "utf-8");

    const request = {
      sprintId: "SPRINT-TEST-03",
      phase: "implementation",
      implementationStatus: "COMPLETED" as const,
      testResult: { passed: 10, failed: 0, total: 10, qualityGate: "PASS" as const },
      changedFiles: ["code.js"],
      commitMessage: "feat: unpushed sprint commit",
      handoverFilePath: DUMMY_HANDOVER_PATH
    };

    const result = await runtime.processRequest(request, TEST_DIR);

    assert(result.status === "FAILED", "Push failure transitions state to FAILED.");
    assert(result.pushStatus === "FAILED", "pushStatus must report FAILED.");
    assert(events.length === 1 && events[0].type === "COMPLETION_FAILED", "Emits COMPLETION_FAILED event.");

    console.log("   ✓ Git Push Failure transition verified.");
  }

  // ==========================================
  // Scenario 4: Remote Sync Verification Failure
  // ==========================================
  {
    setupGitHarness();

    const runtime = new CompletionRuntime(TEST_DIR);
    
    // We mock remote push execution, but then local and remote get out of sync.
    // To simulate sync failure after successful push:
    // We push code, but then force commit another revision directly on the remote bare repo
    // or simulate this by changing remote tracking branch.
    // Let's create an out-of-sync condition:
    // Push is successful, but remote has a different commit hash than HEAD due to race.
    // In our simplified test harness: we make a push, but point origin-dev main to initial commit.
    fs.writeFileSync(path.join(TEST_DIR, "code.js"), "console.log('sync fail');", "utf-8");

    const request = {
      sprintId: "SPRINT-TEST-04",
      phase: "implementation",
      implementationStatus: "COMPLETED" as const,
      testResult: { passed: 10, failed: 0, total: 10, qualityGate: "PASS" as const },
      changedFiles: ["code.js"],
      commitMessage: "feat: sync fail sprint commit",
      handoverFilePath: DUMMY_HANDOVER_PATH
    };

    // Before verify, we tamper with the remote main ref
    // We run the runtime, but mock push executor by removing tracking branch so fetch gets out of sync.
    // Let's force a remote branch update behind the scenes:
    // We execute commit, push, then before RemoteVerifier checks, we reset remote main to initial commit.
    // Let's override GitPushExecutor push locally by monkey patching if needed or simply update REMOTE bare ref.
    const customRuntime = new class extends CompletionRuntime {
      public async processRequest(req: any, gc?: string): Promise<any> {
        const res = await super.processRequest(req, gc);
        return res;
      }
    }(TEST_DIR);

    // Let's run a test where RemoteVerifier fetch succeeds but SHA mismatch occurs.
    // We can do this by executing a push, then immediately resetting remote branch ref in REMOTE_DIR bare repo!
    // Since bare repo ref is stored under refs/heads/main:
    // refs/heads/main contains the HEAD commit hash.
    // If we write the initial commit hash to REMOTE_DIR/refs/heads/main right after push, it will cause sync failure!
    
    // Let's subscribe to normal flow, reset ref in callback
    const events: CompletionEvent[] = [];
    runtime.subscribe((ev: CompletionEvent) => {
      events.push(ev);
    });

    // Verify initially
    const mockSyncVerifyResult = require("../../../aios/development/completion/git/RemoteVerifier").RemoteVerifier.verify("origin-dev", "main", TEST_DIR);
    assert(mockSyncVerifyResult === true, "Should initially be in sync.");

    // Update refs/heads/main in REMOTE bare repo to a dummy hash
    const refPath = path.join(REMOTE_DIR, "refs", "heads", "main");
    if (fs.existsSync(refPath)) {
      fs.writeFileSync(refPath, "1234567890123456789012345678901234567890\n", "utf-8");
    }
    const failedSyncResult = require("../../../aios/development/completion/git/RemoteVerifier").RemoteVerifier.verify("origin-dev", "main", TEST_DIR);
    assert(failedSyncResult === false, "RemoteVerifier must fail when HEAD hash does not match.");

    console.log("   ✓ Remote Sync Verification Failure verified.");
  }

  // ==========================================
  // Scenario 5: Handover Failure Graceful Warning
  // ==========================================
  {
    setupGitHarness();

    const runtime = new CompletionRuntime(TEST_DIR);
    fs.writeFileSync(path.join(TEST_DIR, "code.js"), "console.log('graceful');", "utf-8");

    const request = {
      sprintId: "SPRINT-TEST-05",
      phase: "implementation",
      implementationStatus: "COMPLETED" as const,
      testResult: { passed: 10, failed: 0, total: 10, qualityGate: "PASS" as const },
      changedFiles: ["code.js"],
      commitMessage: "feat: graceful sprint commit",
      handoverFilePath: "/non-existing-path/HANDOVER.md" // Invalid path to trigger write error
    };

    const result = await runtime.processRequest(request, TEST_DIR);

    assert(result.status === "WARNING", "Should return WARNING state when handover write fails.");
    assert(result.handoverUpdated === false, "handoverUpdated must be false.");
    assert(result.remoteSync === true, "Git commit and push completed successfully.");

    console.log("   ✓ Handover Failure Graceful Warning verified.");
  }

  // ==========================================
  // Scenario 6: Replay Safety (二重コミット防止)
  // ==========================================
  {
    setupGitHarness();

    const runtime = new CompletionRuntime(TEST_DIR);
    fs.writeFileSync(path.join(TEST_DIR, "code.js"), "console.log('replay');", "utf-8");

    const request = {
      sprintId: "SPRINT-TEST-06",
      phase: "implementation",
      implementationStatus: "COMPLETED" as const,
      testResult: { passed: 10, failed: 0, total: 10, qualityGate: "PASS" as const },
      changedFiles: ["code.js"],
      commitMessage: "feat: replay sprint commit",
      handoverFilePath: DUMMY_HANDOVER_PATH
    };

    // First run (Commit & Push happens)
    const result1 = await runtime.processRequest(request, TEST_DIR);
    assert(result1.status === "SUCCESS" && result1.pushStatus === "SUCCESS", "First run succeeds.");

    // Second run (Replay triggers)
    const result2 = await runtime.processRequest(request, TEST_DIR);
    console.log("DEBUG REPLAY RESULT2:", result2);
    assert(result2.status === "SUCCESS", "Second run succeeds.");
    assert(result2.pushStatus === "SKIPPED", "Second run skips git push due to replay safety.");
    assert(result2.commitHash === result1.commitHash, "Hashes match.");

    console.log("   ✓ Replay Safety verified.");
  }

  // Cleanup
  cleanDirs();

  console.log("\n==========================================");
  console.log("🎉 COMPLETION RUNTIME FOUNDATION PASSED");
  console.log("==========================================\n");
}

runTest().catch((err) => {
  console.error("❌ Test failed with error:", err);
  process.exit(1);
});
