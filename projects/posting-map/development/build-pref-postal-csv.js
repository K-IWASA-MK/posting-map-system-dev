/**
 * POSTING MAP - Postal CSV Builder (AI社員①)
 * 責務: KEN_ALL.CSV を取得 ➔ 指定県抽出 ➔ 郵便番号数値昇順ソート ➔ MIE_POSTAL.CSV 生成 & Drive アップロード
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`🚀 [Postal CSV Builder] Starting KEN_ALL.CSV normalization for Mie Prefecture...`);
  
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&buildPrefPostalCsv=true&targetPref=三重県`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  const json = rawJson.data || rawJson;

  console.log(`\n========================================`);
  console.log(`📦 【Postal CSV Builder 実行結果】`);
  console.log(`========================================`);
  console.log(`ステータス      : ${json.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`生成ファイル名  : ${json.fileName || 'MIE_POSTAL.CSV'}`);
  console.log(`新しい File ID : ${json.fileId}`);
  console.log(`対象県          : 三重県`);
  console.log(`抽出レコード数  : ${json.totalRows} 行`);
  console.log(`数値昇順保証    : ${json.isNumericAscending ? '✅ 100% 数値昇順保証' : '❌ 非昇順あり'}`);
  console.log(`========================================\n`);

  if (json.fileId) {
    console.log(`💡 新しい MIE_POSTAL.CSV File ID: "${json.fileId}"`);
  }
}

main().catch(err => {
  console.error("❌ Postal CSV Builder Error:", err.message);
  process.exit(1);
});
