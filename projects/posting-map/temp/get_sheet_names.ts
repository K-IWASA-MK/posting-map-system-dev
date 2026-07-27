const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec';
const apiKey = 'valid-api-key';

async function main() {
  const url = `${gasWebAppUrl}?action=getDashboardData&apiKey=${apiKey}`;
  const response = await fetch(url);
  const result = await response.json();
  
  const sheetNames = result.summary.map((s: any) => `${s.name} (${s.total} rows)`);
  console.log(`📋 Total sheets on spreadsheet: ${sheetNames.length}`);
  console.log(JSON.stringify(sheetNames, null, 2));
}

main().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
