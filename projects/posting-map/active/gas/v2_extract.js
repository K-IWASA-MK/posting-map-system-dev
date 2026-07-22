/**
 * GAS v2 - 住所抽出モジュール
 * - CSVからの選挙区・住所データの抽出
 * - 住所文字列の正規化
 */

// =============================
// ② データ抽出 (gas.gs 完全移植)
// =============================

function extractDistrictAddresses(targetDistrictName, targetPrefecture) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Phase 2: 参照データ管理基盤 (File ID による確定取得)
  const districtFileId = CONFIG.get("DISTRICT_CSV_FILE_ID");
  let districtFile = null;
  if (districtFileId) {
    try {
      districtFile = DriveApp.getFileById(districtFileId);
    } catch (e) {
      const errMsg = `❌ DISTRICT_CSV_FILE_ID が無効です (ID: ${districtFileId})`;
      if (ss) ss.toast(errMsg, "設定エラー", 10);
      throw new Error(errMsg);
    }
  }
  if (!districtFile) {
    const errMsg = `❌ DISTRICT_CSV_FILE_ID が設定されていません。`;
    if (ss) ss.toast(errMsg, "設定エラー", 10);
    throw new Error(errMsg);
  }

  const districtData = getCsvOrSheetDataFromFile(districtFile);
  if (!districtData || districtData.length < 2) return [];

  // 引数が未指定の場合のフォールバック
  let finalDistrictName = targetDistrictName || CONFIG.get("DEFAULT_DISTRICT") || "三重第3区";
  let finalPrefecture = targetPrefecture || CONFIG.get("DEFAULT_PREFECTURE") || "三重県";

  const targetRules = [];
  for (let i = 1; i < districtData.length; i++) {
    const row = districtData[i];
    if (row && (row[0] === finalDistrictName || row[0] === "三重第3区" || row[0] === "第3区") && row[1] === finalPrefecture) {
      const cityStr = row[2] ? row[2].toString().trim() : "";
      const isGun = cityStr.endsWith("郡") || cityStr.includes("郡");
      targetRules.push({
        city: cityStr,
        townArea: row[3] || "",
        type: isGun ? "GUN" : "CITY"
      });
    }
  }

  // Postal File ID 取得
  const postalFileId = CONFIG.get("POSTAL_CSV_FILE_ID");
  let postalFile = null;
  if (postalFileId) {
    try {
      postalFile = DriveApp.getFileById(postalFileId);
    } catch (e) {
      // ALT ID Fallback
      const altId = CONFIG.get("POSTAL_ALT_FILE_ID") || "1jr272nvp4bUWh7maGfEnTKDa9qEqSbgP";
      try {
        postalFile = DriveApp.getFileById(altId);
      } catch (errAlt) {
        const errMsg = `❌ POSTAL_CSV_FILE_ID が無効です (ID: ${postalFileId})`;
        if (ss) ss.toast(errMsg, "設定エラー", 10);
        throw new Error(errMsg);
      }
    }
  }
  if (!postalFile) {
    const errMsg = `❌ POSTAL_CSV_FILE_ID が設定されていません。`;
    if (ss) ss.toast(errMsg, "設定エラー", 10);
    throw new Error(errMsg);
  }

  const postalData = getCsvOrSheetDataFromFile(postalFile);
  if (!postalData) return [];

  const addressMap = new Map();

  // 1. townArea（特定の町域指定ルール）の処理
  targetRules.filter(r => r.townArea).forEach(rule => {
    const addrString = rule.townArea.startsWith(rule.city)
      ? rule.townArea
      : rule.city + rule.townArea;
    let genericPostal = "";
    for (let i = 0; i < postalData.length; i++) {
      const r = postalData[i];
      const isCityMatch = rule.type === "GUN"
        ? (r && r[7] && r[7].toString().trim().startsWith(rule.city))
        : (r && r[7] && r[7].toString().trim() === rule.city);

      if (r && r[6] === finalPrefecture && isCityMatch && r[8] === "以下に掲載がない場合") {
        const p = r[2] ? r[2].toString().trim() : "";
        if (p.length === 7) genericPostal = `${p.slice(0, 3)}-${p.slice(3)}`;
        break;
      }
    }
    addressMap.set(addrString, genericPostal);
  });

  // 2. MIE_POSTAL.CSV の行順（郵便番号数値昇順）を100%維持したまま全体走査
  postalData.forEach((row) => {
    if (!row || row[6] !== finalPrefecture) return;
    const actualCityName = row[7] ? row[7].toString().trim() : "";
    
    // この行の自治体がどの targetRules に適合するか判定
    const matchedRule = targetRules.find(rule => {
      if (rule.townArea) return false;
      return rule.type === "GUN"
        ? actualCityName.startsWith(rule.city)
        : actualCityName === rule.city;
    });

    if (matchedRule) {
      const pCode = row[2] ? row[2].toString().trim() : "";
      const postalStr = pCode.length === 7 ? `${pCode.slice(0, 3)}-${pCode.slice(3)}` : pCode;
      const townRaw = row[8];

      if (townRaw && townRaw !== "以下に掲載がない場合") {
        const expanded = expandTownChome(actualCityName, townRaw);
        expanded.forEach((addr) => {
          if (!addressMap.has(addr) || addressMap.get(addr) === "") {
            addressMap.set(addr, postalStr);
          }
        });
      }
    }
  });
  // 郵便番号データから「漢字の市町村名 ➔ カタカナの読み仮名」および「漢字の町域名 ➔ カタカナの読み仮名」のマップを構築
  const cityKanaMap = {};
  const townKanaMap = {};
  postalData.forEach(row => {
    if (row) {
      if (row[7] && row[4]) {
        const cityKanji = row[7].toString().trim();
        const cityKana = row[4].toString().trim();
        if (cityKanji && cityKana && !cityKanaMap[cityKanji]) {
          cityKanaMap[cityKanji] = toFullWidthKana(cityKana);
        }
      }
      if (row[8] && row[5]) {
        const townKanji = row[8].toString().trim().replace(/（.*?）/g, "").replace(/\(.*?\)/g, "");
        const townKana = toFullWidthKana(row[5].toString().trim().replace(/（.*?）/g, "").replace(/\(.*?\)/g, ""));
        if (townKanji && townKana && !townKanaMap[townKanji]) {
          townKanaMap[townKanji] = townKana;
        }
      }
    }
  });

  const items = Array.from(addressMap, ([address, postalCode]) => {
    const city = extractCityName(address);
    const cityIdx = address.indexOf(city);
    const town = cityIdx !== -1 ? address.slice(cityIdx + city.length) : address;
    
    // 簡易的な前方一致でカナを特定
    let townKana = town;
    for (let k in townKanaMap) {
      if (town.indexOf(k) === 0) {
        townKana = town.replace(k, townKanaMap[k]);
        break;
      }
    }

    return {
      postalCode,
      address,
      city,
      cityKana: cityKanaMap[city] || "",
      townKana: townKana
    };
  });

  return items.map(item => ({
    postalCode: item.postalCode,
    address: item.address,
    city: item.city,
    cityKana: item.cityKana,
    townKana: item.townKana
  }));
}

function expandTownChome(baseCity, townRaw) {
  if (!townRaw) return [];
  const match = townRaw.match(/（([０-９0-9]+)〜([０-９0-9]+)丁目）/);
  if (match) {
    const start = parseInt(toHalfWidth(match[1]), 10);
    const end = parseInt(toHalfWidth(match[2]), 10);
    const baseTown = townRaw.replace(/（.*?）/g, "");
    let list = [];
    for (let i = start; i <= end; i++) {
      list.push(baseCity + baseTown + i + "丁目");
    }
    return list;
  }
  return [baseCity + townRaw.replace(/（.*?）/g, "")];
}

function toHalfWidth(str) {
  return str
    .toString()
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
}

function extractCityName(addr) {
  if (addr.indexOf("四日市市") === 0) return "四日市市";
  return addr.match(/^(.+?[市郡])/) ? addr.match(/^(.+?[市郡])/)[1] : "エリア";
}

// 半角カタカナを全角カタカナに変換して濁点を結合するユーティリティ
function toFullWidthKana(str) {
  if (!str) return "";
  const kanaMap = {
    'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
    'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
    'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
    'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
    'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
    'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
    'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
    'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
    'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
    'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
    'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
    'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ', 'ｯ': 'ッ',
    'ｰ': 'ー', 'ﾞ': '゛', 'ﾟ': '゜'
  };
  let s = str.replace(/[ｱ-ﾝｧ-ｫｬ-ｮｯｰﾞﾟ]/g, m => kanaMap[m] || m);
  s = s.replace(/カ゛/g, 'ガ').replace(/キ゛/g, 'ギ').replace(/ク゛/g, 'グ').replace(/ケ゛/g, 'ゲ').replace(/コ゛/g, 'ゴ')
       .replace(/サ゛/g, 'ザ').replace(/シ゛/g, 'ジ').replace(/ス゛/g, 'ズ').replace(/セ゛/g, 'ゼ').replace(/ソ゛/g, 'ゾ')
       .replace(/タ゛/g, 'ダ').replace(/チ゛/g, 'ヂ').replace(/ツ゛/g, 'ヅ').replace(/テ゛/g, 'デ').replace(/ト゛/g, 'ド')
       .replace(/ハ゛/g, 'バ').replace(/ヒ゛/g, 'ビ').replace(/フ゛/g, 'ブ').replace(/ヘ゛/g, 'ベ').replace(/ホ゛/g, 'ボ')
       .replace(/ハ゜/g, 'パ').replace(/ヒ゜/g, 'ピ').replace(/フ゜/g, 'プ').replace(/ヘ゜/g, 'ペ').replace(/ホ゜/g, 'ポ');
  return s;
}

/**
 * 指定したキーワード（パターン）を含むファイルをドライブから検索する。
 * なければ fallbackName で完全一致検索する。
 */
function findFileByPattern(pattern, fallbackName) {
  try {
    const query = `title contains '${pattern}' and trashed = false`;
    const files = DriveApp.searchFiles(query);
    if (files.hasNext()) {
      return files.next();
    }
  } catch (e) {
    // 検索エラー時はログを残しフォールバックへ
  }
  
  // フォールバック
  const files = DriveApp.getFilesByName(fallbackName);
  if (files.hasNext()) {
    return files.next();
  }
  return null;
}

/**
 * ファイルオブジェクトからCSVまたはGoogleスプレッドシートのデータをパースして取得する
 */
function getCsvOrSheetDataFromFile(file) {
  if (!file) return null;
  const mime = file.getMimeType();
  if (mime === MimeType.GOOGLE_SHEETS) {
    const ss = SpreadsheetApp.open(file);
    return ss.getSheets()[0].getDataRange().getValues();
  } else {
    const blob = file.getBlob();
    let text;
    try {
      text = blob.getDataAsString("UTF-8");
      if (text.indexOf("\uFFFD") !== -1) throw new Error();
    } catch (e) {
      text = blob.getDataAsString("Shift_JIS");
    }
    try {
      return Utilities.parseCsv(text);
    } catch (e) {
      return text.split("\n").map((line) => line.split(","));
    }
  }
}

/**
 * スプレッドシート名から都道府県と選挙区を自動検出する
 */
function detectRegionFromSpreadsheetName() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const name = ss.getName();
  
  let prefecture = "";
  let district = "";
  
  // 1. 都道府県の検出
  const prefMap = {
    "MIE": "三重県", "三重": "三重県",
    "TOKYO": "東京都", "東京": "東京都",
    "OSAKA": "大阪府", "大阪": "大阪府",
    "AICHI": "愛知県", "愛知": "愛知県",
    "GIFU": "岐阜県", "岐阜": "岐阜県",
    "SHIGA": "滋賀県", "滋賀": "滋賀県",
    "KYOTO": "京都府", "京都": "京都府",
    "HYOGO": "兵庫県", "兵庫": "兵庫県",
    "KANAGAWA": "神奈川県", "神奈川": "神奈川県",
    "SAITAMA": "埼玉県", "埼玉": "埼玉県",
    "CHIBA": "千葉県", "CHIBA": "千葉県"
  };
  
  const upperName = name.toUpperCase();
  for (const [key, val] of Object.entries(prefMap)) {
    if (upperName.includes(key)) {
      prefecture = val;
      break;
    }
  }
  
  // 2. 選挙区の検出 (例: MIE-02, 三重第2区, 三重2区)
  // パターンA: 「第2区」や「2区」
  const districtMatch = name.match(/(?:第)?([0-9]+)区/);
  if (districtMatch) {
    district = `第${parseInt(districtMatch[1], 10)}区`;
  } else {
    // パターンB: ハイフン区切りのコード (MIE-02 など)
    const codeMatch = name.match(/[A-Za-z]+-([0-9]+)/);
    if (codeMatch) {
      district = `第${parseInt(codeMatch[1], 10)}区`;
    }
  }
  
  return { prefecture, district };
}
