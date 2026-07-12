const fs = require('fs');

const files = [
  '/Volumes/SSD_DATA/posting-map-system/tests/unit/typescript/application/dashboard/DashboardApplicationService.test.ts',
  '/Volumes/SSD_DATA/posting-map-system/tests/unit/typescript/application/dashboard/DashboardSummaryService.test.ts',
  '/Volumes/SSD_DATA/posting-map-system/tests/unit/typescript/application/field/ActivityApplicationService.test.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('async findById(id: string)')) {
      content = content.replace(
        'class MockActivityRepository implements IActivityRepository {',
        'class MockActivityRepository implements IActivityRepository {\n  async findById(id: string): Promise<DistributionActivity | undefined> { return undefined; }'
      );
      fs.writeFileSync(file, content, 'utf8');
    }
  }
}
