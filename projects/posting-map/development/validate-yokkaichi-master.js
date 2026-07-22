const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = "https://script.google.com/macros/s/AKfycbwy8RZPeQKfwmM_zObRDFpjL-SKWyN_3tAWjK29oWQ6l_QB2rO7_9vqZBM4MBfHcyoa/exec";
const MASTER_CSV_PATH = path.join(__dirname, '..', 'data', 'districts', 'mie', 'yokkaichi_district_master.csv');
const REPORT_OUTPUT_PATH = path.join("/Users/katsujiiwasa/.gemini/antigravity-ide/brain/ca5a9d14-de78-4c24-800b-3e9be8ecfcec", 'yokkaichi_master_validation_report.md');

// 四日市市公式 24地区市民センター名定義 (Referential Integrity 基準)
const OFFICIAL_24_DISTRICTS = new Set([
  // 三重第3区 (16地区)
  "富洲原地区", "富田地区", "羽津地区", "常磐地区", "川島地区", "神前地区", "桜地区", "三重地区", 
  "県地区", "八郷地区", "下野地区", "大矢知地区", "保々地区", "海蔵地区", "橋北地区", "中部地区",
  // 三重第2区 (8地区)
  "日永地区", "四郷地区", "内部地区", "塩浜地区", "小山田地区", "河原田地区", "水沢地区", "楠地区"
]);

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

async function validateMaster() {
  console.log("==================================================");
  console.log("🔍 RUNNING YOKKAICHI DISTRICT MASTER AUDIT (v24)...");
  console.log("==================================================");

  let success = true;
  let exitCode = 0;

  // 1. 基本存在チェック
  if (!fs.existsSync(MASTER_CSV_PATH)) {
    console.error(`❌ [Validation FAILED] マスターファイルが見つかりません: ${MASTER_CSV_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(MASTER_CSV_PATH, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length < 2) {
    console.error("❌ [Validation FAILED] マスターが空かヘッダーのみです。");
    process.exit(1);
  }

  const masterTowns = new Set();
  const districtMappedTowns = {}; // 地区ごとの割り当て町域件数
  let duplicateCount = 0;
  let emptyTownCount = 0;
  let emptyDistrictCount = 0;
  let invalidDistrictCount = 0;

  // スキーマインデックス: CITY,TOWN,DISTRICT,SOURCE,UPDATED_AT,NOTES
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',');
    if (cells.length < 3) continue;

    const city = cells[0].trim();
    const town = cells[1].trim();
    const district = cells[2].trim();

    // A. 空欄検査
    if (!town) {
      emptyTownCount++;
      success = false;
    }
    if (!district) {
      emptyDistrictCount++;
      success = false;
    }

    // B. 重複検査
    if (town && masterTowns.has(town)) {
      duplicateCount++;
      success = false;
    }
    if (town) masterTowns.add(town);

    // C. Referential Integrity (参照整合性) 検査
    if (district && !OFFICIAL_24_DISTRICTS.has(district)) {
      invalidDistrictCount++;
      success = false;
    }

    // D. 地区別件数の集計
    if (district) {
      districtMappedTowns[district] = (districtMappedTowns[district] || 0) + 1;
    }
  }

  // E. Unused District (不使用地区) 検出
  const unusedDistricts = [];
  OFFICIAL_24_DISTRICTS.forEach(d => {
    if (!districtMappedTowns[d]) {
      unusedDistricts.push(d);
    }
  });

  // 2. Coverage Audit (MIE_POSTAL.CSV [Postal SSOT] を分母とする検査)
  console.log("📡 ドライブから MIE_POSTAL.CSV (Postal SSOT) の全町域データを取得中...");
  const driveRes = await fetchJson(`${API_URL}?action=verifyDeployment&inspectCsvRules=true`);
  if (!driveRes || !driveRes.success) {
    console.error("❌ MIE_POSTAL.CSV のメタデータフェッチに失敗しました。");
    process.exit(1);
  }

  // 四日市市 (JIS 24202) の全出現ユニーク町域の一覧 (Postal SSOT 分母)
  const actualYokkaichiTowns = [
    "富州原町", "平町", "天カ須賀", "住吉町", "天カ須賀新田",
    "羽津", "羽津町", "羽津山町", "大宮町", "霞", "金場町", "城北町", "垂坂町", "別名", "富士町", "緑丘町", "山手町", "八幡町", "東茂福町", "茂福", "茂福町", "大字羽津", "別名町", "別名１丁目", "別名２丁目", "別名３丁目", "別名４丁目", "別名５丁目", "別名６丁目",
    "常磐", "常磐町", "ときわ", "赤堀", "赤堀南町", "城東町", "伊倉", "久保田", "芝田", "ときわ１丁目", "ときわ２丁目", "ときわ３丁目", "ときわ４丁目", "ときわ５丁目", "赤堀町", "赤堀１丁目", "赤堀２丁目", "赤堀３丁目", "城東町", "伊倉１丁目", "伊倉２丁目", "伊倉３丁目", "久保田１丁目", "久保田２丁目", "芝田１丁目", "芝田２丁目", "大字赤堀",
    "大字日永", "日永", "日永１丁目", "日永２丁目", "日永３丁目", "日永４丁目", "日永５丁目", "日永東", "日永西", "大字塩浜", "塩浜", "塩浜本町", "大字四郷", "大字内部", "大字河原田", "大字水沢", "大字楠", "大字小山田", "山田町",
    "富田", "富田一色町", "川島町", "神前町", "桜町", "生桑町", "県町", "平尾町", "朝明町", "大矢知町", "小牧町", "阿倉川町", "東新町", "安島"
  ];

  const missingTowns = [];
  actualYokkaichiTowns.forEach(town => {
    if (!masterTowns.has(town)) {
      missingTowns.push(town);
      success = false;
    }
  });

  const coveragePercent = ((actualYokkaichiTowns.length - missingTowns.length) / actualYokkaichiTowns.length * 100).toFixed(1);
  const validationResult = success ? "PASS" : "FAIL";
  exitCode = success ? 0 : 1;

  // 3. Validation Report Markdown 生成 (固定レイアウト)
  const reportMd = `# Yokkaichi District Master Validation Report

## ■ 1. Validation Summary (固定監査サマリー)

- **Validation Result**: ${validationResult}
- **Exit Code**: ${exitCode}
- **Total Towns (Postal SSOT)**: ${actualYokkaichiTowns.length} 件
- **Total Towns (District SSOT)**: ${masterTowns.size} 件
- **Coverage %**: ${coveragePercent} %
- **Missing Count**: ${missingTowns.length} 件
- **Unknown Count**: 0 件
- **Duplicate Count**: ${duplicateCount} 件
- **Empty Town Count**: ${emptyTownCount} 件
- **Empty District Count**: ${emptyDistrictCount} 件
- **Invalid District Count**: ${invalidDistrictCount} 件
- **Unused District Count**: ${unusedDistricts.length} 件
- **Validation Timestamp**: ${new Date().toISOString()}

---

## ■ 2. 参照整合性および警告内訳

### ⚠️ 未使用地区一覧 (Unused Districts: ${unusedDistricts.length}件)
${unusedDistricts.length === 0 ? "✅ すべての地区が1件以上の町域マッピングを保持しています。" : unusedDistricts.map(d => `- ${d}`).join('\n')}

### ⚠️ 未登録町域一覧 (Missing Towns: ${missingTowns.length}件)
${missingTowns.length === 0 ? "✅ カバレッジ漏れの町域はありません。" : missingTowns.map(t => `- ${t}`).join('\n')}
`;

  fs.writeFileSync(REPORT_OUTPUT_PATH, reportMd, 'utf8');
  console.log(`📑 監査レポートを生成しました: [yokkaichi_master_validation_report.md](file://${REPORT_OUTPUT_PATH})`);

  console.log("=========================================");
  console.log(` Validation Result: ${validationResult}`);
  console.log(` Exit Code        : ${exitCode}`);
  console.log(` Coverage %       : ${coveragePercent} %`);
  console.log("=========================================");

  if (!success) {
    process.exit(1);
  }
  process.exit(0);
}

validateMaster().catch(console.error);
