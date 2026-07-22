/**
 * POSTING MAP - All Areas Postal Code Order Verification Runner
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 [Phase 1] Executing Synchronous Batch Generation using Normalized MIE_POSTAL.CSV...`);
  const batchUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&executeFullBatch=true`;
  const resBatch = await fetch(batchUrl, { method: 'GET', redirect: 'follow' });
  const rawBatch = await resBatch.json();
  const batchData = rawBatch.data || rawBatch;

  console.log(`  - バッチ実行結果: ${batchData.success ? '✅ SUCCESS' : '❌ FAILED'}`);

  console.log(`\n📡 [Phase 2] Auditing Postal Code Numeric Order across ALL Generated Area Sheets...`);
  const auditUrl = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&auditAllAreas=true`;
  const resAudit = await fetch(auditUrl, { method: 'GET', redirect: 'follow' });
  const rawAudit = await resAudit.json();
  const auditData = rawAudit.data || rawAudit;

  console.log(`\n========================================`);
  console.log(`🏆 【全エリア対象 郵便番号数値昇順 監査最終レポート】`);
  console.log(`========================================`);
  console.log(`生成エリアシート総数  : ${auditData.totalAreaSheets || 0} シート`);
  console.log(`全シート数値昇順判定  : ${auditData.totalAllSheetsNumericAscending ? '🎉 100% 全エリア完全昇順 (Ascending Verified)' : '❌ 非昇順あり'}`);
  console.log(`\n--- シート別詳細結果 ---`);

  if (auditData.sheets) {
    auditData.sheets.forEach(s => {
      const status = s.isNumericAscending ? '✅ 昇順' : `❌ 非昇順 (${s.nonAscendingCount}箇所)`;
      console.log(`  - シート名: "${s.name.padEnd(16, ' ')}" | 行数: ${s.rowsCount.toString().padStart(2, ' ')} 行 | ステータス: ${status}`);
    });
  }

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ All Areas Audit Error:", err.message);
  process.exit(1);
});
