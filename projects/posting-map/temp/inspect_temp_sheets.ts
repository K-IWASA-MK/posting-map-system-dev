const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec';
const apiKey = 'valid-api-key';

async function main() {
  // Let's call inspectSheets or debugProperties or testParse. Wait, let's add a handler to inspect __TEMP_ADDRESSES__ content!
  // Oh, we can add a test endpoint to inspect __TEMP_ADDRESSES__!
  const url = `${gasWebAppUrl}?action=testTempRows&apiKey=${apiKey}`;
  const response = await fetch(url);
  const result = await response.json();
  console.log('📬 Response:', JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
