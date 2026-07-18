/**
 * POSTING MAP
 * Phase 34: Headquarters Bulk Operations & Health Monitor CLI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const RegistryManager = require('./registry-manager');

const args = process.argv.slice(2);
const actionIndex = args.indexOf('--action');
if (actionIndex === -1 || !args[actionIndex + 1]) {
  console.error("❌ Error: Please specify action using --action <health | deploy>");
  process.exit(1);
}
const action = args[actionIndex + 1];

async function runHealthCheck(district) {
  const url = district.resources.webAppUrl;
  if (!url) {
    return { id: district.id, status: "BLOCKED", latency: 0, error: "No Web App URL registered." };
  }

  const checkUrl = `${url}?action=verifyDeployment&apiKey=valid-api-key&_t=${Date.now()}`;
  const start = Date.now();
  
  try {
    const res = await fetch(checkUrl, { method: 'GET', redirect: 'follow', timeout: 5000 });
    const latency = Date.now() - start;
    
    if (!res.ok) {
      return { id: district.id, status: "BLOCKED", latency, error: `HTTP Status ${res.status}` };
    }
    
    const json = await res.json();
    if (json.success && json.data && json.data.status === "READY") {
      return {
        id: district.id,
        status: "READY",
        latency,
        version: json.metadata ? json.metadata.version : "unknown"
      };
    } else {
      return { id: district.id, status: "WARNING", latency, error: "Diagnostics returned warnings." };
    }
  } catch (e) {
    const latency = Date.now() - start;
    return { id: district.id, status: "BLOCKED", latency, error: e.toString() };
  }
}

async function executeBulkHealth() {
  console.log("==================================================");
  console.log("🔍 Triggering Bulk Health Checks across Districts");
  console.log("==================================================\n");

  const registry = RegistryManager.rebuildRegistry();
  const queue = registry.districts;
  
  console.log(`Executing health check queue for ${queue.length} districts...`);
  
  const results = await Promise.all(queue.map(d => runHealthCheck(d)));
  
  console.log("\n==================================================");
  console.log("📋 HQ HEALTH MONITOR STATUS REPORT");
  console.log("==================================================");
  console.log("| District | Status | Latency | Version | Details |");
  console.log("| :--- | :--- | :--- | :--- | :--- |");
  
  // Update the registry JSON file with runtime stats
  const activeRegistry = JSON.parse(fs.readFileSync(RegistryManager.getRegistryPath(), 'utf8'));
  
  results.forEach(r => {
    const statusIcon = r.status === "READY" ? "✅ READY" : r.status === "WARNING" ? "⚠️ WARN" : "❌ BLOCK";
    console.log(`| ${r.id} | ${statusIcon} | ${r.latency}ms | ${r.version || 'N/A'} | ${r.error || 'Normal'} |`);
    
    // Bind results to registry file
    const target = activeRegistry.districts.find(d => d.id === r.id);
    if (target) {
      target.status = r.status;
      target.runtime.latency = r.latency;
      target.runtime.lastHeartbeat = new Date().toISOString();
      if (r.version) {
        target.deployment.version = r.version;
      }
    }
  });
  
  activeRegistry.updatedAt = Date.now();
  fs.writeFileSync(RegistryManager.getRegistryPath(), JSON.stringify(activeRegistry, null, 2), 'utf8');
  console.log("==================================================");
}

async function executeBulkDeploy() {
  console.log("==================================================");
  console.log("📦 Triggering Bulk clasp Deployments Queue");
  console.log("==================================================\n");

  const registry = RegistryManager.rebuildRegistry();
  const queue = registry.districts.filter(d => d.status === "READY");
  
  console.log(`Queued ${queue.length} certified districts for updates...`);
  
  const claspJsonPath = path.join(__dirname, '..', '.clasp.json');
  const originalConfig = JSON.parse(fs.readFileSync(claspJsonPath, 'utf8'));
  
  for (let i = 0; i < queue.length; i++) {
    const dist = queue[i];
    const scriptId = dist.resources.scriptId;
    if (!scriptId) {
      console.warn(`[${i+1}/${queue.length}] ⚠️ Skipping ${dist.id}: No scriptId mapped.`);
      continue;
    }
    
    console.log(`\n[${i+1}/${queue.length}] Deploying to client ${dist.id} (Script: ${scriptId})...`);
    
    try {
      // 1. Temporarily rewrite clasp mapping target scriptId
      const tempConfig = { ...originalConfig, scriptId };
      fs.writeFileSync(claspJsonPath, JSON.stringify(tempConfig, null, 2), 'utf8');
      
      // 2. Perform clasp push & clasp deploy to apply upgrades
      execSync(`clasp push`, { stdio: 'inherit' });
      execSync(`clasp deploy -i ${dist.resources.webAppUrl.split('/s/')[1].split('/exec')[0]}`, { stdio: 'inherit' });
      
      console.log(`✓ Successful upgrade deployment for ${dist.id}`);
    } catch (err) {
      console.error(`❌ Deployment failed for ${dist.id}: ${err.message}`);
    }
  }
  
  // 3. Restore original config
  fs.writeFileSync(claspJsonPath, JSON.stringify(originalConfig, null, 2), 'utf8');
  console.log("\n✓ Bulk clasp deployments completed. Original config restored.");
}

async function main() {
  if (action === "health") {
    await executeBulkHealth();
  } else if (action === "deploy") {
    await executeBulkDeploy();
  } else {
    console.error(`❌ Error: Unknown action "${action}"`);
  }
}

main();
