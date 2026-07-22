/**
 * POSTING MAP - Reference Master Setup Script
 * Copies national address & postal master files from reference/ to 01_MASTER/Reference/
 */

const fs = require('fs');
const path = require('path');

const REF_DIR = path.join(__dirname, '..', 'reference');
const MASTER_REF_DIR = path.join(__dirname, '..', 'FIELD_OPERATIONS_PLATFORM', '01_MASTER', 'Reference');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function copyFileSafe(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    const stat = fs.statSync(dest);
    console.log(`✅ Copied: ${path.basename(src)} (${(stat.size / 1024 / 1024).toFixed(2)} MB) -> ${dest}`);
  } else {
    console.warn(`⚠️ Source file not found: ${src}`);
  }
}

function main() {
  console.log("🚀 Setting up 01_MASTER Reference Data...");

  const postalDir = path.join(MASTER_REF_DIR, 'Postal');
  const addressDir = path.join(MASTER_REF_DIR, 'Address');

  ensureDir(postalDir);
  ensureDir(addressDir);

  // Copy National Masters
  copyFileSafe(path.join(REF_DIR, 'KEN_ALL.CSV'), path.join(postalDir, 'KEN_ALL.CSV'));
  copyFileSafe(path.join(REF_DIR, 'postal.csv'), path.join(addressDir, 'postal.csv'));
  copyFileSafe(path.join(REF_DIR, '三重県選挙区区割り.csv'), path.join(MASTER_REF_DIR, '三重県選挙区区割り.csv'));

  console.log("\n🎉 Reference Master Setup Completed!");
}

main();
