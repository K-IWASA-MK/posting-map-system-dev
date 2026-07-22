/**
 * POSTING MAP - Clean Rebuild & Perfect Physical Tab Sequence
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwy8RZPeQKfwmM_zObRDFpjL-SKWyN_3tAWjK29oWQ6l_QB2rO7_9vqZBM4MBfHcyoa/exec";

async function main() {
  console.log(`🧹 [Step 1] Triggering Force Start Batch (Clean Delete All Stale Area Sheets)...`);
  const startUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&forceStartBatch=true`;
  const resStart = await fetch(startUrl, { method: 'GET', redirect: 'follow' });
  const rawStart = await resStart.json();
  console.log(`  - forceStartBatch:`, rawStart.success ? '✅ SUCCESS' : '❌ FAILED');

  console.log(`\n🔄 [Step 2] Executing Batch Steps to Rebuild All Area Sheets from scratch...`);
  for (let i = 1; i <= 30; i++) {
    const stepUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&runBatchStep=true`;
    const resStep = await fetch(stepUrl, { method: 'GET', redirect: 'follow' });
    const rawStep = await resStep.json();
    const data = rawStep.data || rawStep;
    console.log(`  [Batch Loop #${i}] ${data.message || JSON.stringify(data)}`);
    if (data.isCompleted || data.status === 'completed' || data.status === null) break;
  }

  console.log(`\n✨ [Step 3] Triggering Physical Tab Sort on Spreadsheet...`);
  const sortUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&sortTabs=true`;
  const resSort = await fetch(sortUrl, { method: 'GET', redirect: 'follow' });
  const rawSort = await resSort.json();
  console.log(`  - sortTabs:`, rawSort.message || rawSort);

  console.log(`\n📑 [Step 4] Auditing Final Spreadsheet Tab Order & Sequence...`);
  const auditUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&auditAllAreas=true`;
  const resAudit = await fetch(auditUrl, { method: 'GET', redirect: 'follow' });
  const rawAudit = await resAudit.json();
  const auditData = rawAudit.data || rawAudit;

  console.log(`\n========================================`);
  console.log(`🏆 【最終クリーン再構築 タブ並び順 レポート】`);
  console.log(`========================================`);
  console.log(`生成エリアシート総数: ${auditData.totalAreaSheets} シート\n`);

  if (auditData.sheets) {
    auditData.sheets.forEach((s, idx) => {
      console.log(`  [Tab #${(idx + 1).toString().padStart(2, ' ')}] シート名: "${s.name.padEnd(16, ' ')}" | 行数: ${s.rowsCount.toString().padStart(2, ' ')} 行 | 昇順: ${s.isNumericAscending ? '✅' : '❌'}`);
    });
  }
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Rebuild Error:", err.message);
  process.exit(1);
});
