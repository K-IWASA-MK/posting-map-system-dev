/**
 * build-gas-districts.js
 *
 * CSVマスタ (SSOT) から GAS 側のインライン定数マッピングコードを自動生成・更新するスクリプト。
 * 開発者がCSVを変更した際、このビルドスクリプトを実行することで、
 * GASへの定数同期を自動化し、CSV = 唯一の正 (SSOT) の整合性を完全に保護します。
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../data/districts/mie/yokkaichi_district_master.csv');
const GAS_EXTRACT_PATH = path.join(__dirname, '../active/gas/v2_extract.js');

function build() {
  console.log("🛠️  [GAS District Builder] 処理を開始します...");
  
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ エラー: CSVマスタが見つかりません。パス: ${CSV_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(GAS_EXTRACT_PATH)) {
    console.error(`❌ エラー: v2_extract.js が見つかりません。パス: ${GAS_EXTRACT_PATH}`);
    process.exit(1);
  }

  // 1. CSVの読み込みとパース
  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvContent.split(/\r?\n/);
  const mapping = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = line.split(',');
    if (cells.length < 3) continue;
    
    const city = cells[0].trim();
    const town = cells[1].trim();
    const district = cells[2].trim();
    
    mapping.push({ city, town, district });
  }

  console.log(`📡 CSVロード完了: ${mapping.length} 件の町域定義を読み込みました。`);

  // 2. インラインJSON文字列の作成
  const inlineJson = JSON.stringify(mapping, null, 2);
  const targetCode = `const YOKKAICHI_DISTRICT_MASTER = ${inlineJson};`;

  // 3. v2_extract.js の読み込みと置換
  let gasCode = fs.readFileSync(GAS_EXTRACT_PATH, 'utf8');
  
  const startMarker = "// === [Yokkaichi District Master Area SSOT: START] ===";
  const endMarker = "// === [Yokkaichi District Master Area SSOT: END] ===";

  const startIndex = gasCode.indexOf(startMarker);
  const endIndex = gasCode.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    console.error("❌ エラー: v2_extract.js 内に自動置換用マーカーが見つかりません。");
    process.exit(1);
  }

  const before = gasCode.slice(0, startIndex + startMarker.length);
  const after = gasCode.slice(endIndex);

  const updatedCode = `${before}\n${targetCode}\n${after}`;
  
  // 4. 書き込み保存
  fs.writeFileSync(GAS_EXTRACT_PATH, updatedCode, 'utf8');
  console.log("✅ [GAS District Builder] YOKKAICHI_DISTRICT_MASTER 定数の自動更新が完了しました！");
}

build();
