/**
 * POSTING MAP - Trigger Physical Tab Sorting
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`🚀 Triggering Physical Tab Sorting on Spreadsheet...`);
  const sortUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&sortTabs=true`;
  const res = await fetch(sortUrl, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  console.log(`  - Sort Tabs Result:`, rawJson.message || rawJson);

  console.log(`\n📡 Fetching New Tab Sequence from Spreadsheet...`);
  const auditUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&auditAllAreas=true`;
  const resAudit = await fetch(auditUrl, { method: 'GET', redirect: 'follow' });
  const rawAudit = await resAudit.json();
  const auditData = rawAudit.data || rawAudit;

  console.log(`\n========================================`);
  console.log(`📑 【整列後 スプレッドシート タブ物理並び順 レポート】`);
  console.log(`========================================`);
  console.log(`総エリアシート数: ${auditData.totalAreaSheets} シート\n`);

  if (auditData.sheets) {
    auditData.sheets.forEach((s, idx) => {
      console.log(`  [Tab #${(idx + 1).toString().padStart(2, ' ')}] シート名: "${s.name.padEnd(16, ' ')}" | 行数: ${s.rowsCount.toString().padStart(2, ' ')} 行 | 昇順: ${s.isNumericAscending ? '✅' : '❌'}`);
    });
  }
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Sort Tabs Error:", err.message);
  process.exit(1);
});
