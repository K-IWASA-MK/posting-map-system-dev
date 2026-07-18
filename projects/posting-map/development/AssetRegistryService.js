/**
 * POSTING MAP
 * AssetRegistryService — Programmatic Registry interface for AIOS Core
 */

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'AssetRegistry.json');

class AssetRegistryService {
  static loadRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
      throw new Error(`AssetRegistry.json not found at: ${REGISTRY_PATH}. Please run the migration script first.`);
    }
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  }

  static getTemplateSpreadsheet() {
    const reg = this.loadRegistry();
    return reg.templates.spreadsheetId || null;
  }

  static getTemplateGAS() {
    const reg = this.loadRegistry();
    return {
      scriptId: reg.templates.scriptId || null,
      webAppUrl: reg.templates.webAppUrl || null,
      version: reg.templates.version || null
    };
  }

  static getElectionMaster() {
    const reg = this.loadRegistry();
    return reg.masters.global.electionMaster || null;
  }

  static getPostalMaster() {
    const reg = this.loadRegistry();
    return reg.masters.global.postalMaster || null;
  }

  static getAddressMaster() {
    const reg = this.loadRegistry();
    return reg.masters.global.addressMaster || null;
  }

  static getReferenceMaster() {
    const reg = this.loadRegistry();
    return reg.masters.referenceMasterId || null;
  }

  static getDashboardTemplate() {
    // Currently returns configured dashboard asset locations
    const reg = this.loadRegistry();
    return reg.dashboard.assets || [];
  }

  static getStorageRoot() {
    const reg = this.loadRegistry();
    return reg.storage.rootFolderId || null;
  }

  static getDistrictAssets(districtId) {
    const reg = this.loadRegistry();
    return reg.masters.districts[districtId] || null;
  }

  static getBranchAssets(branchId) {
    return this.getDistrictAssets(branchId);
  }
}

module.exports = AssetRegistryService;
