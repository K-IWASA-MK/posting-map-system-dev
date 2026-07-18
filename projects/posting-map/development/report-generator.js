/**
 * POSTING MAP
 * Phase 36: Automated Report Generator Engine
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const typeIndex = args.indexOf('--type');
const reportType = (typeIndex !== -1 && args[typeIndex + 1]) ? args[typeIndex + 1] : 'daily';

if (!['daily', 'weekly', 'monthly'].includes(reportType)) {
  console.error(`❌ Error: Invalid report type "${reportType}". Choose from: daily, weekly, monthly`);
  process.exit(1);
}

const summaryPath = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'national-summary.json');
const reportsDir = path.join(__dirname, '..', 'active', 'dashboard', 'clients', 'reports');
const historyPath = path.join(reportsDir, 'history.json');

// Ensure reports directory exists
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

function loadSummaryData() {
  if (!fs.existsSync(summaryPath)) {
    console.warn("⚠️ Summary data not found, generating empty report layout.");
    return {
      updatedAt: Date.now(),
      summary: { totalDistricts: 0, activeDistricts: 0, totalAreas: 0, completedAreas: 0, progress: 0 },
      regions: [],
      districts: []
    };
  }
  return JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
}

function generateMarkdown(data, dateStr) {
  const s = data.summary;
  let md = `# POSTING MAP ${reportType.toUpperCase()} PERFORMANCE REPORT\n`;
  md += `* **Generated At**: ${dateStr}\n`;
  md += `* **Active Districts**: ${s.activeDistricts} / ${s.totalDistricts}\n`;
  md += `* **National Avg Progress**: ${s.progress}%\n`;
  md += `* **Target Areas**: ${s.totalAreas} (Completed: ${s.completedAreas})\n\n`;

  md += `## Regional Metrics Summary\n`;
  md += `| Region | Districts | Total Areas | Completed | Progress |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  data.regions.forEach(r => {
    md += `| ${r.name} | ${r.districtsCount} | ${r.totalAreas} | ${r.completedAreas} | ${r.progress}% |\n`;
  });

  md += `\n## District Details List\n`;
  md += `| District | Name | Total Areas | Completed | Progress |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  data.districts.forEach(d => {
    md += `| ${d.id} | ${d.name} | ${d.totalAreas} | ${d.completedAreas} | ${d.progress}% |\n`;
  });

  return md;
}

function generateCSV(data) {
  let csv = `DistrictId,DistrictName,TotalAreas,CompletedAreas,ProgressAvg\n`;
  data.districts.forEach(d => {
    csv += `"${d.id}","${d.name}",${d.totalAreas},${d.completedAreas},${d.progress}\n`;
  });
  return csv;
}

function generateHTML(data, dateStr) {
  const s = data.summary;
  let regionCards = '';
  data.regions.forEach(r => {
    regionCards += `
      <div style="border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.01); padding: 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; font-size: 14px; color: rgba(255,255,255,0.9);">${r.name}</div>
          <div style="font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 700; margin-top: 4px;">${r.districtsCount} Districts / ${r.totalAreas} Areas</div>
        </div>
        <div style="font-family: monospace; font-weight: 900; color: #22c55e; font-size: 20px;">${r.progress}%</div>
      </div>
    `;
  });

  let tableRows = '';
  data.districts.forEach(d => {
    tableRows += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 16px 8px; font-weight: 700; color: #ffffff;">${d.id}</td>
        <td style="padding: 16px 8px; color: rgba(255,255,255,0.7);">${d.name}</td>
        <td style="padding: 16px 8px; color: rgba(255,255,255,0.6);">${d.totalAreas}</td>
        <td style="padding: 16px 8px; color: rgba(255,255,255,0.6);">${d.completedAreas}</td>
        <td style="padding: 16px 8px; font-family: monospace; font-weight: 700; color: #3b82f6;">${d.progress}%</td>
      </tr>
    `;
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>POSTING MAP - ${reportType.toUpperCase()} REPORT</title>
</head>
<body style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; margin: 0;">
  <div style="max-w: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px;">
    
    <!-- Header -->
    <header style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
      <h1 style="font-weight: 900; font-size: 28px; margin: 0; text-transform: uppercase; tracking-tight: -0.05em;">
        POSTING MAP <span style="color: #3b82f6;">${reportType.toUpperCase()} REPORT</span>
      </h1>
      <p style="font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 900; text-transform: uppercase; margin: 8px 0 0 0;">
        Generated: ${dateStr}
      </p>
    </header>

    <!-- Metrics Row -->
    <section style="display: grid; grid-template-cols: repeat(4, 1fr); gap: 16px; grid-auto-flow: column;">
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
        <span style="font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase;">Districts</span>
        <span style="font-size: 28px; font-weight: 900; margin-top: 12px;">${s.activeDistricts} / ${s.totalDistricts}</span>
      </div>
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
        <span style="font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase;">Average Progress</span>
        <span style="font-size: 28px; font-weight: 900; margin-top: 12px; color: #22c55e;">${s.progress}%</span>
      </div>
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
        <span style="font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase;">Total Areas</span>
        <span style="font-size: 28px; font-weight: 900; margin-top: 12px; color: #3b82f6;">${s.totalAreas}</span>
      </div>
      <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; min-height: 100px; display: flex; flex-direction: column; justify-content: space-between;">
        <span style="font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase;">Completed Areas</span>
        <span style="font-size: 28px; font-weight: 900; margin-top: 12px; color: rgba(255,255,255,0.7);">${s.completedAreas}</span>
      </div>
    </section>

    <!-- Regions -->
    <section style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 24px; display: flex; flex-direction: column; gap: 16px;">
      <h3 style="font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; margin: 0;">Region Analytics</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        ${regionCards}
      </div>
    </section>

    <!-- Table -->
    <main style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 24px;">
      <h3 style="font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; margin: 0 0 16px 0;">District Leaderboard</h3>
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); font-size: 10px; font-weight: 900; text-transform: uppercase;">
            <th style="padding: 12px 8px;">District</th>
            <th style="padding: 12px 8px;">Name</th>
            <th style="padding: 12px 8px;">Total Areas</th>
            <th style="padding: 12px 8px;">Completed</th>
            <th style="padding: 12px 8px;">Progress</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </main>

  </div>
</body>
</html>`;
}

function updateHistory(timestamp, filePaths) {
  let data = { schemaVersion: 1, history: [] };
  if (fs.existsSync(historyPath)) {
    try {
      data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {
      console.warn("⚠️ History json parsing failed, rewriting from blank schema.");
    }
  }

  // Prepend to history stack
  data.history.unshift({
    type: reportType,
    timestamp,
    files: filePaths
  });

  // Cap length to 100
  if (data.history.length > 100) {
    data.history = data.history.slice(0, 100);
  }

  fs.writeFileSync(historyPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ Audit history updated in clients/reports/history.json`);
}

function main() {
  console.log("==================================================");
  console.log(`📝 Starting Automated Report Generation Engine: [${reportType.toUpperCase()}]`);
  console.log("==================================================\n");

  const data = loadSummaryData();
  const timestamp = Date.now();
  const dateStr = new Date(timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const fileTimestamp = `${reportType}-report-${timestamp}`;

  const mdContent = generateMarkdown(data, dateStr);
  const csvContent = generateCSV(data);
  const htmlContent = generateHTML(data, dateStr);

  const mdName = `${fileTimestamp}.md`;
  const csvName = `${fileTimestamp}.csv`;
  const htmlName = `${fileTimestamp}.html`;

  fs.writeFileSync(path.join(reportsDir, mdName), mdContent, 'utf8');
  fs.writeFileSync(path.join(reportsDir, csvName), csvContent, 'utf8');
  fs.writeFileSync(path.join(reportsDir, htmlName), htmlContent, 'utf8');

  console.log(`✓ Generated ${reportType} report files:`);
  console.log(`  - Markdown : ${mdName}`);
  console.log(`  - CSV      : ${csvName}`);
  console.log(`  - HTML     : ${htmlName}`);

  // Register files in log history
  updateHistory(timestamp, {
    markdown: `clients/reports/${mdName}`,
    csv: `clients/reports/${csvName}`,
    html: `clients/reports/${htmlName}`
  });

  // Trigger notification engine dynamically
  const { execSync } = require('child_process');
  try {
    console.log("Triggering report delivery to Chatwork...");
    execSync(`node development/notification-engine.js --type report --filePath clients/reports/${mdName}`, { stdio: 'inherit' });
  } catch (e) {
    console.error("⚠️ Failed to trigger notification dispatch:", e.message);
  }

  console.log("\n==================================================");
  console.log(`🎉 REPORT COMPILATION SUCCEEDED`);
  console.log("==================================================");
}

main();
