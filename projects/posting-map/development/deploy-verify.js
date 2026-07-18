/**
 * POSTING MAP
 * Phase 31: District Deployment Certification Tool
 */

const fs = require('fs');
const path = require('path');

// 1. Load Deployment Manifest
const manifestPath = path.join(__dirname, '..', 'deployment.json');
if (!fs.existsSync(manifestPath)) {
  console.error("❌ Error: deployment.json manifest not found in project root.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const resources = manifest.resources || {};
const webAppUrl = resources.webAppUrl;
const district = manifest.district ? manifest.district.id : "Unknown";
const apiKey = resources.apiKey || 'valid-api-key';

console.log(`==================================================`);
console.log(`🤖 Starting Deployment Certification for District: ${district}`);
console.log(`Target URL: ${webAppUrl}`);
console.log(`==================================================\n`);

async function runVerification() {
  const report = [];
  let ready = true;

  // Step A: Web App GET Diagnostics
  console.log(`[1/3] Running GET Diagnostics...`);
  try {
    const getUrl = `${webAppUrl}?action=verifyDeployment&apiKey=${apiKey}&_t=${Date.now()}`;
    const res = await fetch(getUrl, { method: 'GET', redirect: 'follow' });
    
    if (res.status !== 200) {
      report.push({ rule: "Web App Reachability (GET)", status: "FAILED", message: `HTTP Status ${res.status}` });
      ready = false;
    } else {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.success && json.data) {
          report.push({ rule: "Web App Reachability (GET)", status: "PASS", message: "Web App responded with valid JSON." });
          
          // GASのルールエンジン結果をマージ
          const gasResults = json.data.results || [];
          gasResults.forEach(r => {
            report.push({ rule: `GAS: ${r.name}`, status: r.status, message: r.message });
            if (r.status === "FAILED") ready = false;
          });
        } else {
          report.push({ rule: "Web App Reachability (GET)", status: "FAILED", message: json.error ? json.error.message : "Malformed response JSON." });
          ready = false;
        }
      } catch (e) {
        report.push({ rule: "Web App Reachability (GET)", status: "FAILED", message: "Failed to parse JSON. Possible OAuth lock or Drive error page returned." });
        ready = false;
      }
    }
  } catch (err) {
    report.push({ rule: "Web App Reachability (GET)", status: "FAILED", message: err.toString() });
    ready = false;
  }

  // Step B: Web App POST Diagnostics
  console.log(`[2/3] Running POST Diagnostics (JSON Payload)...`);
  try {
    const postUrl = `${webAppUrl}?apiKey=${apiKey}&_t=${Date.now()}`;
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: "verifyDeployment" }),
      redirect: 'follow'
    });

    if (res.status !== 200) {
      report.push({ rule: "Web App Reachability (POST)", status: "FAILED", message: `HTTP Status ${res.status}` });
      ready = false;
    } else {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.success) {
          report.push({ rule: "Web App Reachability (POST)", status: "PASS", message: "Web App POST responded with valid JSON." });
        } else {
          report.push({ rule: "Web App Reachability (POST)", status: "FAILED", message: json.error ? json.error.message : "Malformed POST response." });
          ready = false;
        }
      } catch (e) {
        report.push({ rule: "Web App Reachability (POST)", status: "FAILED", message: "POST response was not valid JSON (OAuth / Gateway Lock)." });
        ready = false;
      }
    }
  } catch (err) {
    report.push({ rule: "Web App Reachability (POST)", status: "FAILED", message: err.toString() });
    ready = false;
  }

  // Step C: Simulated H-App Write (submitDistribution)
  console.log(`[3/3] Simulating Distribution POST (Readiness Gate)...`);
  try {
    const postUrl = `${webAppUrl}?apiKey=${apiKey}&_t=${Date.now()}`;
    const res = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "submitDistribution",
        areaName: "四日市市",
        rowId: 2,
        staffName: "Bootstrap Certified",
        count: 1,
        isDone: true,
        staffId: "S999",
        userId: "S999",
        legacySheetName: "四日市市"
      }),
      redirect: 'follow'
    });

    if (res.status !== 200) {
      report.push({ rule: "Simulated H-App POST", status: "FAILED", message: `HTTP Status ${res.status}` });
      ready = false;
    } else {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        if (json.success && json.data && json.data.success) {
          report.push({ rule: "Simulated H-App POST", status: "PASS", message: `Distribution submit succeeded. EventLog ID: ${json.data.id}` });
        } else {
          report.push({
            rule: "Simulated H-App POST",
            status: "FAILED",
            message: json.error ? json.error.message : (json.data ? json.data.message : "Unknown write error.")
          });
          ready = false;
        }
      } catch (e) {
        report.push({ rule: "Simulated H-App POST", status: "FAILED", message: "Response is not a valid JSON. Drive access blocked." });
        ready = false;
      }
    }
  } catch (err) {
    report.push({ rule: "Simulated H-App POST", status: "FAILED", message: err.toString() });
    ready = false;
  }

  // Display Final Report
  console.log(`\n==================================================`);
  console.log(`📋 DEPLOYMENT CERTIFICATION REPORT`);
  console.log(`==================================================`);
  console.log(`| Rule Name | Status | Details |`);
  console.log(`| :--- | :--- | :--- |`);
  report.forEach(r => {
    const emoji = r.status === "PASS" ? "✅" : (r.status === "WARNING" ? "⚠️" : "❌");
    console.log(`| ${r.rule} | ${emoji} ${r.status} | ${r.message} |`);
  });
  console.log(`==================================================`);

  if (ready) {
    console.log(`\n🎉 FINAL CERTIFICATION: [ READY ]`);
    console.log(`District ${district} is certified and ready for public launch!`);
    console.log(`==================================================\n`);
    process.exit(0);
  } else {
    console.error(`\n🚨 FINAL CERTIFICATION: [ NOT READY ]`);
    console.error(`Deployment contains failures. Public launch is strictly BLOCKED.`);
    console.error(`==================================================\n`);
    process.exit(1);
  }
}

runVerification();
