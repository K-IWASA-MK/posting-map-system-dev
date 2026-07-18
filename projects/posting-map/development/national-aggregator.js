/**
 * POSTING MAP
 * Phase 35: National Analytics Data Aggregator
 */

const fs = require('fs');
const path = require('path');
const RegistryManager = require('./registry-manager');

async function fetchDistrictData(district) {
  const url = district.resources.webAppUrl;
  if (!url) {
    return null;
  }

  const queryUrl = `${url}?action=getAppData&_t=${Date.now()}`;
  try {
    const res = await fetch(queryUrl, { method: 'GET', redirect: 'follow' });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      id: district.id,
      name: district.name,
      data: json
    };
  } catch (e) {
    return null;
  }
}

async function aggregate() {
  console.log("==================================================");
  console.log("📊 Compiling National Metrics & Region Aggregation");
  console.log("==================================================\n");

  const registryPath = RegistryManager.getRegistryPath();
  if (!fs.existsSync(registryPath)) {
    console.error("❌ Registry index file not found.");
    return;
  }

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const activeDistricts = registry.districts.filter(d => d.status === "READY");

  console.log(`Scanning data for ${activeDistricts.length} active districts...`);
  const rawResults = await Promise.all(activeDistricts.map(d => fetchDistrictData(d)));
  const results = rawResults.filter(r => r !== null);

  // Global Aggregation Variables
  let totalAreas = 0;
  let completedAreas = 0;
  let totalProgressSum = 0;
  const regionGroups = {}; // Grouped by region code (first 3 chars, e.g. MIE)

  const districtSummaries = results.map(r => {
    const areas = r.data.areas || [];
    const count = areas.length;
    const completed = areas.filter(a => a.progress >= 100).length;
    const progressAvg = count > 0 ? (areas.reduce((sum, a) => sum + (a.progress || 0), 0) / count) : 0;

    totalAreas += count;
    completedAreas += completed;
    totalProgressSum += progressAvg;

    // Region grouping (e.g. MIE, TOK, etc.)
    const regionCode = r.id.substring(0, 3).toUpperCase();
    if (!regionGroups[regionCode]) {
      regionGroups[regionCode] = {
        region: regionCode === "MIE" ? "三重県" : regionCode === "TOK" ? "東京都" : regionCode,
        districtsCount: 0,
        totalAreas: 0,
        completedAreas: 0,
        progressSum: 0
      };
    }
    const rg = regionGroups[regionCode];
    rg.districtsCount++;
    rg.totalAreas += count;
    rg.completedAreas += completed;
    rg.progressSum += progressAvg;

    return {
      id: r.id,
      name: r.name,
      totalAreas: count,
      completedAreas: completed,
      progress: Math.round(progressAvg)
    };
  });

  // Calculate Region averages
  const regions = Object.keys(regionGroups).map(code => {
    const rg = regionGroups[code];
    return {
      code,
      name: rg.region,
      districtsCount: rg.districtsCount,
      totalAreas: rg.totalAreas,
      completedAreas: rg.completedAreas,
      progress: rg.districtsCount > 0 ? Math.round(rg.progressSum / rg.districtsCount) : 0
    };
  });

  const nationalKPI = {
    updatedAt: Date.now(),
    summary: {
      totalDistricts: activeDistricts.length,
      activeDistricts: results.length,
      totalAreas,
      completedAreas,
      progress: results.length > 0 ? Math.round(totalProgressSum / results.length) : 0
    },
    regions,
    districts: districtSummaries
  };

  const summaryPath = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'national-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(nationalKPI, null, 2), 'utf8');
  console.log(`✓ National summary generated successfully under active/dashboard/clients/national-summary.json`);

  // Trigger report generator dynamically
  const { execSync } = require('child_process');
  try {
    console.log("Triggering automated report generation...");
    execSync('node development/report-generator.js --type daily', { stdio: 'inherit' });
  } catch (e) {
    console.error("⚠️ Failed to trigger report-generator.js:", e.message);
  }

  // Print Markdown Console Report
  console.log("\n==================================================");
  console.log("📋 NATIONAL KPI SUMMARY REPORT");
  console.log("==================================================");
  console.log(`* Active Districts: ${nationalKPI.summary.activeDistricts} / ${nationalKPI.summary.totalDistricts}`);
  console.log(`* National Average Progress: ${nationalKPI.summary.progress}%`);
  console.log(`* Target Areas Count: ${nationalKPI.summary.totalAreas} (Completed: ${nationalKPI.summary.completedAreas})`);
  console.log("--------------------------------------------------");
  console.log("| Region | Districts | Total Areas | Completed | Progress |");
  console.log("| :--- | :--- | :--- | :--- | :--- |");
  regions.forEach(rg => {
    console.log(`| ${rg.name} | ${rg.districtsCount} | ${rg.totalAreas} | ${rg.completedAreas} | ${rg.progress}% |`);
  });
  console.log("==================================================");
  
  return nationalKPI;
}

if (require.main === module) {
  aggregate();
}

module.exports = { aggregate };
