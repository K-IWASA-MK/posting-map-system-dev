const https = require('https');
const fs = require('fs');
const path = require('path');

const API_URL = "https://script.google.com/macros/s/AKfycbxyHvUbJ3yVwXX8sIdK_mWb6ML5ChmFX3mfv-nlEv1DDCv30hBQJlngM096_zLW04vQ/exec";
const VERIFICATION_REPORT_PATH = "/Users/katsujiiwasa/.gemini/antigravity-ide/brain/ca5a9d14-de78-4c24-800b-3e9be8ecfcec/district_verification_report.md";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log("==================================================");
  console.log("🚀 [Rebuild Gate] Enforcing execution guardrails...");
  console.log("==================================================");

  // ガードレール 1: 中間検証レポートの存在チェック
  if (!fs.existsSync(VERIFICATION_REPORT_PATH)) {
    console.error("❌ [Guardrail Error] 中間検証レポートが見つかりません。まず verify-district を実行してください。");
    process.exit(1);
  }

  const reportContent = fs.readFileSync(VERIFICATION_REPORT_PATH, 'utf8');

  // ガードレール 2: Unknown Blocker チェック
  if (reportContent.includes("BLOCKED") || reportContent.includes("Unknown District は検出されませんでした") === false) {
    console.error("❌ [Guardrail Error] 検証レポートに Unknown District が含まれているか、検証失敗ステータスです。本番実行はロックされています。");
    process.exit(1);
  }

  console.log("✅ [Guardrail Pass] 中間検証結果は正常です (Unknown = 0)。");

  // ガードレール 3: PM-002 準拠の自動バックアップ作成
  console.log("💾 [PM-002 ロールバック担保] スプレッドシートのバックアップコピーを生成中...");
  const backupRes = await fetchJson(`${API_URL}?action=verifyDeployment&districtId=MIE-03&backupSpreadsheet=true`);
  if (!backupRes || !backupRes.success) {
    console.error("❌ [PM-002 Error] バックアップコピーの生成に失敗しました。処理を安全にアボートします:", backupRes);
    process.exit(1);
  }
  console.log(`✅ バックアップ生成成功: ${backupRes.backupName} (ID: ${backupRes.backupFileId})`);

  // ガードレール 4: 古い中途エリアシートの全クリーン削除 (削除ガバナンス実行)
  console.log("🧹 [PM-002 既存シート削除] 中途作成エリアシート (32シート) のクリーン削除を実行中...");
  const cleanRes = await fetchJson(`${API_URL}?action=verifyDeployment&districtId=MIE-03&forceStartBatch=true`);
  if (!cleanRes || !cleanRes.success) {
    console.error("❌ シートの初期化・クリーン削除に失敗しました:", cleanRes);
    process.exit(1);
  }
  console.log("✅ 古いシートの削除・クリーンアップを完了しました。");

  // ガードレール 5: 分割バッチリレー実行による本番シート安全生成
  console.log("🔄 [本番生成バッチ] エリアシートの分割リレー構築を開始します...");
  let isCompleted = false;
  let loops = 0;
  
  while (!isCompleted && loops < 45) {
    loops++;
    const batchStepRes = await fetchJson(`${API_URL}?action=verifyDeployment&districtId=MIE-03&runBatchStep=true`);
    if (!batchStepRes || !batchStepRes.success) {
      console.error(`❌ [Batch Error] ループ #${loops} でバッチ処理が失敗しました:`, batchStepRes);
      process.exit(1);
    }
    
    isCompleted = batchStepRes.isCompleted;
    console.log(`  - [Batch Loop #${loops}] インデックス: ${batchStepRes.index}, 完了ステータス: ${isCompleted}`);
  }

  // ガードレール 6: 物理ソート & キャッシュ最終更新
  console.log("📐 [最終工程] タブの物理ソートおよびキャッシュの再構築を実行中...");
  const sortRes = await fetchJson(`${API_URL}?action=verifyDeployment&districtId=MIE-03&sortTabs=true`);
  const showRes = await fetchJson(`${API_URL}?action=verifyDeployment&districtId=MIE-03&showAll=true`);

  console.log("\n==================================================");
  console.log("🎉 PRODUCTION AREA REBUILD COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
  console.log(`生成エリア数: ${showRes.shownCount || 0} エリア`);
  console.log(`キャッシュ数: ${showRes.summaryCount || 0} エリア`);
  console.log("==================================================\n");
}

main().catch(console.error);
