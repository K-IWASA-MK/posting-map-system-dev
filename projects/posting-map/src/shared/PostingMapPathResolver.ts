import * as path from "path";
import { WorkspacePathAuditLogger } from "./audit/WorkspacePathAuditLogger";

export class PostingMapPathResolver {
  private readonly workspaceRoot: string;

  constructor(workspaceRoot?: string) {
    if (workspaceRoot) {
      const normalized = path.resolve(workspaceRoot);
      if (normalized.endsWith(path.join("projects", "posting-map"))) {
        this.workspaceRoot = path.resolve(normalized, "..", "..");
      } else {
        this.workspaceRoot = normalized;
      }
    } else {
      this.workspaceRoot = path.resolve(__dirname, "..", "..", "..", "..");
    }
  }

  public getWorkspaceRoot(): string {
    const res = this.workspaceRoot;
    this.logCall("getWorkspaceRoot", res);
    return res;
  }

  public getProjectRoot(): string {
    const res = path.join(this.workspaceRoot, "projects", "posting-map");
    this.logCall("getProjectRoot", res);
    return res;
  }

  public getFieldOperationsPlatformRoot(): string {
    const res = path.join(this.getWorkspaceRootInternal(), "projects", "posting-map", "FIELD_OPERATIONS_PLATFORM");
    this.logCall("getFieldOperationsPlatformRoot", res);
    return res;
  }

  public getBranchRoot(): string {
    const res = path.join(this.getWorkspaceRootInternal(), "projects", "posting-map", "FIELD_OPERATIONS_PLATFORM", "03_BRANCH");
    this.logCall("getBranchRoot", res);
    return res;
  }

  public getBranchDirectory(districtName: string): string {
    const res = path.join(this.getWorkspaceRootInternal(), "projects", "posting-map", "FIELD_OPERATIONS_PLATFORM", "03_BRANCH", districtName);
    this.logCall("getBranchDirectory", res, { districtName });
    return res;
  }

  public getDashboardRoot(): string {
    const res = path.join(this.getWorkspaceRootInternal(), "projects", "posting-map", "active", "dashboard");
    this.logCall("getDashboardRoot", res);
    return res;
  }

  public getAssetRegistryPath(): string {
    const res = path.join(this.getWorkspaceRootInternal(), "projects", "posting-map", "active", "dashboard", "clients", "AssetRegistry.json");
    this.logCall("getAssetRegistryPath", res);
    return res;
  }

  private getWorkspaceRootInternal(): string {
    return this.workspaceRoot;
  }

  private logCall(resolverMethod: string, targetPath: string, executionContext?: Record<string, any>) {
    try {
      WorkspacePathAuditLogger.getInstance().logEvent({
        componentName: "PostingMapPathResolver",
        eventType: "RESOLVER_CALLED",
        resolverMethod,
        targetPath,
        executionContext
      });
    } catch {
      // Non-blocking
    }
  }
}
