/**
 * POSTING MAP
 * Phase 32: Registry & Manifest Manager
 */

const fs = require('fs');
const path = require('path');

class RegistryManager {
  static getManifestPath() {
    return path.join(__dirname, '..', 'deployment.json');
  }

  static load() {
    const p = this.getManifestPath();
    if (!fs.existsSync(p)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }

  static save(manifest) {
    const p = this.getManifestPath();
    fs.writeFileSync(p, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`✓ Manifest saved to deployment.json`);
  }

  static initialize(districtId, districtName, createdBy) {
    const manifest = {
      district: {
        id: districtId,
        name: districtName
      },
      resources: {
        spreadsheetId: "",
        storageFolderId: "",
        scriptId: "",
        webAppUrl: ""
      },
      provisioning: {
        templateVersion: "v1",
        createdAt: Date.now(),
        createdBy: createdBy || "operator",
        status: "PENDING",
        transactionId: `prov-${Date.now()}-${districtId}`
      },
      certification: {
        phase31: "PENDING"
      }
    };
    this.save(manifest);
    console.log(`✓ Initialized deployment config for transaction: ${manifest.provisioning.transactionId}`);
    return manifest;
  }
}

module.exports = RegistryManager;
