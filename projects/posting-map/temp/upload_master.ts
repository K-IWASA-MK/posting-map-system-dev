import * as fs from 'fs';

const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec';
const apiKey = 'valid-api-key';
const csvPath = '/Volumes/SSD_DATA/AI Development OS/projects/posting-map/data/MIE03_ADDRESS_MASTER.csv';

async function main() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }
  const csvData = fs.readFileSync(csvPath, 'utf8');
  console.log(`📖 Loaded CSV file of length: ${csvData.length} characters.`);

  const url = `${gasWebAppUrl}?action=uploadMaster&version=v2&apiKey=${apiKey}`;
  console.log(`📡 Uploading master data to GAS WebApp...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvData })
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('📬 Response:', JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
