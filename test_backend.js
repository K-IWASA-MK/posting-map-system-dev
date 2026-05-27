const fs = require('fs');

const CONFIG = {
  CHUNK_SIZE: 10,
  SHEET_TEMPLATE: "原本",
};

function extractCityName(addr) {
  if (addr.indexOf("四日市市") === 0) return "四日市市";
  return addr.match(/^(.+?[市郡])/) ? addr.match(/^(.+?[市郡])/)[1] : "エリア";
}

function extractDistrictAddresses(districtCsvPath, postalCsvPath, targetDistrict, targetPref) {
    const districtData = fs.readFileSync(districtCsvPath, 'utf8').split('\n').map(l => l.split(','));
    const postalData = fs.readFileSync(postalCsvPath, 'utf8').split('\n').map(l => l.split(','));

    const targetRules = [];
    for (let i = 1; i < districtData.length; i++) {
        const row = districtData[i];
        if (row && row[0] === targetDistrict && row[1] === targetPref) {
            targetRules.push({ city: row[2], townArea: row[3] || "" });
        }
    }

    const addressMap = new Map();
    targetRules.forEach(rule => {
        if (rule.townArea) {
            const addrString = rule.townArea.startsWith(rule.city) ? rule.townArea : rule.city + rule.townArea;
            addressMap.set(addrString, "MATCHED");
        } else {
            postalData.forEach(row => {
                if (row && row[6] === targetPref && row[7] === rule.city) {
                    const townRaw = row[8];
                    if (townRaw && townRaw !== "以下に掲載がない場合") {
                        const addr = rule.city + townRaw.replace(/（.*?）/g, "");
                        addressMap.set(addr, "POSTAL_EXPANDED");
                    }
                }
            });
        }
    });

    return Array.from(addressMap, ([address, type]) => ({ address }));
}

function simulateBatch(addresses, startIndex = 0) {
  let cityCounts = {};
  let lastCity = "";
  let itemsInBlock = 0;
  const chunkSize = CONFIG.CHUNK_SIZE;

  // 1. Simulation loop (restore state)
  for (let i = 0; i < startIndex; i++) {
    const c = extractCityName(addresses[i].address);
    if (c !== lastCity || itemsInBlock >= chunkSize) {
      cityCounts[c] = (cityCounts[c] || 0) + 1;
      itemsInBlock = 0;
      lastCity = c;
    }
    itemsInBlock++;
  }

  console.log(`[Simulation State at startIndex=${startIndex}]`);
  console.log(`cityCounts:`, cityCounts);
  console.log(`lastCity: "${lastCity}"`);
  console.log(`itemsInBlock: ${itemsInBlock}`);

  const generatedSheets = {}; // { sheetName: [addresses] }

  // 2. Main loop
  for (let currentIndex = startIndex; currentIndex < addresses.length; currentIndex++) {
    const currentAddr = addresses[currentIndex];
    const currentCity = extractCityName(currentAddr.address);

    if (currentCity !== lastCity || itemsInBlock >= chunkSize) {
      cityCounts[currentCity] = (cityCounts[currentCity] || 0) + 1;
      itemsInBlock = 0;
      lastCity = currentCity;
    }

    let sheetName =
      cityCounts[currentCity] === 1
        ? currentCity
        : `${currentCity}(${cityCounts[currentCity]})`;

    if (!generatedSheets[sheetName]) {
      generatedSheets[sheetName] = [];
    }

    generatedSheets[sheetName].push({
      index: currentIndex,
      address: currentAddr.address,
      rowInSheet: itemsInBlock + 2
    });

    itemsInBlock++;
  }

  return generatedSheets;
}

const targetDistrict = "第2区";
const targetPref = "三重県";
const addresses = extractDistrictAddresses(
    'data/三重県選挙区区割り.csv',
    'data/MIE_POSTAL.CSV',
    targetDistrict,
    targetPref
);

// 市町村名でソートして、同じ市町村の住所データが連続するように保証する
addresses.sort((a, b) => {
  const cityA = extractCityName(a.address);
  const cityB = extractCityName(b.address);
  return cityA.localeCompare(cityB, 'ja');
});

console.log(`Addresses total: ${addresses.length}`);
const sheets = simulateBatch(addresses, 0);


console.log("\n[Generated Sheets Summary]");
Object.entries(sheets).forEach(([sheetName, items]) => {
  console.log(`Sheet: "${sheetName}" -> ${items.length} items`);
  items.forEach(item => {
    console.log(`  Row ${item.rowInSheet}: [Index ${item.index}] ${item.address}`);
  });
});

