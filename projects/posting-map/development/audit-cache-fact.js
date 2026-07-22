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
  console.log("📊 Fetching Live Summary & Cache Stats via getSummary API...");
  const res = await fetchJson(`${API_URL}?action=getSummary`);
  console.log("Raw Response Keys:", Object.keys(res));
  if (res.data) console.log("Data Keys:", Object.keys(res.data));

  const list = res.summary || (res.data ? res.data.summary : []);
  const stats = res.stats || (res.data ? res.data.stats : {});

  console.log("\n========================================");
  console.log("🏆 【スプレッドシート キャッシュ集計 リアルタイム実測結果】");
  console.log("========================================");
  console.log(`総エリア数: ${list.length} エリア`);
  console.log(`総世帯/住所数: ${stats.totalHouses || stats.totalAddresses || 0} 件`);
  console.log("----------------------------------------");
  if (list.length > 0) {
    console.log("全エリア一覧:");
    list.forEach((item, idx) => {
      const name = item.name || item.areaName || item[0];
      const count = item.total || item.totalHouses || item[1];
      console.log(`  [Area #${idx + 1}] エリア名: "${name}" (総数: ${count})`);
    });
  }
  console.log("========================================\n");
}

main().catch(console.error);
