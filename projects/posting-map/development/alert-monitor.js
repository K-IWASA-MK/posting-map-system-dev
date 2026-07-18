/**
 * POSTING MAP
 * Phase 35: HQ Operational Alert Monitor Daemon
 */

const fs = require('fs');
const path = require('path');
const RegistryManager = require('./registry-manager');

const RECOMMENDED_VERSION = 61; // Latest SaaS certified release version
const HEARTBEAT_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 Hours limit

function monitor() {
  console.log("==================================================");
  console.log("🚨 Running HQ Operational Alert Scan...");
  console.log("==================================================\n");

  const registryPath = RegistryManager.getRegistryPath();
  if (!fs.existsSync(registryPath)) {
    console.error("❌ Registry index file not found.");
    return;
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const alerts = [];

  registry.districts.forEach(d => {
    // 1. STATE_BLOCKED Check
    if (d.status === "BLOCKED") {
      alerts.push({
        type: "STATE_BLOCKED",
        districtId: d.id,
        severity: "CRITICAL",
        message: `District ${d.id} is blocked. Google Apps Script gateway block detected.`,
        timestamp: Date.now()
      });
    }

    // 2. VERSION_MISMATCH Check
    if (d.deployment && d.deployment.version && d.deployment.version < RECOMMENDED_VERSION) {
      alerts.push({
        type: "VERSION_MISMATCH",
        districtId: d.id,
        severity: "WARNING",
        message: `Version mismatch for ${d.id}. Running v${d.deployment.version}, recommended is v${RECOMMENDED_VERSION}.`,
        timestamp: Date.now()
      });
    }

    // 3. HEARTBEAT_LOST Check
    if (d.runtime && d.runtime.lastHeartbeat) {
      const lastHb = new Date(d.runtime.lastHeartbeat).getTime();
      if (Date.now() - lastHb > HEARTBEAT_TIMEOUT_MS) {
        alerts.push({
          type: "HEARTBEAT_LOST",
          districtId: d.id,
          severity: "CRITICAL",
          message: `Heartbeat lost for ${d.id}. Last communication was ${new Date(lastHb).toLocaleString()}.`,
          timestamp: Date.now()
        });
      }
    } else if (d.status === "READY") {
      // Ready state but has never communicated yet
      alerts.push({
        type: "HEARTBEAT_LOST",
        districtId: d.id,
        severity: "WARNING",
        message: `Heartbeat never registered yet for ${d.id}.`,
        timestamp: Date.now()
      });
    }
  });

  const alertsPath = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'alerts.json');
  fs.writeFileSync(alertsPath, JSON.stringify({ updatedAt: Date.now(), alerts }, null, 2), 'utf8');
  console.log(`✓ Scanned completed. Generated ${alerts.length} operational alerts in active/dashboard/clients/alerts.json`);

  // Print console warnings
  if (alerts.length > 0) {
    console.log("\n==================================================");
    console.log("⚠️ ACTIVE HEADQUARTERS ALERTS LIST");
    console.log("==================================================");
    alerts.forEach(a => {
      const prefix = a.severity === "CRITICAL" ? "🔴 [CRITICAL]" : "🟡 [WARNING]";
      console.log(`${prefix} ${a.type} - ${a.districtId}: ${a.message}`);
    });
    console.log("==================================================");
  } else {
    console.log("\n✓ Health check clean: No active operational alerts detected.");
  }

  return alerts;
}

if (require.main === module) {
  monitor();
}

module.exports = { monitor };
