/**
 * GAS v2 - 住所抽出モジュール
 * - CSVからの選挙区・住所データの抽出
 * - 住所文字列の正規化
 */

// =============================
// ② データ抽出 (gas.gs 完全移植)
// =============================

function extractDistrictAddresses(
  targetDistrictName = CONFIG.DEFAULT_DISTRICT,
  targetPrefecture = CONFIG.DEFAULT_PREFECTURE,
) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const districtData = getCsvOrSheetData(CONFIG.DISTRICT_CSV);
  if (!districtData) {
    ss.toast(
      `Google Drive上に「${CONFIG.DISTRICT_CSV}」が見つかりません。`,
      "エラー",
      5,
    );
    return [];
  }

  const targetRules = [];
  for (let i = 1; i < districtData.length; i++) {
    const row = districtData[i];
    if (row && row[0] === targetDistrictName && row[1] === targetPrefecture) {
      targetRules.push({ city: row[2], townArea: row[3] || "" });
    }
  }

  const postalData = getCsvOrSheetData(CONFIG.POSTAL_CSV);
  if (!postalData) {
    ss.toast(
      `Google Drive上に「${CONFIG.POSTAL_CSV}」が見つかりません。`,
      "エラー",
      5,
    );
    return [];
  }

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
          r[6] === targetPrefecture &&
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
        if (row && row[6] === targetPrefecture && row[7] === rule.city) {
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

function getCsvOrSheetData(filename) {
  const files = DriveApp.getFilesByName(filename);
  if (!files.hasNext()) return null;
  const file = files.next();
  const mime = file.getMimeType();
  if (mime === MimeType.GOOGLE_SHEETS) {
    const ss = SpreadsheetApp.open(file);
    return ss.getSheets()[0].getDataRange().getValues();
  } else {
    // UTF-8 or Shift-JIS 判別
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
    'ｻ': 'サ', 'ｼ': 'ジ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
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
