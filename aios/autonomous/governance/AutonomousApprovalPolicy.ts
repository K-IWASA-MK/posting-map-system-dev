export class AutonomousApprovalPolicy {
  /**
   * Decides approval route based on the proposed changes file scope.
   */
  public evaluateApproval(fileScope: readonly string[]): "AUTO" | "REQUIRE_APPROVAL" | "BLOCK" {
    if (fileScope.length === 0) {
      return "AUTO";
    }

    let overallRoute: "AUTO" | "REQUIRE_APPROVAL" | "BLOCK" = "AUTO";

    for (const file of fileScope) {
      // 1. BLOCK: Any modification in core, system, security or config files
      if (
        file.startsWith("aios/") ||
        file.startsWith("core/") ||
        file.startsWith("kernel/") ||
        file.startsWith("sdk/") ||
        file.includes("security") ||
        file.includes("AGENTS.md") ||
        file.includes("package.json") ||
        file.includes("tsconfig.json")
      ) {
        return "BLOCK"; // Immediate block takes precedence
      }

      // 2. REQUIRE_APPROVAL: Any src file modification in applications
      if (
        file.includes("src/") ||
        file.endsWith(".ts") ||
        file.endsWith(".js") ||
        file.endsWith(".html") ||
        file.endsWith(".css")
      ) {
        overallRoute = "REQUIRE_APPROVAL";
      }

      // 3. AUTO: If it's strictly docs or tests, it keeps the AUTO routing (unless promoted to src check)
      const isDoc = file.startsWith("docs/") || file.endsWith(".md");
      const isTest = file.startsWith("tests/") || file.includes("test");
      if (!isDoc && !isTest) {
        // If it's not docs or tests, and not caught by core, we err on side of caution
        overallRoute = "REQUIRE_APPROVAL";
      }
    }

    return overallRoute;
  }
}
