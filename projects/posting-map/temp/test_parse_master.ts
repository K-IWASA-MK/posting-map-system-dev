const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec';
const apiKey = 'valid-api-key';

async function main() {
  const url = `${gasWebAppUrl}?action=testParse&apiKey=${apiKey}`;
  const response = await fetch(url);
  const result = await response.json();
  console.log('📬 Response:', JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
