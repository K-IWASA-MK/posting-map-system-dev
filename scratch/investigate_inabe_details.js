const fs = require('fs');
const path = require('path');

function investigateInabeDetails() {
  console.log("==================================================");
  console.log("🕵️ INABE CITY FORENSIC ANALYSIS");
  console.log("==================================================\n");

  // 1. Read MIE-03_FINAL_VERIFIED_AREAS.csv
  const csvPath = path.join(__dirname, '../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/output/MIE-03_FINAL_VERIFIED_AREAS.csv');
  const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(Boolean);
  const header = lines[0].split(',');
  const records = lines.slice(1).map(l => {
    const v = l.split(',');
    const o = {};
    header.forEach((h, i) => o[h] = v[i]);
    return o;
  });

  const inabeRecords = records.filter(r => r.city.includes('いなべ'));
  console.log(`📊 Inabe City Records in Current SSOT CSV: ${inabeRecords.length} 件`);

  // Print first 20 records of Inabe City in SSOT CSV
  console.log("\nSample Inabe City Records in SSOT CSV:");
  inabeRecords.slice(0, 20).forEach((r, i) => {
    console.log(` - [${i+1}] ${r.area_id} | ${r.city} | ${r.town} | ${r.postal_code}`);
  });

  // 2. Read master/address_database.json
  const dbPath = path.join(__dirname, '../FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/master/address_database.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const inabeDb = db.municipalities.find(m => m.name.includes('いなべ'));

  console.log("\n🏫 Master address_database.json Inabe Entry:");
  console.log(JSON.stringify(inabeDb, null, 2));

  // 3. Inspect postal reference file for Inabe City
  const refPath = path.join(__dirname, '../FIELD_OPERATIONS_PLATFORM/01_MASTER/Reference/三重県選挙区区割り.csv');
  if (fs.existsSync(refPath)) {
    console.log("\n📄 Reference 三重県選挙区区割り.csv snippet for Inabe:");
    const refLines = fs.readFileSync(refPath, 'utf8').split('\n');
    const inabeRef = refLines.filter(l => l.includes('いなべ'));
    console.log(inabeRef.join('\n'));
  }
}

investigateInabeDetails();
