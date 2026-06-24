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
  
  // 1. 「区割り」を含むファイルをスマート検索
  const districtFile = findFileByPattern("区割り", CONFIG.get("DISTRICT_CSV"));
  if (!districtFile) {
    ss.toast("Google Drive上に「区割り」を含むCSVファイルが見つかりません。", "エラー", 5);
    return [];
  }
  const districtData = getCsvOrSheetDataFromFile(districtFile);
  if (!districtData || districtData.length < 2) return [];

  // 2. 引数が未指定の場合、スプレッドシート名からの検出 ➔ 設定ファイルのデフォルト ➔ CSV最初の行 の優先順位で自動検出
  let finalDistrictName = targetDistrictName;
  let finalPrefecture = targetPrefecture;

  if (!finalDistrictName || !finalPrefecture) {
    const detected = detectRegionFromSpreadsheetName();
    if (detected.district && !finalDistrictName) finalDistrictName = detected.district;
    if (detected.prefecture && !finalPrefecture) finalPrefecture = detected.prefecture;
  }

  if (!finalDistrictName) finalDistrictName = CONFIG.get("DEFAULT_DISTRICT");
  if (!finalPrefecture) finalPrefecture = CONFIG.get("DEFAULT_PREFECTURE");

  const firstDataRow = districtData[1]; // 0番目はヘッダー
  if (!finalDistrictName) finalDistrictName = firstDataRow[0];
  if (!finalPrefecture) finalPrefecture = firstDataRow[1];

  const targetRules = [];
  for (let i = 1; i < districtData.length; i++) {
    const row = districtData[i];
    if (row && row[0] === finalDistrictName && row[1] === finalPrefecture) {
      targetRules.push({ city: row[2], townArea: row[3] || "" });
    }
  }

  // 3. ドライブから「postal」または「郵便番号」を含むファイルをスマート検索
  const postalFile = findFileByPattern("postal", CONFIG.get("POSTAL_CSV")) || findFileByPattern("郵便番号", CONFIG.get("POSTAL_CSV"));
  if (!postalFile) {
    ss.toast("Google Drive上に「postal」または「郵便番号」を含むCSVファイルが見つかりません。", "エラー", 5);
    return [];
  }
  const postalData = getCsvOrSheetDataFromFile(postalFile);
  if (!postalData) return [];

  const addressMap = new Map();
  targetRules.forEach((rule) => {
    if (rule.townArea) {
      const addrString = rule.townArea.startsWith(rule.city)
        ? rule.townArea
        : rule.city + rule.townArea;
      let genericPostal = "";
      for (let i = 0; i < postalData.length; i++) {
        const r = postalData[i];
        if (
          r &&
          r[6] === finalPrefecture &&
          r[7] === rule.city &&
          r[8] === "以下に掲載がない場合"
        ) {
          const p = r[2] ? r[2].toString().trim() : "";
          if (p.length === 7) genericPostal = `${p.slice(0, 3)}-${p.slice(3)}`;
          break;
        }
      }
      addressMap.set(addrString, genericPostal);
    } else {
      postalData.forEach((row) => {
        if (row && row[6] === finalPrefecture && row[7] === rule.city) {
          const pCode = row[2] ? row[2].toString().trim() : "";
          const postalStr =
            pCode.length === 7
              ? `${pCode.slice(0, 3)}-${pCode.slice(3)}`
              : pCode;
          const townRaw = row[8];
          if (townRaw && townRaw !== "以下に掲載がない場合") {
            const expanded = expandTownChome(rule.city, townRaw);
            expanded.forEach((addr) => {
              if (!addressMap.has(addr) || addressMap.get(addr) === "") {
                addressMap.set(addr, postalStr);
              }
            });
          }
        }
      });
    }
  });
  // 郵便番号データから「漢字の市町村名 ➔ カタカナの読み仮名」のマップを構築
  const cityKanaMap = {};
  postalData.forEach(row => {
    if (row && row[7] && row[4]) {
      const cityKanji = row[7].toString().trim();
      const cityKana = row[4].toString().trim();
      if (cityKanji && cityKana && !cityKanaMap[cityKanji]) {
        cityKanaMap[cityKanji] = toFullWidthKana(cityKana);
      }
    }
  });

  return Array.from(addressMap, ([address, postalCode]) => {
    const city = extractCityName(address);
    return {
      postalCode,
      address,
      city,
      cityKana: cityKanaMap[city] || ""
    };
  });
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
