const fs = require('fs');
const file = '/Volumes/SSD_DATA/posting-map-system/src/infrastructure/repository/field/SpreadsheetStaffRepository.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('RepositoryPerformanceProfiler')) {
  content = content.replace(
    "import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';",
    "import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';\nimport { RepositoryPerformanceProfiler } from '../profiler/RepositoryPerformanceProfiler';"
  );
}

function wrapMethod(methodName) {
  const regex = new RegExp(`(public async ${methodName}\\([^{]*\\): Promise<[^>]+> \\{)([\\s\\S]*?)(^  \\})`, 'm');
  const match = content.match(regex);
  if (match) {
    if (!match[2].includes('RepositoryPerformanceProfiler.getInstance()')) {
      const newBody = `\n    const profiler = RepositoryPerformanceProfiler.getInstance();\n    profiler.incrementRepositoryCall('StaffRepository');\n    const startTime = Date.now();\n\n    try {${match[2]}    } finally {\n      profiler.addExecutionTime(Date.now() - startTime);\n    }\n`;
      content = content.replace(regex, `$1${newBody}$3`);
    }
  }
}

wrapMethod('findByStaffNo');
wrapMethod('findByLineUserId');
wrapMethod('findByWorkspace');
wrapMethod('findNewStaffByMonth');
wrapMethod('findAll');
wrapMethod('getNextStaffNo');
wrapMethod('save');

fs.writeFileSync(file, content, 'utf8');
