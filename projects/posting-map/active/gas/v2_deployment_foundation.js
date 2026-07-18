/**
 * POSTING MAP
 * Phase 31: District Deployment Foundation Core
 */

/**
 * Verification Result Model
 */
class VerificationResult {
  constructor(name, status, message) {
    this.name = name;
    this.status = status; // 'PASS' | 'WARNING' | 'FAILED' | 'SKIPPED'
    this.message = message || '';
    this.timestamp = Date.now();
  }
}

/**
 * Base Rule class
 */
class VerificationRule {
  constructor(name) {
    this.name = name;
  }
  execute() {
    throw new Error("Method execute() must be implemented");
  }
}

/**
 * Rule to verify Spreadsheet connection and basic read access
 */
class SpreadsheetRule extends VerificationRule {
  constructor() {
    super("Spreadsheet Access");
  }
  execute() {
    try {
      const ss = getSS();
      const name = ss.getName();
      const sheets = ss.getSheets();
      if (sheets.length === 0) {
        return new VerificationResult(this.name, "FAILED", "Spreadsheet resolved but contains no sheets.");
      }
      return new VerificationResult(this.name, "PASS", `Connected successfully to spreadsheet: "${name}"`);
    } catch (e) {
      return new VerificationResult(this.name, "FAILED", `Spreadsheet check failed: ${e.toString()}`);
    }
  }
}

/**
 * Rule to verify Google Drive folder access for media storage
 */
class DriveRule extends VerificationRule {
  constructor() {
    super("Google Drive Folder");
  }
  execute() {
    try {
      const folderId = getStorageFolderId();
      if (!folderId) {
        return new VerificationResult(this.name, "WARNING", "STORAGE_PARENT_ID is not configured in properties. Media upload might fail.");
      }
      const folder = DriveApp.getFolderById(folderId);
      const folderName = folder.getName();
      return new VerificationResult(this.name, "PASS", `Drive folder "${folderName}" (${folderId}) resolved successfully.`);
    } catch (e) {
      return new VerificationResult(this.name, "FAILED", `Drive folder check failed: ${e.toString()}`);
    }
  }
}

/**
 * Rule to verify EventLog sheet existence and schema integrity
 */
class EventLogRule extends VerificationRule {
  constructor() {
    super("EventLog Schema");
  }
  execute() {
    try {
      const ss = getSS();
      const sheetName = CONFIG.get("SHEETS.EVENTLOG") || "EventLog";
      let sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow([
          "id", "timestamp", "tenantId", "branchId", "prefectureId", 
          "blockId", "userId", "actionType", "count", "lat", "lng", "meta"
        ]);
        sheet.getRange("A1:L1").setFontWeight("bold").setBackground("#f3f4f6");
        sheet.setFrozenRows(1);
        return new VerificationResult(this.name, "PASS", `EventLog sheet was missing but created successfully.`);
      }
      
      const headers = sheet.getRange(1, 1, 1, 12).getValues()[0];
      const expected = ["id", "timestamp", "tenantId", "branchId", "prefectureId", "blockId", "userId", "actionType", "count", "lat", "lng", "meta"];
      const mismatch = expected.filter((h, idx) => headers[idx] !== h);
      
      if (mismatch.length > 0) {
        return new VerificationResult(this.name, "WARNING", `Schema header mismatch: expected ${expected.join(',')}, got ${headers.join(',')}`);
      }
      
      return new VerificationResult(this.name, "PASS", `EventLog sheet verified with correct schema.`);
    } catch (e) {
      return new VerificationResult(this.name, "FAILED", `EventLog check failed: ${e.toString()}`);
    }
  }
}

/**
 * Core Deployment Foundation Engine
 */
class DistrictDeploymentFoundation {
  static runDiagnostics() {
    const rules = [
      new SpreadsheetRule(),
      new DriveRule(),
      new EventLogRule()
    ];
    
    const results = [];
    let ready = true;
    
    for (const rule of rules) {
      const result = rule.execute();
      results.push(result);
      if (result.status === "FAILED") {
        ready = false;
      }
    }
    
    const status = ready ? "READY" : "NOT READY";
    
    if (ready) {
      try {
        this.recordDeploymentHistory(status);
      } catch (err) {
        results.push(new VerificationResult("Deployment History", "WARNING", `Failed to record deployment history: ${err.toString()}`));
      }
    }
    
    return {
      status: status,
      timestamp: Date.now(),
      results: results
    };
  }

  static recordDeploymentHistory(status) {
    const ss = getSS();
    let historySheet = ss.getSheetByName("DeploymentHistory");
    if (!historySheet) {
      historySheet = ss.insertSheet("DeploymentHistory");
      historySheet.appendRow(["Date", "Status", "Version", "Operator", "Details"]);
      historySheet.getRange("A1:E1").setFontWeight("bold").setBackground("#e5e7eb");
      historySheet.setFrozenRows(1);
    }
    
    const operator = Session.getActiveUser().getEmail() || "system";
    const version = CONFIG.get("VERSION") || "unknown";
    historySheet.appendRow([
      Utilities.formatDate(new Date(), "JST", "yyyy-MM-dd HH:mm:ss"),
      status,
      version,
      operator,
      "Automated verification completed successfully."
    ]);
  }
}

/**
 * Global function entry point
 */
function verifyDistrictDeployment(e) {
  const params = e && e.parameter ? e.parameter : (e || {});
  
  // Cleanup/Rollback Action (deletes spreadsheet and folder under native user credentials)
  if (params.cleanupResources === "true" || params.cleanupResources === true) {
    try {
      const details = [];
      if (params.spreadsheetId) {
        try {
          DriveApp.getFileById(params.spreadsheetId).setTrashed(true);
          details.push(`Spreadsheet trashed: ${params.spreadsheetId}`);
        } catch (e) {
          details.push(`Failed to trash spreadsheet: ${e.toString()}`);
        }
      }
      if (params.storageFolderId) {
        try {
          DriveApp.getFolderById(params.storageFolderId).setTrashed(true);
          details.push(`Folder trashed: ${params.storageFolderId}`);
        } catch (e) {
          details.push(`Failed to trash folder: ${e.toString()}`);
        }
      }
      return {
        success: true,
        message: "Resources cleanup completed.",
        details: details
      };
    } catch (err) {
      return {
        success: false,
        message: "Failed to cleanup resources: " + err.toString()
      };
    }
  }
  
  // Provisioning Action (creates spreadsheet and storage folder under user credentials)
  if (params.provisionDistrict === "true" || params.provisionDistrict === true) {
    try {
      const districtId = params.districtId;
      if (!districtId) {
        return { success: false, message: "Missing districtId parameter" };
      }
      
      const TEMPLATE_SS_ID = "14rblnvJH5hkXHU9-9lhZlDaUi-FenuQQ5DWnTP7TbW4";
      const PARENT_FOLDER_ID = "18SZgoZBw-lWMMvuWwlnah5tFM2RYgsnY";
      
      // 1. Copy template Spreadsheet
      const templateFile = DriveApp.getFileById(TEMPLATE_SS_ID);
      const newSsFile = templateFile.makeCopy(`${districtId} 支部 ポスティングエリアマップ`);
      const newSsId = newSsFile.getId();
      
      // 2. Create media storage Folder
      const parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID);
      const newFolder = parentFolder.createFolder(`${districtId} 支部_STORAGE`);
      const newFolderId = newFolder.getId();
      
      // 3. Auto bootstrap Script Properties
      const props = PropertiesService.getScriptProperties();
      props.setProperties({
        "SPREADSHEET_ID": newSsId,
        "STORAGE_PARENT_ID": newFolderId,
        "DISTRICT_ID": districtId
      });
      
      // Clear cache
      if (typeof CacheService !== "undefined" && CacheService.getScriptCache()) {
        CacheService.getScriptCache().remove("CONFIG_CACHE");
      }
      
      return {
        success: true,
        message: "District successfully provisioned internally.",
        resources: {
          spreadsheetId: newSsId,
          storageFolderId: newFolderId,
          districtId: districtId
        }
      };
    } catch (err) {
      return {
        success: false,
        message: "Failed to provision district inside GAS: " + err.toString()
      };
    }
  }

  // Bootstrap Script Properties directly
  if (params.bootstrapProperties === "true" || params.bootstrapProperties === true) {
    try {
      const props = PropertiesService.getScriptProperties();
      const newProps = {};
      if (params.spreadsheetId) newProps["SPREADSHEET_ID"] = params.spreadsheetId;
      if (params.storageFolderId) newProps["STORAGE_PARENT_ID"] = params.storageFolderId;
      if (params.districtId) newProps["DISTRICT_ID"] = params.districtId;
      
      props.setProperties(newProps);
      
      if (typeof CacheService !== "undefined" && CacheService.getScriptCache()) {
        CacheService.getScriptCache().remove("CONFIG_CACHE");
      }
      
      return {
        success: true,
        message: "Script properties bootstrapped successfully.",
        properties: newProps
      };
    } catch (err) {
      return {
        success: false,
        message: "Failed to bootstrap script properties: " + err.toString()
      };
    }
  }

  return DistrictDeploymentFoundation.runDiagnostics();
}
