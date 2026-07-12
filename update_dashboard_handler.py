import re

file_path = '/Volumes/SSD_DATA/posting-map-system/src/api/dashboard/DashboardHandler.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Add import
if 'RepositoryPerformanceProfiler' not in content:
    content = content.replace(
        "import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';",
        "import { ExceptionMapper } from '@core/exceptions/ExceptionMapper';\nimport { RepositoryPerformanceProfiler } from '@infra/repository/profiler/RepositoryPerformanceProfiler';"
    )

# Add finally block
replacement = """    } catch (error: any) {
      const apiException = FieldApiMapper.toApiException(error, request.requestId);
      return ExceptionMapper.toResponse(apiException, request, context);
    } finally {
      RepositoryPerformanceProfiler.getInstance().reset();
    }
  }
}
"""

content = re.sub(r'    \} catch \(error: any\) \{\n      const apiException = FieldApiMapper\.toApiException\(error, request\.requestId\);\n      return ExceptionMapper\.toResponse\(apiException, request, context\);\n    \}\n  \}\n\}\n', replacement, content)

with open(file_path, 'w') as f:
    f.write(content)
