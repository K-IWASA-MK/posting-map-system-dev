/**
 * build-gas-districts.js
 *
 * CSVマスタ (SSOT) から GAS 側のインライン定数マッピングコードを自動生成・更新するスクリプト。
 * 開発者がCSVを変更した際、このビルドスクリプトを実行することで、
 * GASへの定数同期を自動化し、CSV = 唯一の正 (SSOT) の整合性を完全に保護します。
 *
 * ⚙️ 強化版: Build Validation & Metadata
 */

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../data/districts/mie/yokkaichi_district_master.csv');
const GAS_EXTRACT_PATH = path.join(__dirname, '../active/gas/v2_extract.js');

// 四日市公式24地区市民センター管内リスト
const OFFICIAL_24_DISTRICTS = [
  "富洲原地区", "富田地区", "羽津地区", "常磐地区", "川島地区", "神前地区", "桜地区", "三重地区",
  "県地区", "八郷地区", "下野地区", "大矢知地区", "保々地区", "海蔵地区", "橋北地区", "中部地区",
  "日永地区", "四郷地区", "内部地区", "塩浜地区", "小山田地区", "河原田地区", "水沢地区", "楠地区"
];

function build() {
  console.log("🛠️  [GAS District Builder] ビルド・検証プロセスを開始します...");
  
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ エラー: CSVマスタが見つかりません。パス: ${CSV_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(GAS_EXTRACT_PATH)) {
    console.error(`❌ エラー: v2_extract.js が見つかりません。パス: ${GAS_EXTRACT_PATH}`);
    process.exit(1);
  }

  // 1. CSVの読み込み
  const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = csvContent.split(/\r?\n/);
  const mapping = [];
  
  const errors = [];
  const uniqueTownKeys = new Set();

  // 2. Build Validation (品質ゲート)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cells = line.split(',');
    if (cells.length < 3) {
      errors.push(`Row ${i + 1}: 列数が足りません。3列必要です。 内容: "${line}"`);
      continue;
    }
    
    const city = cells[0].trim();
    const town = cells[1].trim();
    const district = cells[2].trim();
    
    // 空欄検証
    if (!city) errors.push(`Row ${i + 1}: 市区町村名(CITY)が空欄です。`);
    if (!town) errors.push(`Row ${i + 1}: 町域名(TOWN)が空欄です。`);
    if (!district) errors.push(`Row ${i + 1}: 地区名(DISTRICT)が空欄です。`);
    
    // 不正な地区名検証 (公式24地区に存在するか)
    if (district && !OFFICIAL_24_DISTRICTS.includes(district)) {
      errors.push(`Row ${i + 1}: 不正な地区名です。公式24地区名以外は許可されません。値: "${district}"`);
    }
    
    // 重複検証 (市区町村＋町名の一意性)
    const townKey = `${city}_${town}`;
    if (uniqueTownKeys.has(townKey)) {
      errors.push(`Row ${i + 1}: 重複レコードが検出されました。町名: "${city} ${town}"`);
    } else {
      uniqueTownKeys.add(townKey);
    }
    
    mapping.push({ city, town, district });
  }

  // エラーがあれば Build Abort する
  if (errors.length > 0) {
    console.error("❌ [Build Abort] マスタCSVの検証に失敗しました。ビルドを中止します。");
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log(`✅ [Build Validation PASS] ${mapping.length} 件の町域定義を検証完了しました。`);

  // 3. Build Metadata の生成
  const timestamp = new Date().toISOString();
  const metaComment = 
`// AUTO GENERATED
// Source: data/districts/mie/yokkaichi_district_master.csv
// Records: ${mapping.length}
// Generated: ${timestamp}
// DO NOT EDIT`;

  const inlineJson = JSON.stringify(mapping, null, 2);
  const targetCode = `${metaComment}\nconst YOKKAICHI_DISTRICT_MASTER = ${inlineJson};`;

  // 4. v2_extract.js の読み込みと置換
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
  
  // 5. 書き込み保存
  fs.writeFileSync(GAS_EXTRACT_PATH, updatedCode, 'utf8');
  console.log("✅ [GAS District Builder] YOKKAICHI_DISTRICT_MASTER 定数の自動更新が完了しました！");
}

build();
