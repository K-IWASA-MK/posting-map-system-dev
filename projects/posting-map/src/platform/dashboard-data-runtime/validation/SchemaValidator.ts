export class SchemaValidator {
  /**
   * Validates election-research-result.json schema
   */
  public static validateElectionResearch(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Data is null, undefined, or not an object."] };
    }

    if (!data.district || typeof data.district !== "object") {
      errors.push("Missing or invalid 'district' object.");
    } else {
      if (typeof data.district.id !== "string" || !data.district.id.trim()) {
        errors.push("Invalid or missing 'district.id' (expected non-empty string).");
      }
      if (typeof data.district.name !== "string" || !data.district.name.trim()) {
        errors.push("Invalid or missing 'district.name' (expected non-empty string).");
      }
    }

    if (!Array.isArray(data.municipalities)) {
      errors.push("Missing or invalid 'municipalities' array.");
    } else {
      data.municipalities.forEach((m: any, idx: number) => {
        if (!m || typeof m !== "object") {
          errors.push(`Municipality at index ${idx} is not an object.`);
          return;
        }
        if (typeof m.name !== "string" || !m.name.trim()) {
          errors.push(`Municipality at index ${idx} has missing or invalid 'name'.`);
        }
        if (!Array.isArray(m.electionHistory)) {
          errors.push(`Municipality '${m.name || idx}' has missing or invalid 'electionHistory' array.`);
        } else {
          m.electionHistory.forEach((h: any, hIdx: number) => {
            if (!h || typeof h !== "object") {
              errors.push(`Election history at index ${hIdx} in municipality '${m.name || idx}' is not an object.`);
              return;
            }
            if (typeof h.type !== "string" || !h.type.trim()) {
              errors.push(`Election history at index ${hIdx} in municipality '${m.name || idx}' has missing or invalid 'type'.`);
            }
            if (typeof h.year !== "number") {
              errors.push(`Election history at index ${hIdx} in municipality '${m.name || idx}' has missing or invalid 'year' (expected number).`);
            }
            if (typeof h.turnout !== "number") {
              errors.push(`Election history at index ${hIdx} in municipality '${m.name || idx}' has missing or invalid 'turnout' (expected number).`);
            }
          });
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validates deployment.json schema
   */
  public static validateDeployment(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Data is null, undefined, or not an object."] };
    }

    if (!data.district || typeof data.district !== "object") {
      errors.push("Missing or invalid 'district' object.");
    } else {
      if (typeof data.district.id !== "string" || !data.district.id.trim()) {
        errors.push("Invalid or missing 'district.id' (expected non-empty string).");
      }
      if (typeof data.district.name !== "string" || !data.district.name.trim()) {
        errors.push("Invalid or missing 'district.name' (expected non-empty string).");
      }
    }

    if (!data.resources || typeof data.resources !== "object") {
      errors.push("Missing or invalid 'resources' object.");
    } else {
      if (typeof data.resources.spreadsheetId !== "string") {
        errors.push("Invalid 'resources.spreadsheetId' (expected string).");
      }
      if (typeof data.resources.storageFolderId !== "string") {
        errors.push("Invalid 'resources.storageFolderId' (expected string).");
      }
      if (typeof data.resources.scriptId !== "string") {
        errors.push("Invalid 'resources.scriptId' (expected string).");
      }
      if (typeof data.resources.webAppUrl !== "string") {
        errors.push("Invalid 'resources.webAppUrl' (expected string).");
      }
    }

    if (!data.provisioning || typeof data.provisioning !== "object") {
      errors.push("Missing or invalid 'provisioning' object.");
    } else {
      if (typeof data.provisioning.status !== "string" || !data.provisioning.status.trim()) {
        errors.push("Invalid or missing 'provisioning.status' (expected non-empty string).");
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validates activation.json schema
   */
  public static validateActivation(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Data is null, undefined, or not an object."] };
    }

    if (!data.district || typeof data.district !== "object") {
      errors.push("Missing or invalid 'district' object.");
    } else {
      if (typeof data.district.id !== "string" || !data.district.id.trim()) {
        errors.push("Invalid or missing 'district.id' (expected non-empty string).");
      }
      if (typeof data.district.name !== "string" || !data.district.name.trim()) {
        errors.push("Invalid or missing 'district.name' (expected non-empty string).");
      }
    }

    if (typeof data.status !== "string" || !data.status.trim()) {
      errors.push("Invalid or missing 'status' (expected non-empty string).");
    }

    if (!data.checks || typeof data.checks !== "object") {
      errors.push("Missing or invalid 'checks' object.");
    } else {
      if (!data.checks.line || typeof data.checks.line !== "object" || typeof data.checks.line.status !== "string") {
        errors.push("Invalid or missing 'checks.line.status' (expected string).");
      }
      if (!data.checks.gas || typeof data.checks.gas !== "object" || typeof data.checks.gas.status !== "string") {
        errors.push("Invalid or missing 'checks.gas.status' (expected string).");
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validates AssetRegistry.json schema
   */
  public static validateAssetRegistry(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Data is null, undefined, or not an object."] };
    }

    if (!data.masters || typeof data.masters !== "object") {
      errors.push("Missing or invalid 'masters' object.");
    } else {
      if (!data.masters.districts || typeof data.masters.districts !== "object") {
        errors.push("Missing or invalid 'masters.districts' object.");
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validates output dashboard-data.json Contract schema
   */
  public static validateDashboardData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data || typeof data !== "object") {
      return { valid: false, errors: ["Data is null, undefined, or not an object."] };
    }

    if (!data.metadata || typeof data.metadata !== "object") {
      errors.push("Missing or invalid 'metadata' object.");
    } else {
      if (typeof data.metadata.generatedAt !== "string") {
        errors.push("Invalid or missing 'metadata.generatedAt' (expected string).");
      }
      if (typeof data.metadata.runtimeVersion !== "string") {
        errors.push("Invalid or missing 'metadata.runtimeVersion' (expected string).");
      }
      if (typeof data.metadata.sourceHash !== "string") {
        errors.push("Invalid or missing 'metadata.sourceHash' (expected string).");
      }
      if (typeof data.metadata.executionId !== "string") {
        errors.push("Invalid or missing 'metadata.executionId' (expected string).");
      }
      if (typeof data.metadata.schemaVersion !== "string") {
        errors.push("Invalid or missing 'metadata.schemaVersion' (expected string).");
      } else if (data.metadata.schemaVersion !== "v1") {
        errors.push(`Unsupported or future schema version: ${data.metadata.schemaVersion}`);
      }
    }

    if (!Array.isArray(data.districts)) {
      errors.push("Missing or invalid 'districts' array.");
    } else {
      data.districts.forEach((d: any, idx: number) => {
        if (!d || typeof d !== "object") {
          errors.push(`District at index ${idx} is not an object.`);
          return;
        }
        if (typeof d.id !== "string") errors.push(`District at index ${idx} has invalid 'id'.`);
        if (typeof d.name !== "string") errors.push(`District at index ${idx} has invalid 'name'.`);
        if (typeof d.status !== "string") errors.push(`District at index ${idx} has invalid 'status'.`);
      });
    }

    if (!Array.isArray(data.municipalities)) {
      errors.push("Missing or invalid 'municipalities' array.");
    } else {
      data.municipalities.forEach((m: any, idx: number) => {
        if (!m || typeof m !== "object") {
          errors.push(`Municipality at index ${idx} is not an object.`);
          return;
        }
        if (typeof m.districtId !== "string") errors.push(`Municipality at index ${idx} has invalid 'districtId'.`);
        if (typeof m.name !== "string") errors.push(`Municipality at index ${idx} has invalid 'name'.`);
        if (typeof m.historyCount !== "number") errors.push(`Municipality at index ${idx} has invalid 'historyCount'.`);
      });
    }

    if (!Array.isArray(data.turnoutComparison)) {
      errors.push("Missing or invalid 'turnoutComparison' array.");
    } else {
      data.turnoutComparison.forEach((tc: any, idx: number) => {
        if (!tc || typeof tc !== "object") {
          errors.push(`TurnoutComparison at index ${idx} is not an object.`);
          return;
        }
        if (typeof tc.districtId !== "string") errors.push(`TurnoutComparison at index ${idx} has invalid 'districtId'.`);
        if (typeof tc.municipalityName !== "string") errors.push(`TurnoutComparison at index ${idx} has invalid 'municipalityName'.`);
        if (typeof tc.type !== "string") errors.push(`TurnoutComparison at index ${idx} has invalid 'type'.`);
        if (typeof tc.year !== "number") errors.push(`TurnoutComparison at index ${idx} has invalid 'year'.`);
        if (typeof tc.turnout !== "number") errors.push(`TurnoutComparison at index ${idx} has invalid 'turnout'.`);
      });
    }

    if (!Array.isArray(data.branchStatus)) {
      errors.push("Missing or invalid 'branchStatus' array.");
    } else {
      data.branchStatus.forEach((bs: any, idx: number) => {
        if (!bs || typeof bs !== "object") {
          errors.push(`BranchStatus at index ${idx} is not an object.`);
          return;
        }
        if (typeof bs.districtId !== "string") errors.push(`BranchStatus at index ${idx} has invalid 'districtId'.`);
        if (typeof bs.districtName !== "string") errors.push(`BranchStatus at index ${idx} has invalid 'districtName'.`);
        if (typeof bs.provisioningStatus !== "string") errors.push(`BranchStatus at index ${idx} has invalid 'provisioningStatus'.`);
        if (typeof bs.activationStatus !== "string") errors.push(`BranchStatus at index ${idx} has invalid 'activationStatus'.`);
        if (typeof bs.activatedAt !== "number") errors.push(`BranchStatus at index ${idx} has invalid 'activatedAt'.`);
        if (typeof bs.lineCheck !== "string") errors.push(`BranchStatus at index ${idx} has invalid 'lineCheck'.`);
        if (typeof bs.gasCheck !== "string") errors.push(`BranchStatus at index ${idx} has invalid 'gasCheck'.`);
      });
    }

    if (!Array.isArray(data.assetStatus)) {
      errors.push("Missing or invalid 'assetStatus' array.");
    } else {
      data.assetStatus.forEach((as: any, idx: number) => {
        if (!as || typeof as !== "object") {
          errors.push(`AssetStatus at index ${idx} is not an object.`);
          return;
        }
        if (typeof as.districtId !== "string") errors.push(`AssetStatus at index ${idx} has invalid 'districtId'.`);
        if (typeof as.spreadsheetId !== "string") errors.push(`AssetStatus at index ${idx} has invalid 'spreadsheetId'.`);
        if (typeof as.storageFolderId !== "string") errors.push(`AssetStatus at index ${idx} has invalid 'storageFolderId'.`);
        if (typeof as.scriptId !== "string") errors.push(`AssetStatus at index ${idx} has invalid 'scriptId'.`);
        if (typeof as.webAppUrl !== "string") errors.push(`AssetStatus at index ${idx} has invalid 'webAppUrl'.`);
        if (typeof as.inRegistry !== "boolean") errors.push(`AssetStatus at index ${idx} has invalid 'inRegistry'.`);
      });
    }

    return { valid: errors.length === 0, errors };
  }
}
