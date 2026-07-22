/**
 * POSTING MAP - Trigger & Complete Batch Loop
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`🚀 Triggering forceStartBatch & Area Sheet Rebuild...`);
  const startUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&forceStartBatch=true`;
  const resStart = await fetch(startUrl, { method: 'GET', redirect: 'follow' });
  const rawStart = await resStart.json();
  console.log(`  - forceStartBatch Status:`, rawStart.success ? '✅ SUCCESS' : '❌ FAILED');

  console.log(`\n🔄 Running Sequential Batch Step Iterations until completed...`);
  for (let i = 1; i <= 8; i++) {
    const stepUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&runBatchStep=true`;
    const resStep = await fetch(stepUrl, { method: 'GET', redirect: 'follow' });
    const rawStep = await resStep.json();
    const data = rawStep.data || rawStep;
    console.log(`  [Batch Step #${i}]`, data.message || rawStep);
    if (data.status === 'completed' || data.isCompleted) break;
  }

  console.log(`\n📡 Final Audit across ALL Generated Area Sheets...`);
  const auditUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&auditAllAreas=true`;
  const resAudit = await fetch(auditUrl, { method: 'GET', redirect: 'follow' });
  const rawAudit = await resAudit.json();
  const auditData = rawAudit.data || rawAudit;

  console.log(`\n========================================`);
  console.log(`🏆 【全エリア対象 郵便番号数値昇順 監査最終レポート】`);
  console.log(`========================================`);
  console.log(`生成エリアシート総数  : ${auditData.totalAreaSheets || 0} シート`);
  console.log(`全シート数値昇順判定  : ${auditData.totalAllSheetsNumericAscending ? '🎉 100% 全エリア完全昇順 (Ascending Verified)' : '❌ 非昇順あり'}`);
  console.log(`\n--- エリアシート別 詳細監査 ---`);

  if (auditData.sheets) {
    auditData.sheets.forEach(s => {
      const status = s.isNumericAscending ? '✅ 昇順' : `❌ 非昇順 (${s.nonAscendingCount}箇所)`;
      console.log(`  - シート名: "${s.name.padEnd(16, ' ')}" | 行数: ${s.rowsCount.toString().padStart(2, ' ')} 行 | ステータス: ${status}`);
    });
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Batch Trigger Error:", err.message);
  process.exit(1);
});
