/**
 * POSTING MAP - Step 1 Enhanced Audit Runner
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Sending Step 1 Audit request to GAS WebApp Engine...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&runStep1=true&districtName=三重第3区&prefecture=三重県`;
  
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse response: ${text}`);
  }

  if (json.success && json.data && json.data.audit) {
    const audit = json.data.audit;
    console.log(`\n========================================`);
    console.log(`📊 【Step 1 参照データ管理基盤 抽出監査レポート】`);
    console.log(`========================================`);
    console.log(`📌 POSTAL_CSV_FILE_ID  : ${audit.postalFileId || '未指定'}`);
    console.log(`📄 読み込みファイル名  : ${audit.postalFileName || '不明'}\n`);
    console.log(`📌 DISTRICT_CSV_FILE_ID: ${audit.districtFileId || '未指定'}`);
    console.log(`📄 読み込みファイル名  : ${audit.districtFileName || '不明'}\n`);
    console.log(`🎯 対象地区            : ${audit.targetDistrict} (${audit.targetPrefecture})`);
    console.log(`📈 総抽出件数          : ${audit.totalCount} 件\n`);

    console.log(`--- 🔹 [先頭 5 件] ---`);
    audit.top5.forEach((item, idx) => {
      console.log(`  [${idx + 1}] 〒${item.postalCode || ''} | ${item.city || ''} | ${item.address || ''} | カナ:${item.townKana || ''}`);
    });

    console.log(`\n--- 🔹 [末尾 5 件] ---`);
    const startIdx = audit.totalCount - audit.last5.length;
    audit.last5.forEach((item, idx) => {
      console.log(`  [${startIdx + idx + 1}] 〒${item.postalCode || ''} | ${item.city || ''} | ${item.address || ''} | カナ:${item.townKana || ''}`);
    });
    console.log(`========================================\n`);
  } else {
    console.error(`❌ Step 1 Audit failed:`, json.message);
  }
}

main().catch(err => {
  console.error("❌ Step 1 Audit error:", err.message);
  process.exit(1);
});
