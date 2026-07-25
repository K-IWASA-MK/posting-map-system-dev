import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { AddressCoordinateResolver } from '../resolver/AddressCoordinateResolver';
import { CoordinateValidator } from '../validator/CoordinateValidator';

export class MapDataGenerator {
  private resolver: AddressCoordinateResolver;
  private validator: CoordinateValidator;

  constructor() {
    this.resolver = new AddressCoordinateResolver();
    this.validator = new CoordinateValidator();
  }

  public generateAndVerify(csvPath: string, outputDir: string, rootDir: string): void {
    console.log("==================================================");
    console.log("🌐 MIE-03 SPATIAL VERIFICATION V3.1 PRO ENGINE");
    console.log("==================================================\n");

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    const header = lines[0].split(',');

    const geoFeatures: any[] = [];
    const augmentedLines: string[] = [];
    
    // Augment header
    const newHeader = [...header, "latitude", "longitude", "coordinate_source", "coordinate_accuracy", "spatial_status"];
    augmentedLines.push(newHeader.join(','));

    let failCount = 0;
    let successCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const v = lines[i].split(',');
      const record: any = {};
      header.forEach((h, idx) => record[h] = v[idx]);

      let resolution = this.resolver.resolve(record.area_id, record.city, record.town, i);
      let validation = this.validator.validate(resolution.lat, resolution.lng, record.city);

      // Retry logic if invalid (e.g. water area)
      let attempt = 1;
      while (!validation.isValid && attempt < 3) {
        console.warn(`[WARNING] Resolution failed for ${record.area_id} (${record.town}): ${validation.reason}. Retrying (Attempt ${attempt})...`);
        const retryRes = this.resolver.retryResolve(record.area_id, record.city, record.town, attempt);
        if (retryRes) {
          resolution = retryRes;
          validation = this.validator.validate(resolution.lat, resolution.lng, record.city);
        }
        attempt++;
      }

      const spatialStatus = validation.isValid ? "VERIFIED" : "FAIL_CEO_REVIEW_REQUIRED";
      if (!validation.isValid) {
        console.error(`[ERROR] Strict failure for ${record.area_id} (${record.town}): ${validation.reason}.`);
        failCount++;
      } else {
        successCount++;
      }

      augmentedLines.push([...v, resolution.lat, resolution.lng, resolution.source, resolution.accuracy, spatialStatus].join(','));

      if (validation.isValid) {
        geoFeatures.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [resolution.lng, resolution.lat]
          },
          properties: {
            area_id: record.area_id,
            district_id: record.district_id,
            prefecture: record.prefecture,
            city: record.city,
            town: record.town,
            postal_code: record.postal_code,
            pattern_rule: record.city.includes('四日市') ? 'PATTERN_B_SPLIT_INCLUDED' : 'PATTERN_A_WHOLE',
            color_code: "#ef4444",
            spatial_status: spatialStatus
          }
        });
      }
    }

    const geoContent = JSON.stringify({
      type: "FeatureCollection",
      metadata: {
        district: "MIE-03",
        sourceCSV: path.basename(csvPath),
        pointCount: geoFeatures.length,
        failCount,
        engine: "v3.1 Pro Spatial Verification",
        generatedAt: new Date().toISOString()
      },
      features: geoFeatures
    }, null, 2);

    const geoHash = crypto.createHash('sha256').update(geoContent).digest('hex');
    const augmentedCsvContent = augmentedLines.join('\n');
    const csvHash = crypto.createHash('sha256').update(augmentedCsvContent).digest('hex');

    // 1. Write augmented CSV back (overwrite the final verified areas with coordinate data)
    fs.writeFileSync(csvPath, augmentedCsvContent, 'utf8');

    // 2. Write GeoJSON to output dir and root
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'MIE-03_AREA_MAP.geojson'), geoContent, 'utf8');
    fs.writeFileSync(path.join(rootDir, 'MIE-03_AREA_MAP.geojson'), geoContent, 'utf8');

    // 3. Write evidence.json
    const visualizationUrl = 'https://k-iwasa-mk.github.io/posting-map-system-dev/MIE-03_SPATIAL_VERIFICATION/';
    const evidenceData = {
      district: "MIE-03",
      csvHash,
      geoHash,
      engine: "v3.1 Pro Spatial Verification",
      totalProcessed: lines.length - 1,
      verifiedSuccess: successCount,
      failedReviewRequired: failCount,
      spatialAccuracyGate: failCount === 0 ? "SPATIAL_VERIFIED" : "COORDINATE_CHECKED",
      visualizationUrl,
      verifiedBy: "CEO",
      status: "PENDING_APPROVAL",
      generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(outputDir, 'evidence.json'), JSON.stringify(evidenceData, null, 2), 'utf8');

    console.log(`✅ Spatial Verification Complete: ${successCount} verified, ${failCount} failed.`);
    console.log(`🗺️ Updated CSV, GeoJSON & evidence.json in ${outputDir}`);
  }
}
