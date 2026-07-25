import * as path from 'path';
import { MapDataGenerator } from './src/platform/spatial-verification-v3/generator/MapDataGenerator';

async function main() {
  const csvPath = path.join(__dirname, 'FIELD_OPERATIONS_PLATFORM/03_BRANCH/三重県/三重第3区/output/MIE-03_FINAL_VERIFIED_AREAS.csv');
  const outputDir = path.join(__dirname, 'MIE-03_SPATIAL_VERIFICATION');
  const rootDir = __dirname;

  const generator = new MapDataGenerator();
  await generator.generateAndVerify(csvPath, outputDir, rootDir);
}

main().catch(err => {
  console.error("Fatal Error during Spatial Verification:", err);
  process.exit(1);
});
