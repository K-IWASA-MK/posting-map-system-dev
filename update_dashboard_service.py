import re

file_path = '/Volumes/SSD_DATA/posting-map-system/src/application/dashboard/services/DashboardApplicationService.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Add import
if 'RepositoryPerformanceProfiler' not in content:
    content = content.replace(
        "import { WorkspaceUrl } from '@domain/workspace/valueobjects/WorkspaceUrl';",
        "import { WorkspaceUrl } from '@domain/workspace/valueobjects/WorkspaceUrl';\nimport { RepositoryPerformanceProfiler } from '../../../infrastructure/repository/profiler/RepositoryPerformanceProfiler';"
    )

# Remove stats initialization
content = re.sub(r'let stats = \{ activityRead: 0, holdingRead: 0, staffRead: 0, workspaceRead: 0, totalAccess: 0 \};\n', '', content)

# Remove stats increments
content = re.sub(r'\s*stats\.workspaceRead\+\+; stats\.totalAccess\+\+;\n', '\n', content)
content = re.sub(r'\s*stats\.staffRead\+\+; stats\.totalAccess\+\+;\n', '\n', content)
content = re.sub(r'\s*stats\.holdingRead\+\+; stats\.totalAccess\+\+;\n', '\n', content)
content = re.sub(r'\s*stats\.activityRead\+\+; stats\.totalAccess\+\+;\n', '\n', content)

# Replace performanceMetrics and console.log
replacement = """    const t1 = Date.now();
    const profilerMetrics = RepositoryPerformanceProfiler.getInstance().getMetrics();
    const performanceMetrics = {
      responseTimeMs: t1 - t0,
      spreadsheetReadCount: profilerMetrics.spreadsheetReadCount,
      spreadsheetWriteCount: profilerMetrics.spreadsheetWriteCount,
      repositoryCallCount: profilerMetrics.repositoryCallCount,
      repositoryExecutionCount: profilerMetrics.repositoryExecutionCount,
      sheetMetrics: profilerMetrics.sheetMetrics,
      activityRecordCount: allActivitiesRaw.length,
      holdingRecordCount: allHoldings.length,
      staffRecordCount: staffList.length,
      generatedAt: new Date().toISOString(),
      apiVersion: '1.0',
      dashboardVersion: 'v2.4'
    };

    console.log(`[Dashboard Performance] Activity Read : ${profilerMetrics.sheetMetrics.find(m => m.sheetName === 'Activity')?.readCount || 0}, Holding Read : ${profilerMetrics.sheetMetrics.find(m => m.sheetName === 'Flyers')?.readCount || 0}, Staff Read : ${profilerMetrics.sheetMetrics.find(m => m.sheetName === 'Staff')?.readCount || 0}, Workspace Read : ${profilerMetrics.sheetMetrics.find(m => m.sheetName === 'Workspaces')?.readCount || 0}, Spreadsheet Access : ${profilerMetrics.spreadsheetReadCount + profilerMetrics.spreadsheetWriteCount}, Processing Time : ${t1 - t0}ms`);
"""

content = re.sub(r'    const t1 = Date\.now\(\);\n    const performanceMetrics = \{[\s\S]*?console\.log\(`\[Dashboard Performance\][^`]*`\);\n', replacement, content)

with open(file_path, 'w') as f:
    f.write(content)
