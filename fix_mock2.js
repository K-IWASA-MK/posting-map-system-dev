const fs = require('fs');

const files = [
  '/Volumes/SSD_DATA/posting-map-system/tests/unit/typescript/application/dashboard/DashboardApplicationService.test.ts',
  '/Volumes/SSD_DATA/posting-map-system/tests/unit/typescript/application/dashboard/DashboardSummaryService.test.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /(class MockActivityRepository implements IActivityRepository \{)/;
    if (!content.includes('findById(id: string)')) {
      content = content.replace(regex, '$1\n  async findById(id: string): Promise<DistributionActivity | undefined> { return undefined; }');
      fs.writeFileSync(file, content, 'utf8');
    }
  }
}
