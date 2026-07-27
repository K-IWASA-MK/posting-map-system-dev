const gasWebAppUrl = 'https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec';
const apiKey = 'valid-api-key';

async function main() {
  let isRunning = true;
  let attempt = 1;

  while (isRunning) {
    const url = `${gasWebAppUrl}?action=triggerBatch&version=v2${attempt === 1 ? '&triggerBatch=true' : ''}&apiKey=${apiKey}`;
    console.log(`📡 [Attempt ${attempt}] Calling WebApp: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`📬 Response:`, JSON.stringify(result, null, 2));

    if (result.success) {
      if (result.status === 'running') {
        console.log(`⏳ Batch status is still running (processed index: ${result.index}). Waiting 3 seconds before next poll...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempt++;
      } else {
        console.log('🎉 Native batch completed successfully!');
        isRunning = false;
      }
    } else {
      throw new Error(`Execution error: ${result.message}`);
    }
  }
}

main().catch(err => {
  console.error('❌ Failed to execute native GAS batch:', err);
  process.exit(1);
});
