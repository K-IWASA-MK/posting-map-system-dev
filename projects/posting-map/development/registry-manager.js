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

  static getRegistryPath() {
    return path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'registry.json');
  }

  static rebuildRegistry() {
    const clientsDir = path.join(__dirname, '..', 'active', 'dashboard', 'clients');
    if (!fs.existsSync(clientsDir)) {
      fs.mkdirSync(clientsDir, { recursive: true });
    }

    const registry = {
      updatedAt: Date.now(),
      schemaVersion: 1,
      districts: []
    };

    const dirs = fs.readdirSync(clientsDir).filter(f => {
      return fs.statSync(path.join(clientsDir, f)).isDirectory();
    });

    dirs.forEach(d => {
      const manifestPath = path.join(clientsDir, d, 'deployment.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          registry.districts.push({
            id: m.district.id,
            name: m.district.name,
            status: m.provisioning ? m.provisioning.status : "UNKNOWN",
            deployment: {
              version: m.deployment ? m.deployment.version : 61,
              environment: "production"
            },
            runtime: {
              latency: 0,
              lastHeartbeat: "",
              lastCertification: m.certification && m.certification.lastVerified 
                ? new Date(m.certification.lastVerified).toISOString() 
                : new Date().toISOString()
            },
            resources: {
              spreadsheetId: m.resources.spreadsheetId,
              webAppUrl: m.resources.webAppUrl,
              scriptId: m.resources.scriptId
            }
          });
        } catch (e) {
          console.warn(`⚠️ Failed to parse manifest for district ${d}: ${e.message}`);
        }
      }
    });

    fs.writeFileSync(this.getRegistryPath(), JSON.stringify(registry, null, 2), 'utf8');
    console.log(`✓ Rebuilt registry index with ${registry.districts.length} districts.`);
    return registry;
  }

  static validateRegistry() {
    const registryPath = this.getRegistryPath();
    if (!fs.existsSync(registryPath)) {
      return { success: false, errors: ["registry.json does not exist."] };
    }

    const errors = [];
    const ids = new Set();
    
    try {
      const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      if (!reg.districts || !Array.isArray(reg.districts)) {
        errors.push("Invalid registry structure: districts must be an array.");
        return { success: false, errors };
      }

      reg.districts.forEach(d => {
        if (!d.id) errors.push(`District missing 'id' attribute.`);
        if (ids.has(d.id)) {
          errors.push(`Duplicate district ID detected: ${d.id}`);
        }
        ids.add(d.id);

        if (!d.resources || !d.resources.spreadsheetId || !d.resources.webAppUrl) {
          errors.push(`District ${d.id || 'unknown'} missing resource credentials.`);
        }

        const clientsDir = path.join(__dirname, '..', 'active', 'dashboard', 'clients');
        const dDir = path.join(clientsDir, d.id);
        if (!fs.existsSync(dDir)) {
          errors.push(`Directory for district ${d.id} is missing in clients/`);
        } else {
          if (!fs.existsSync(path.join(dDir, 'config.js'))) {
            errors.push(`config.js missing for district ${d.id}`);
          }
          if (!fs.existsSync(path.join(dDir, 'deployment.json'))) {
            errors.push(`deployment.json missing for district ${d.id}`);
          }
        }
      });
    } catch (e) {
      errors.push(`Registry parsing failed: ${e.message}`);
    }

    return {
      success: errors.length === 0,
      errors
    };
  }
}

module.exports = RegistryManager;
