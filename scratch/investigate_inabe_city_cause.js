const fs = require('fs');
const path = require('path');

function investigateInabe() {
  console.log("==================================================");
  console.log("🕵️ INABE CITY RECORD DROP FORENSIC INVESTIGATION");
  console.log("==================================================\n");

  // 1. Check MIE_POSTAL.CSV for Inabe City
  const postalPath = path.join(__dirname, '../FIELD_OPERATIONS_PLATFORM/01_MASTER/MIE_POSTAL.CSV');
  let postalInabeTowns = [];

  if (fs.existsSync(postalPath)) {
    const lines = fs.readFileSync(postalPath, 'utf8').split('\n').filter(Boolean);
    lines.forEach(l => {
      const parts = l.split(',').map(p => p.replace(/"/g, '').trim());
      if (parts.length >= 9 && parts[2]?.includes('いなべ市')) {
        postalInabeTowns.push({
          postalCode: parts[0],
          city: parts[2],
          town: parts[3],
          kana: parts[1]
        });
      }
    });
  }

  console.log(`📫 Total Inabe City Postal Records in MIE_POSTAL.CSV: ${postalInabeTowns.length} 件`);

  // 2. Check address_database.json in master
  const addrDbPath = path.join(__dirname, '../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/master/address_database.json');
  const addrDb = JSON.parse(fs.readFileSync(addrDbPath, 'utf8'));
  const inabeDbEntry = addrDb.municipalities.find(m => m.name.includes('いなべ'));

  console.log(`\n🏫 Inabe City Towns listed in address_database.json: ${inabeDbEntry?.towns?.length || 0} 件`);
  if (inabeDbEntry) {
    console.log("Inabe Db Towns:", inabeDbEntry.towns.map(t => t.name).join(', '));
  }

  // 3. Check DistrictExtractor.ts logic
  const extractorPath = path.join(__dirname, '../src/platform/data-platform/extractor/DistrictExtractor.ts');
  const extractorContent = fs.readFileSync(extractorPath, 'utf8');

  console.log("\n🔍 DistrictExtractor.ts sample lines:");
  const extractorLines = extractorContent.split('\n').slice(0, 60);
  console.log(extractorLines.join('\n'));

  // 4. Compare legacy GAS script v2_extract.js for Inabe
  const v2ExtractPath = path.join(__dirname, '../projects/posting-map/active/gas/v2_extract.js');
  let v2Content = '';
  if (fs.existsSync(v2ExtractPath)) {
    v2Content = fs.readFileSync(v2ExtractPath, 'utf8');
  }

  console.log("\n📄 Summary of Findings:");
  console.log(`1. In MIE_POSTAL.CSV, Inabe City actually has ${postalInabeTowns.length} distinct postal address entries!`);
  console.log(`2. However, master/address_database.json currently ONLY contains ${inabeDbEntry?.towns?.length} towns for Inabe City.`);
}

investigateInabe();
