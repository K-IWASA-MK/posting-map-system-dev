/**
 * POSTING MAP - Sprint A: Election District Rule Audit Runner
 */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

async function main() {
  console.log(`📡 Executing Sprint A: Election District Rule Audit...`);
  const url = `${WEB_APP_URL}?action=verifyDeployment&apiKey=valid-api-key&inspectCsvRules=true`;
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const rawJson = await res.json();
  const json = rawJson.data || rawJson;

  console.log(`\n========================================`);
  console.log(`📋 【Sprint A: 選挙区ルール監査 レポート】`);
  console.log(`========================================`);
  console.log(`対象ファイル          : ${json.districtFileName}`);
  console.log(`総ルール行数          : ${json.totalRows} 行\n`);

  console.log(`--- 1. ルール種別分布 (RuleType Breakdown) ---`);
  console.log(`  - 市/区ルール (CITY)   : ${json.cityRulesCount} 件`);
  console.log(`  - 郡ルール   (GUN)    : ${json.gunRulesCount} 件`);
  console.log(`  - 特殊ルール (SPECIAL): ${json.specialRulesCount} 件\n`);

  console.log(`--- 2. 郡ルール (GUN) 一覧 (全 ${json.gunRules.length} 件) ---`);
  json.gunRules.forEach(r => {
    console.log(`  [行 ${r.line.toString().padStart(2, ' ')}] 選挙区: ${r.district.padEnd(8, ' ')} | 県: ${r.pref} | 郡: ${r.city.padEnd(8, ' ')} | 対象地域: ${r.targetArea || '(全域)'}`);
  });

  console.log(`\n--- 3. 特殊ルール (SPECIAL / 除外・一部・特定区域) 一覧 (全 ${json.specialRules.length} 件) ---`);
  json.specialRules.forEach(r => {
    console.log(`  [行 ${r.line.toString().padStart(2, ' ')}] 選挙区: ${r.district.padEnd(8, ' ')} | 県: ${r.pref} | 自治体: ${r.city.padEnd(8, ' ')} | 特殊条件: "${r.targetArea}"`);
  });

  console.log(`========================================\n`);
}

main().catch(err => {
  console.error("❌ Sprint A Audit Error:", err.message);
  process.exit(1);
});
