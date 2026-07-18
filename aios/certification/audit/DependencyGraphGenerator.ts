import * as fs from "fs";
import * as path from "path";

export class DependencyGraphGenerator {
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(__dirname, "../..");
  }

  /**
   * Generates the dependency graph and checks for cyclic dependencies.
   */
  public generate(outputPath?: string): {
    success: boolean;
    graph: Record<string, string[]>;
    hasCycle: boolean;
    error?: string;
  } {
    const runtimes = [
      "execution",
      "validation",
      "audit",
      "learning",
      "completion",
      "orchestration",
      "observability",
      "release",
      "autonomous",
      "certification"
    ];

    const graph: Record<string, string[]> = {};

    for (const runtime of runtimes) {
      graph[runtime] = [];
      const runtimeDir = this.findRuntimePath(runtime);
      if (!runtimeDir || !fs.existsSync(runtimeDir)) {
        continue;
      }

      const tsFiles = this.getTsFiles(runtimeDir);
      const dependencies = new Set<string>();

      for (const file of tsFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        for (const line of lines) {
          if (line.trim().startsWith("import ") && line.includes("from ")) {
            const match = line.match(/from\s+["']([^"']+)["']/);
            if (match) {
              const importPath = match[1];
              // Map import back to one of the runtimes
              for (const depRuntime of runtimes) {
                if (depRuntime === runtime) continue;
                if (importPath.includes(`/${depRuntime}/`)) {
                  dependencies.add(depRuntime);
                }
              }
            }
          }
        }
      }

      graph[runtime] = Array.from(dependencies);
    }

    // Check for cycles
    const hasCycle = this.detectCycle(graph);

    if (outputPath) {
      try {
        fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2), "utf-8");
      } catch (err: any) {
        return { success: false, graph, hasCycle: true, error: `Failed to write graph file: ${err.message}` };
      }
    }

    return {
      success: !hasCycle,
      graph,
      hasCycle
    };
  }

  private findRuntimePath(runtime: string): string | null {
    const possiblePaths = [
      path.join(this.baseDir, runtime),
      path.join(this.baseDir, "development", runtime)
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return null;
  }

  private getTsFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        results = results.concat(this.getTsFiles(filePath));
      } else if (file.endsWith(".ts")) {
        results.push(filePath);
      }
    }
    return results;
  }

  /**
   * Cyclic dependency detection using DFS (recursive helper).
   */
  private detectCycle(graph: Record<string, string[]>): boolean {
    const visited: Record<string, "UNVISITED" | "VISITING" | "VISITED"> = {};
    for (const key of Object.keys(graph)) {
      visited[key] = "UNVISITED";
    }

    const dfs = (node: string): boolean => {
      visited[node] = "VISITING";
      const neighbors = graph[node] || [];

      for (const neighbor of neighbors) {
        if (visited[neighbor] === "VISITING") {
          return true; // Cycle detected
        }
        if (visited[neighbor] === "UNVISITED") {
          if (dfs(neighbor)) {
            return true;
          }
        }
      }

      visited[node] = "VISITED";
      return false;
    };

    for (const node of Object.keys(graph)) {
      if (visited[node] === "UNVISITED") {
        if (dfs(node)) {
          return true;
        }
      }
    }

    return false;
  }
}
