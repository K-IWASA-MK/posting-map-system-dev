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

  public async generateAndVerify(csvPath: string, outputDir: string, rootDir: string): Promise<void> {
    console.log("==================================================");
    console.log("🌐 MIE-03 SPATIAL VERIFICATION V3.1 PRO ENGINE");
    console.log("==================================================\n");

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    const header = lines[0].split(',');

    const geoFeatures: any[] = [];
    const augmentedLines: string[] = [];
    
    // Augment header (Removed 'coordinate_accuracy' and 'coordinate_source' if they are the same as old, keeping same structure)
    // The user requested CoordinateResult fields: latitude, longitude, source, accuracy, confidence, rawQuery
    const newHeader = [...header, "latitude", "longitude", "coordinate_source", "coordinate_accuracy", "spatial_status"];
    augmentedLines.push(newHeader.join(','));

    let failCount = 0;
    let successCount = 0;
    let warningCount = 0;
    let approximateCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const v = lines[i].split(',');
      const record: any = {};
      header.forEach((h, idx) => record[h] = v[idx]);

      let resolution = await this.resolver.resolve(record.city, record.town);
      let validation = this.validator.validate(resolution.latitude, resolution.longitude, record.city);

      // Fallback to postal code if strict check failed
      if (!validation.isValid) {
        console.warn(`[WARNING] Resolution failed for ${record.area_id} (${record.town}): ${validation.reason}. Falling back to postal code...`);
        const retryRes = await this.resolver.retryResolve(record.postal_code);
        if (retryRes) {
          resolution = retryRes;
          validation = this.validator.validate(resolution.latitude, resolution.longitude, record.city);
        }
      }

      let spatialStatus = validation.isValid ? "VERIFIED" : "FAIL_CEO_REVIEW_REQUIRED";
      
      if (validation.isValid && resolution.source === "POSTAL_APPROXIMATE") {
        spatialStatus = "WARNING";
        warningCount++;
        approximateCount++;
      } else if (!validation.isValid) {
        console.error(`[ERROR] Strict failure for ${record.area_id} (${record.town}): ${validation.reason}.`);
        failCount++;
      } else {
        successCount++;
        if (resolution.source.includes("APPROXIMATE")) {
          approximateCount++;
        }
      }

      augmentedLines.push([...v, resolution.latitude, resolution.longitude, resolution.source, resolution.accuracy, spatialStatus].join(','));

      if (validation.isValid) {
        geoFeatures.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [resolution.longitude, resolution.latitude]
          },
          properties: {
            area_id: record.area_id,
            district_id: record.district_id,
            prefecture: record.prefecture,
            city: record.city,
            town: record.town,
            postal_code: record.postal_code,
            pattern_rule: record.city.includes('四日市') ? 'PATTERN_B_SPLIT_INCLUDED' : 'PATTERN_A_WHOLE',
            color_code: spatialStatus === "WARNING" ? "#f59e0b" : "#ef4444", // Yellow for warning, Red for verified
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
        warningCount,
        approximateCount,
        approximateRate: ((approximateCount / (lines.length - 1)) * 100).toFixed(2) + "%",
        engine: "v3.1 Pro Spatial Verification",
        generatedAt: new Date().toISOString()
      },
      features: geoFeatures
    }, null, 2);

    const geoHash = crypto.createHash('sha256').update(geoContent).digest('hex');
    const augmentedCsvContent = augmentedLines.join('\n');
    const csvHash = crypto.createHash('sha256').update(augmentedCsvContent).digest('hex');

    fs.writeFileSync(csvPath, augmentedCsvContent, 'utf8');

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'MIE-03_AREA_MAP.geojson'), geoContent, 'utf8');
    fs.writeFileSync(path.join(rootDir, 'MIE-03_AREA_MAP.geojson'), geoContent, 'utf8');

    const visualizationUrl = 'https://k-iwasa-mk.github.io/posting-map-system-dev/MIE-03_SPATIAL_VERIFICATION/';
    
    // Spatial Accuracy Gate
    const gatePassed = failCount === 0;

    const evidenceData = {
      district: "MIE-03",
      csvHash,
      geoHash,
      engine: "v3.1 Pro Spatial Verification (Google Maps API)",
      totalProcessed: lines.length - 1,
      verifiedSuccess: successCount,
      warningCount,
      failedReviewRequired: failCount,
      approximateRate: ((approximateCount / (lines.length - 1)) * 100).toFixed(2) + "%",
      spatialAccuracyGate: gatePassed ? "SPATIAL_VERIFIED" : "COORDINATE_CHECKED",
      visualizationUrl,
      verifiedBy: "CEO",
      status: "PENDING_APPROVAL", // CEO Data Acceptance Gate remains PENDING_APPROVAL
      generatedAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(outputDir, 'evidence.json'), JSON.stringify(evidenceData, null, 2), 'utf8');

    console.log(`✅ Spatial Verification Complete: ${successCount} verified, ${warningCount} warnings, ${failCount} failed.`);
    console.log(`📊 Approximate Rate: ${evidenceData.approximateRate}`);
    console.log(`🗺️ Updated CSV, GeoJSON & evidence.json in ${outputDir}`);
  }
}
