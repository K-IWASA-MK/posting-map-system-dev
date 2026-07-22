const https = require('https');

const API_URL = "https://script.google.com/macros/s/AKfycbwy8RZPeQKfwmM_zObRDFpjL-SKWyN_3tAWjK29oWQ6l_QB2rO7_9vqZBM4MBfHcyoa/exec";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log("📐 Triggering Physical Tab Sort & Final Cache Rebuild...");
  const res = await fetchJson(`${API_URL}?action=verifyDeployment&sortTabs=true`);
  console.log("  - sortTabs:", res);
  
  const showRes = await fetchJson(`${API_URL}?action=verifyDeployment&showAll=true`);
  console.log("  - showAll & Cache Rebuild:", showRes.message);
}

main().catch(console.error);
