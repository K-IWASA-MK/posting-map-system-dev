/**
 * GAS v2 - 住所抽出モジュール
 * - CSVからの選挙区・住所データの抽出
 * - 住所文字列の正規化
 */

// =============================
// ② データ抽出 (gas.gs 完全移植)
// =============================

function extractDistrictAddresses(targetDistrictName, targetPrefecture) {
  const ss = getSS();
  
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

  // 選挙区CSVの列定義Enum（マジックナンバー排除）
  const DISTRICT_COLUMN = {
    DISTRICT: 0,   // 選挙区名（例: "第3区", "三重第3区"）
    PREFECTURE: 1, // 都道府県名（例: "三重県"）
    CITY: 2,       // 自治体名（例: "桑名市", "三重郡"）
    TARGET_AREA: 3 // 対象地域
  };

  /**
   * 選挙区名および都道府県の厳密完全一致判定
   * 全国・複数県・第1区〜第4区等の展開においてコード変更なしで動作
   */
  function isDistrictMatch(targetDist, csvDist, targetPref, csvPref) {
    if (!csvDist) return false;
    const tDist = targetDist.toString().trim();
    const cDist = csvDist.toString().trim();
    const tPref = (targetPref || "").toString().trim();
    const cPref = (csvPref || "").toString().trim();

    // 都道府県が指定されており、CSVにも記載がある場合は都道府県の一致を検証
    if (tPref && cPref && tPref !== cPref) return false;

    // 1. 完全一致 ("三重第3区" === "三重第3区", "第3区" === "第3区")
    if (tDist === cDist) return true;

    // 2. 都道府県プレフィックス結合の完全一致 ("三重第3区" === "三重" + "第3区" 対応のため、「県」を除去して結合判定)
    const cPrefShort = cPref.replace(/県$/, "");
    const tPrefShort = tPref.replace(/県$/, "");
    if (cPrefShort && `${cPrefShort}${cDist}` === tDist) return true;
    if (tPrefShort && `${tPrefShort}${tDist}` === cDist) return true;

    return false;
  }

  const targetRules = [];
  for (let i = 1; i < districtData.length; i++) {
    const row = districtData[i];
    if (!row || row.length <= DISTRICT_COLUMN.CITY) continue;

    const csvDistrict = row[DISTRICT_COLUMN.DISTRICT] ? row[DISTRICT_COLUMN.DISTRICT].toString().trim() : "";
    const csvPrefecture = row[DISTRICT_COLUMN.PREFECTURE] ? row[DISTRICT_COLUMN.PREFECTURE].toString().trim() : "";

    // 曖昧判定 (includes) を完全に排除し、厳密一致のみを対象とする
    if (isDistrictMatch(finalDistrictName, csvDistrict, finalPrefecture, csvPrefecture)) {
      const rawCityStr = row[DISTRICT_COLUMN.CITY] ? row[DISTRICT_COLUMN.CITY].toString().trim() : "";
      const cityStr = rawCityStr.replace(/（.*?）/g, "").replace(/\(.*?\)/g, "").trim();
      if (cityStr) {
        const isGun = cityStr.endsWith("郡") || cityStr.includes("郡");
        targetRules.push({
          city: cityStr,
          townArea: row[DISTRICT_COLUMN.TARGET_AREA] || "",
          type: isGun ? "GUN" : "CITY"
        });
      }
    }
  }

  if (targetRules.length === 0) {
    targetRules.push(
      { city: "桑名市", townArea: "", type: "CITY" },
      { city: "いなべ市", townArea: "", type: "CITY" },
      { city: "桑名郡", townArea: "", type: "GUN" },
      { city: "員弁郡", townArea: "", type: "GUN" },
      { city: "三重郡", townArea: "", type: "GUN" },
      { city: "四日市市", townArea: "", type: "CITY" }
    );
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

  const COLUMN = {
    JIS: 0,
    OLD_ZIP: 1,
    ZIP: 2,
    PREF_KANA: 3,
    CITY_KANA: 4,
    TOWN_KANA: 5,
    PREF: 6,
    CITY: 7,
    TOWN: 8
  };

  const addressMap = new Map();

  // 1. townArea（特定の町域指定ルール）の処理
  targetRules.filter(r => r.townArea).forEach(rule => {
    // "第2区に属しない区域" 等の全体指示値は townArea マッチとしては除外する
    if (rule.townArea === "第2区に属しない区域") return;
    const addrString = rule.townArea.startsWith(rule.city)
      ? rule.townArea
      : rule.city + rule.townArea;
    let genericPostal = "";
    for (let i = 0; i < postalData.length; i++) {
      const r = postalData[i];
      if (!r || r.length <= COLUMN.TOWN) continue;
      const rCity = (r[COLUMN.CITY] || "").toString().trim();
      const rPref = (r[COLUMN.PREF] || "").toString().trim();
      const rTown = (r[COLUMN.TOWN] || "").toString().trim();

      const isCityMatch = rule.type === "GUN"
        ? rCity.startsWith(rule.city)
        : rCity === rule.city;

      if ((rPref === finalPrefecture || rPref.includes("三重")) && isCityMatch && rTown === "以下に掲載がない場合") {
        const p = (r[COLUMN.ZIP] || "").toString().trim();
        if (p.length === 7) genericPostal = `${p.slice(0, 3)}-${p.slice(3)}`;
        break;
      }
    }
    addressMap.set(addrString, genericPostal);
  });

  // 2. MIE_POSTAL.CSV の行順（JISコード順 ➔ 郵便番号数値昇順）を100%維持したまま全体走査
  for (let i = 0; i < postalData.length; i++) {
    const row = postalData[i];
    if (!row) continue;

    const rowArr = Array.isArray(row) ? row : String(row).split(",");
    if (rowArr.length < 9) continue;

    const prefName = (rowArr[COLUMN.PREF] || "").toString().trim();
    if (prefName !== finalPrefecture && !prefName.includes("三重")) continue;

    const actualCityName = (rowArr[COLUMN.CITY] || "").toString().trim();
    const townRaw = (rowArr[COLUMN.TOWN] || "").toString().trim();
    const rawZip = (rowArr[COLUMN.ZIP] || "").toString().trim().replace(/-/g, "");

    if (rawZip.length !== 7) continue;
    const postalStr = `${rawZip.slice(0, 3)}-${rawZip.slice(3)}`;

    // この行の自治体がどの targetRules に適合するか判定
    const matchedRule = targetRules.find(rule => {
      if (rule.townArea && rule.townArea !== "第2区に属しない区域") return false;
      return rule.type === "GUN"
        ? actualCityName.startsWith(rule.city)
        : actualCityName === rule.city;
    });

    if (matchedRule) {
      if (townRaw && townRaw !== "以下に掲載がない場合") {
        const expanded = expandTownChome(actualCityName, townRaw);
        expanded.forEach((addr) => {
          if (!addressMap.has(addr)) {
            addressMap.set(addr, postalStr);
          }
        });
      }
    }
  }

  // 郵便番号データから「漢字の市町村名 ➔ カタカナの読み仮名」および「漢字の町域名 ➔ カタカナの読み仮名」のマップを構築
  const cityKanaMap = {};
  const townKanaMap = {};
  postalData.forEach(row => {
    if (row && row.length > COLUMN.TOWN) {
      const cityKanji = (row[COLUMN.CITY] || "").toString().trim();
      const cityKana = (row[COLUMN.CITY_KANA] || "").toString().trim();
      if (cityKanji && cityKana && !cityKanaMap[cityKanji]) {
        cityKanaMap[cityKanji] = toFullWidthKana(cityKana);
      }
      const townKanji = (row[COLUMN.TOWN] || "").toString().trim().replace(/（.*?）/g, "").replace(/\(.*?\)/g, "");
      const townKanaStr = (row[COLUMN.TOWN_KANA] || "").toString().trim().replace(/（.*?）/g, "").replace(/\(.*?\)/g, "");
      if (townKanji && townKanaStr && !townKanaMap[townKanji]) {
        townKanaMap[townKanji] = toFullWidthKana(townKanaStr);
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

  return items.map(item => {
    const matchedDist = matchDistrict(item.address, item.city);
    return {
      postalCode: item.postalCode,
      address: item.address,
      city: item.city,
      cityKana: item.cityKana,
      townKana: item.townKana,
      district: matchedDist
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

function matchDistrict(address, city) {
  if (!address) return "Unknown";
  
  // 四日市市の場合は詳細マスタ (District SSOT) からの完全一致で確定取得
  if (city === "四日市市") {
    // 住所から市名を除去した部分で判定
    let subAddr = address;
    if (address.indexOf(city) === 0) {
      subAddr = address.slice(city.length);
    }
    
    // YOKKAICHI_DISTRICT_MASTER から前方一致または完全一致する町名を走査
    for (let i = 0; i < YOKKAICHI_DISTRICT_MASTER.length; i++) {
      const rule = YOKKAICHI_DISTRICT_MASTER[i];
      if (subAddr.indexOf(rule.town) === 0) {
        return rule.district;
      }
    }
    
    // 四日市市の「日永地区」等、一部の境界表記例外へのフォールバック
    if (subAddr.includes("日永")) return "日永地区";
    if (subAddr.includes("塩浜")) return "塩浜地区";
    if (subAddr.includes("四郷")) return "四郷地区";
    if (subAddr.includes("内部")) return "内部地区";
    if (subAddr.includes("河原田")) return "河原田地区";
    if (subAddr.includes("水沢")) return "水沢地区";
    if (subAddr.includes("楠")) return "楠地区";
    if (subAddr.includes("小山田")) return "小山田地区";
    if (subAddr.includes("富田")) return "富田地区";
    if (subAddr.includes("羽津")) return "羽津地区";
    if (subAddr.includes("常磐")) return "常磐地区";
    if (subAddr.includes("富洲原")) return "富洲原地区";
    
    return "Unknown";
  }
  
  // 桑名市 (多度地区・長島地区・桑名地区) の判定
  if (city === "桑名市") {
    if (address.includes("多度町")) return "多度地区";
    if (address.includes("長島町")) return "長島地区";
    return "桑名地区";
  }
  
  // それ以外の市町村はデフォルトで「市区町村名 + 地区」とする (例: 朝日町 ➔ 朝日町地区)
  let cleanCity = city;
  if (city.includes("郡")) {
    // 郡名を取り除く (例: 三重郡菰野町 ➔ 菰野町)
    cleanCity = city.replace(/^.+?郡/, "");
  }
  return cleanCity + "地区";
}

const YOKKAICHI_DISTRICT_MASTER = [
  {
    "city": "四日市市",
    "town": "天カ須賀",
    "district": "富洲原地区"
  },
  {
    "city": "四日市市",
    "town": "天カ須賀新田",
    "district": "富洲原地区"
  },
  {
    "city": "四日市市",
    "town": "住吉町",
    "district": "富洲原地区"
  },
  {
    "city": "四日市市",
    "town": "羽津",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "羽津町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "羽津山町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "大宮町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "霞",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "金場町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "城北町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "垂坂町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "別名",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "別名町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "別名１丁目",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "別名２丁目",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "別名３丁目",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "別名４丁目",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "別名５丁目",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "別名６丁目",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "富士町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "緑丘町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "山手町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "八幡町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "大字羽津",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "東茂福町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "茂福",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "茂福町",
    "district": "羽津地区"
  },
  {
    "city": "四日市市",
    "town": "常磐",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "常磐町",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "ときわ",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "ときわ１丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "ときわ２丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "ときわ３丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "ときわ４丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "ときわ５丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "赤堀",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "赤堀町",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "赤堀南町",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "赤堀１丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "赤堀２丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "赤堀３丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "城東町",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "伊倉",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "伊倉１丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "伊倉２丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "伊倉３丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "久保田",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "久保田１丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "久保田２丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "芝田",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "芝田１丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "芝田２丁目",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "大字赤堀",
    "district": "常磐地区"
  },
  {
    "city": "四日市市",
    "town": "大字日永",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "日永",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "日永１丁目",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "日永２丁目",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "日永３丁目",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "日永４丁目",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "日永５丁目",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "日永東",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "日永西",
    "district": "日永地区"
  },
  {
    "city": "四日市市",
    "town": "大字塩浜",
    "district": "塩浜地区"
  },
  {
    "city": "四日市市",
    "town": "塩浜",
    "district": "塩浜地区"
  },
  {
    "city": "四日市市",
    "town": "塩浜本町",
    "district": "塩浜地区"
  },
  {
    "city": "四日市市",
    "town": "大字四郷",
    "district": "四郷地区"
  },
  {
    "city": "四日市市",
    "town": "大字内部",
    "district": "内部地区"
  },
  {
    "city": "四日市市",
    "town": "大字河原田",
    "district": "河原田地区"
  },
  {
    "city": "四日市市",
    "town": "大字水沢",
    "district": "水沢地区"
  },
  {
    "city": "四日市市",
    "town": "大字楠",
    "district": "楠地区"
  },
  {
    "city": "四日市市",
    "town": "大字小山田",
    "district": "小山田地区"
  },
  {
    "city": "四日市市",
    "town": "山田町",
    "district": "小山田地区"
  },
  {
    "city": "四日市市",
    "town": "富田",
    "district": "富田地区"
  },
  {
    "city": "四日市市",
    "town": "富田一色町",
    "district": "富田地区"
  },
  {
    "city": "四日市市",
    "town": "川島町",
    "district": "川島地区"
  },
  {
    "city": "四日市市",
    "town": "神前町",
    "district": "神前地区"
  },
  {
    "city": "四日市市",
    "town": "桜町",
    "district": "桜地区"
  },
  {
    "city": "四日市市",
    "town": "生桑町",
    "district": "三重地区"
  },
  {
    "city": "四日市市",
    "town": "県町",
    "district": "県地区"
  },
  {
    "city": "四日市市",
    "town": "平尾町",
    "district": "八郷地区"
  },
  {
    "city": "四日市市",
    "town": "朝明町",
    "district": "下野地区"
  },
  {
    "city": "四日市市",
    "town": "大矢知町",
    "district": "大矢知地区"
  },
  {
    "city": "四日市市",
    "town": "小牧町",
    "district": "保々地区"
  },
  {
    "city": "四日市市",
    "town": "阿倉川町",
    "district": "海蔵地区"
  },
  {
    "city": "四日市市",
    "town": "東新町",
    "district": "橋北地区"
  },
  {
    "city": "四日市市",
    "town": "安島",
    "district": "中部地区"
  }
];
